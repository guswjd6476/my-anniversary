'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function UploadForm() {
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null); // 사용자 상태 관리
    const router = useRouter();

    useEffect(() => {
        const fetchSession = async () => {
            const session = await supabase.auth.getSession(); // 비동기적으로 세션 가져오기
            setUser(session.data?.session?.user); // 세션이 있을 경우 user 업데이트

            // 인증 상태가 변경될 때마다 사용자 정보를 업데이트
            const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user); // 인증 상태 변화에 따라 업데이트
            });

            // 구독 취소 함수
            return () => {
                authListener?.subscription.unsubscribe(); // 구독 취소
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
        router.push('/'); // 첫 페이지로 이동
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
                    user_email: user?.email, // Supabase 인증 사용
                },
            ]);
            if (insertError) throw insertError;

            setFiles([]);
            setPreviewUrls([]);
            setDescription('');
            setEventDate('');
            onUploadSuccess(); // 업로드 성공 후 실행
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('업로드 실패! 다시 시도해주세요.');
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
                    <img key={index} src={url} alt="미리보기" className="w-32 h-32 object-cover rounded-lg" />
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
