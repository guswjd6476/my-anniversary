// components/Feed.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from './PostCard';

export interface Post {
    id: string;
    image_urls: string;
    description: string;
    user_email: string;
}

interface FeedProps {
    session: any;
}

export default function Feed({ session }: FeedProps) {
    const [posts, setPosts] = useState<Post[]>([]);

    const fetchPosts = async () => {
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('게시물 불러오기 실패:', error.message);
        } else {
            setPosts(data);
            console.log(data, '?data');
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [session]);

    return (
        <main className="max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} session={session} onPostChange={fetchPosts} />
                ))}
            </div>
        </main>
    );
}
