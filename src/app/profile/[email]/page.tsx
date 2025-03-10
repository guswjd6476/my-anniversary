'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import PostCard from '@/app/components/PostCard';

interface Post {
    id: string;
    image_urls: string;
    description: string;
    user_email: string;
    user_id: string;
}

export default function Profile() {
    const [posts, setPosts] = useState<Post[]>([]);

    const params = useParams();

    const userEmail = decodeURIComponent(Array.isArray(params.email) ? params.email.join('') : params.email || '');

    const fetchPosts = useCallback(async () => {
        if (!userEmail) return;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('게시물 불러오기 실패:', error.message);
        } else {
            setPosts(data || []); // ✅ `data`가 null일 경우 빈 배열로 처리
        }
    }, [userEmail]);

    useEffect(() => {
        fetchPosts();
    }, [userEmail, fetchPosts]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">{userEmail}님의 피드</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} onPostChange={fetchPosts} />
                ))}
            </div>
        </div>
    );
}
