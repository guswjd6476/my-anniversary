import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const { session } = useSession();

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
            console.error('삭제 오류:', error.message);
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
        if (post.image_urls.startsWith('[') && post.image_urls.endsWith(']')) {
            try {
                imageUrls = JSON.parse(post.image_urls);
            } catch (error) {
                console.error('이미지 URL JSON 파싱 오류:', error);
            }
        } else {
            imageUrls = post.image_urls.split(',').map((url) => url.trim());
        }
    } else if (Array.isArray(post.image_urls)) {
        imageUrls = post.image_urls;
    }

    // 이미지 URL이 없거나 빈 값일 때 처리
    const firstImage = imageUrls.length > 0 && imageUrls[0] ? imageUrls[0] : '/default-image.jpg';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <Image
                src={firstImage} // 빈 문자열이나 null을 기본 이미지로 처리
                alt="게시물"
                width={640} // width와 height 설정
                height={256}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={handleImageClick}
            />
            <div className="p-4">
                {editing ? (
                    <>
                        <textarea
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            className="w-full border p-2 rounded mb-2"
                        />
                        <div className="flex space-x-2">
                            <button onClick={handleUpdate} className="px-3 py-1 bg-green-500 text-white rounded">
                                수정 완료
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setEditingDescription(post.description);
                                }}
                                className="px-3 py-1 bg-gray-500 text-white rounded"
                            >
                                취소
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-gray-700">{post.description}</p>
                        <p className="text-sm text-gray-500 mt-2">작성자: {post.user_email}</p>
                        {session?.user.email === post.user_email && (
                            <div className="flex space-x-2 mt-2">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                                >
                                    수정
                                </button>
                                <button onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded">
                                    삭제
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
