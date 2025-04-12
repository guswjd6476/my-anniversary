'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
import { Upload, Calendar, ArrowLeft } from 'lucide-react';

// Import the User type from supabase.auth
import { User as SupabaseUser } from '@supabase/auth-js';

export default function UploadForm() {
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const session = await supabase.auth.getSession();
            setUser(session.data?.session?.user || null);

            const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
            });

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
        router.push('/');
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
                    user_email: user?.email,
                    user_id: user?.id,
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
        <div className="max-w-lg mx-auto my-8 bg-white p-6 rounded-xl shadow-lg">
            <label className="flex items-center justify-center w-full px-4 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition">
                <Upload size={20} className="mr-2" />
                사진 선택하기
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>

            <div className="relative mt-4">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <textarea
                className="w-full border p-3 rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="사진 설명을 입력하세요..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative w-full h-24 overflow-hidden rounded-lg border">
                            <Image src={url} alt="미리보기" layout="fill" objectFit="cover" className="rounded-lg" />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex space-x-4 mt-6">
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex items-center justify-center w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                >
                    {uploading ? '업로드 중...' : '🚀 업로드'}
                </button>
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    뒤로가기
                </button>
            </div>
        </div>
    );
}
