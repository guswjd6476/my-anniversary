// components/PostCard.tsx
'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from './Feed';

interface PostCardProps {
    post: Post;
    session: any;
    onPostChange: () => void;
}

export default function PostCard({ post, session, onPostChange }: PostCardProps) {
    const [editing, setEditing] = useState(false);
    const [editingDescription, setEditingDescription] = useState(post.description);

    const handleDelete = async () => {
        if (!confirm('정말로 삭제하시겠습니까?')) return;
        const { error } = await supabase.from('posts').delete().eq('id', post.id);
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

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={post.image_url} alt="게시물" className="w-full h-64 object-cover" />
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
