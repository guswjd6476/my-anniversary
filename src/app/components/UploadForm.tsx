// components/UploadForm.tsx
'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadFormProps {
    session: any;
    onUploadSuccess: () => void;
}

export default function UploadForm({ session, onUploadSuccess }: UploadFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file || !description) {
            alert('사진과 설명을 입력해주세요!');
            return;
        }
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `public/${fileName}`;

            // 1. 이미지 업로드
            const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
            if (uploadError) throw uploadError;

            // 2. 업로드한 이미지의 공개 URL 가져오기
            const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
            const imageUrl = data.publicUrl;

            // 3. 게시물 테이블에 저장 (사용자 이메일 포함)
            const { error: insertError } = await supabase.from('posts').insert([
                {
                    image_url: imageUrl,
                    description,
                    user_email: session?.user.email,
                },
            ]);
            if (insertError) throw insertError;

            alert('사진 업로드 성공!');
            setFile(null);
            setPreviewUrl(null);
            setDescription('');
            onUploadSuccess();
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('업로드 실패! 다시 시도해주세요.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto my-4 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">사진 + 설명 업로드</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2" />
            <textarea
                className="w-full border p-2 rounded mb-4"
                placeholder="사진 설명을 입력하세요..."
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            {previewUrl && (
                <div className="mb-4">
                    <img src={previewUrl} alt="미리보기" className="w-64 h-64 object-cover rounded-lg" />
                </div>
            )}
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
                {uploading ? '업로드 중...' : '업로드'}
            </button>
        </div>
    );
}
