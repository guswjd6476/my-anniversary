'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Image from 'next/image';

// Import the User type from supabase.auth
import { User as SupabaseUser } from '@supabase/auth-js';

export default function UploadForm() {
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null); // Use the imported Supabase User type
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const session = await supabase.auth.getSession(); // Get the session
            setUser(session.data?.session?.user || null); // Update user

            // Subscribe to authentication state changes
            const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null); // Update on auth state change
            });

            // Cleanup function to unsubscribe
            return () => {
                authListener?.subscription.unsubscribe();
            };
        };

        fetchSession();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(selectedFiles);
        setPreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)));
    };

    const onUploadSuccess = () => {
        alert('업로드 성공!');
        router.push('/'); // Redirect to the homepage
    };

    const handleUpload = async () => {
        if (!user) {
            alert('로그인 후 업로드가 가능합니다!');
            return;
        }

        if (files.length === 0 || !description || !eventDate) {
            alert('사진, 설명, 날짜를 입력해주세요!');
            return;
        }

        try {
            setUploading(true);
            const uploadedImageUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `public/${fileName}`;

                const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
                uploadedImageUrls.push(data.publicUrl);
            }

            const { error: insertError } = await supabase.from('posts').insert([
                {
                    image_urls: uploadedImageUrls,
                    description,
                    event_date: eventDate,
                    user_email: user?.email, // Use the `email` from Supabase's `User` type
                    user_id: user?.id, // Use the `id` from Supabase's `User` type
                },
            ]);
            if (insertError) throw insertError;

            setFiles([]);
            setPreviewUrls([]);
            setDescription('');
            setEventDate('');
            onUploadSuccess();
        } catch (error: unknown) {
            console.error('Upload error:', error);

            // Handle error if it is an instance of Error
            if (error instanceof Error) {
                alert(`업로드 실패! ${error.message}`);
            } else {
                alert('업로드 실패! 다시 시도해주세요.');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto my-4 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">사진 + 설명 + 날짜 업로드</h2>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="mb-2" />
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mb-2" />
            <textarea
                className="w-full border p-2 rounded mb-4"
                placeholder="사진 설명을 입력하세요..."
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <div className="mb-4 flex overflow-x-scroll space-x-2">
                {previewUrls.map((url, index) => (
                    <Image
                        key={index}
                        src={url}
                        alt="미리보기"
                        width={128}
                        height={128}
                        className="object-cover rounded-lg"
                    />
                ))}
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {uploading ? '업로드 중...' : '업로드'}
                </button>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                    뒤로가기
                </button>
            </div>
        </div>
    );
}
