'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import PostCard from '@/app/components/PostCard';
import Image from 'next/image';

interface Post {
    id: string;
    image_urls: string;
    description: string;
    user_email: string;
    user_id: string;
}

interface UserInfo {
    nickname: string;
    profile_image: string;
}

export default function Profile() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const params = useParams();
    const userEmail = decodeURIComponent(Array.isArray(params.email) ? params.email.join('') : params.email || '');

    // 📨 게시물 불러오기
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
            setPosts(data || []);
        }
    }, [userEmail]);

    // 👤 유저 정보 불러오기
    const fetchUserInfo = useCallback(async () => {
        if (!userEmail) return;

        const { data, error } = await supabase
            .from('users')
            .select('nickname, profile_image')
            .eq('email', userEmail)
            .single();

        if (error) {
            console.error('유저 정보 불러오기 실패:', error.message);
        } else {
            setUserInfo(data);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchPosts();
        fetchUserInfo();
    }, [userEmail, fetchPosts, fetchUserInfo]);

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <div className="flex mt-4 items-center space-x-6 mb-8">
                <Image
                    src={userInfo?.profile_image || '/default-avatar.png'}
                    alt="프로필"
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-20 h-20"
                />
                <div>
                    <h2 className="text-2xl font-bold">{userInfo?.nickname || userEmail}</h2>
                    <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onPostChange={fetchPosts}
                    />
                ))}
            </div>
        </div>
    );
}
