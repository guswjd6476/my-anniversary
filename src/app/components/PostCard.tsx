'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
import { useSession } from '../SupabaseProvider';

interface PostCardProps {
    post: Post;
    onPostChange: () => void;
}

interface Post {
    id: string;
    description: string;
    user_email: string;
    image_urls: string | string[];
}

export default function PostCard({ post, onPostChange }: PostCardProps) {
    const [editing, setEditing] = useState(false);
    const [editingDescription, setEditingDescription] = useState(post.description);
    const [nickname, setNickname] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const router = useRouter();
    const pathname = usePathname();
    const isProfilePage = pathname?.startsWith('/profile/');
    const { session } = useSession();

    // 작성자 정보 불러오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('nickname, profile_image')
                .eq('email', post.user_email)
                .single();

            if (error) {
                console.error('유저 정보 가져오기 실패:', error.message);
            } else {
                setNickname(data.nickname);
                setAvatarUrl(data.profile_image);
            }
        };

        fetchUserInfo();
    }, [post.user_email]);

    const handleDelete = async () => {
        if (!confirm('정말로 삭제하시겠습니까?')) return;

        let imageUrls: string[] = [];
        if (typeof post.image_urls === 'string') {
            try {
                imageUrls = JSON.parse(post.image_urls);
            } catch (error) {
                console.error('이미지 URL JSON 파싱 오류:', error);
            }
        } else if (Array.isArray(post.image_urls)) {
            imageUrls = post.image_urls;
        }

        for (const imageUrl of imageUrls) {
            const storagePath = imageUrl.split('/photos/')[1];
            if (storagePath) {
                const { error: storageError } = await supabase.storage.from('photos').remove([storagePath]);
                if (storageError) {
                    console.error('이미지 삭제 오류:', storageError.message);
                }
            }
        }

        const { error } = await supabase.from('posts').delete().match({ id: post.id, user_email: session?.user.email });

        if (error) {
            alert('삭제 실패: ' + error.message);
        } else {
            alert('삭제 성공!');
            onPostChange();
        }
    };

    const handleUpdate = async () => {
        const { error } = await supabase.from('posts').update({ description: editingDescription }).eq('id', post.id);

        if (error) {
            alert('수정 실패: ' + error.message);
        } else {
            alert('수정 성공!');
            setEditing(false);
            onPostChange();
        }
    };

    const handleImageClick = () => {
        router.push(`/posts/${post.id}`);
    };

    let imageUrls: string[] = [];
    if (typeof post.image_urls === 'string') {
        try {
            imageUrls = JSON.parse(post.image_urls);
        } catch {
            imageUrls = post.image_urls.split(',').map((url) => url.trim());
        }
    } else if (Array.isArray(post.image_urls)) {
        imageUrls = post.image_urls;
    }

    const firstImage = imageUrls.length > 0 && imageUrls[0] ? imageUrls[0] : '/default-image.jpg';

    return (
        <div className={`bg-white ${isProfilePage ? '' : 'rounded-lg shadow-lg'} overflow-hidden mb-6`}>
            {!isProfilePage && (
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <Image
                            src={avatarUrl || '/default-avatar.png'}
                            alt="프로필"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="text-sm font-semibold">{nickname || post.user_email}</div>
                    </div>
                </div>
            )}

            <Image
                src={firstImage}
                alt="게시물"
                width={640}
                height={isProfilePage ? 640 : 360}
                className={`w-full ${
                    isProfilePage ? 'aspect-square object-cover' : 'h-60 object-cover'
                } cursor-pointer`}
                onClick={handleImageClick}
            />

            {!isProfilePage && (
                <div className="p-4">
                    {editing ? (
                        <>
                            <textarea
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm transition hover:bg-blue-500"
                                >
                                    수정 완료
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setEditingDescription(post.description);
                                    }}
                                    className="px-4 py-2 bg-gray-400 text-white rounded-full text-sm transition hover:bg-gray-300"
                                >
                                    취소
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-800 text-sm">{post.description}</p>
                            <p className="text-xs text-gray-500 mt-2">{`작성자: ${post.user_email}`}</p>
                            {session?.user.email === post.user_email && (
                                <div className="flex space-x-4 mt-4">
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm transition hover:bg-yellow-400"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-full text-sm transition hover:bg-red-500"
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
