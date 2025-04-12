'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useSession } from '../SupabaseProvider';
import Image from 'next/image';

export default function ProfileEditForm() {
    const router = useRouter();
    const { session } = useSession();
    const userId = session?.user?.id;

    const [nickname, setNickname] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [currentProfileImage, setCurrentProfileImage] = useState<string>(''); // ✅ 현재 저장된 이미지
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const fetchUserProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('nickname, profile_image')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('프로필 정보를 불러오는 중 오류 발생:', error);
                    return;
                }

                if (data) {
                    setNickname(data.nickname || '');
                    if (data.profile_image) {
                        setCurrentProfileImage(data.profile_image); // ✅ 이미지 상태 저장
                    }
                }
            } catch (error) {
                console.error('예기치 않은 오류 발생:', error);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const sanitizeFileName = (fileName: string) => {
        return fileName
            .normalize('NFC')
            .replace(/\s+/g, '_')
            .replace(/[^\w.-]/g, '')
            .toLowerCase();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(files);
            setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
        }
    };

    const uploadImages = async () => {
        if (!userId || selectedImages.length === 0) return currentProfileImage;

        setLoading(true);
        try {
            const uploadedUrls = await Promise.all(
                selectedImages.map(async (file) => {
                    const fileName = sanitizeFileName(file.name);
                    const filePath = `avatars/${userId}-${fileName}`;

                    const { error } = await supabase.storage.from('profiles').upload(filePath, file, { upsert: true });

                    if (error) throw error;

                    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles/${filePath}`;
                })
            );

            return uploadedUrls[0] || currentProfileImage;
        } catch (error) {
            console.error('이미지 업로드 오류:', error);
            alert('이미지 업로드 중 오류가 발생했습니다.');
            return currentProfileImage;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        setLoading(true);
        try {
            const uploadedImageUrl = await uploadImages();

            const { error } = await supabase
                .from('users')
                .update({ nickname, profile_image: uploadedImageUrl })
                .eq('id', userId);

            if (error) throw error;

            alert('프로필이 업데이트되었습니다.');
            router.push(`/profile/${session?.user?.email}`);
        } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">프로필 수정</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">닉네임</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="mt-1 p-2 w-full border rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">프로필 이미지</label>
                    <div className="flex space-x-2 mb-2">
                        {previewUrls.length > 0
                            ? previewUrls.map((url, index) => (
                                  <Image
                                      key={index}
                                      src={url}
                                      alt="새 프로필 미리보기"
                                      width={80}
                                      height={80}
                                      className="rounded-full"
                                  />
                              ))
                            : currentProfileImage && (
                                  <Image
                                      src={currentProfileImage}
                                      alt="현재 프로필 이미지"
                                      width={80}
                                      height={80}
                                      className="rounded-full"
                                  />
                              )}
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="mt-1" />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? '업데이트 중...' : '프로필 저장'}
                </button>
            </form>
        </div>
    );
}
