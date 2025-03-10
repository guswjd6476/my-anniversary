'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from './PostCard';
import { useSession } from '../SupabaseProvider';

export interface Post {
    id: string;
    image_urls: string;
    description: string;
    user_email: string;
    user_id: string;
}

export default function Feed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [friends, setFriends] = useState<string[]>([]);
    const { session } = useSession();

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchFriends = async () => {
            const { data, error } = await supabase
                .from('friends')
                .select('*')
                .or(`user_id_1.eq.${session.user.id},user_id_2.eq.${session.user.id}`)
                .eq('status', 'accepted');

            if (error) {
                console.error('친구 목록 가져오기 실패:', error.message);
            } else {
                const friendIds = data.map((friend) =>
                    friend.user_id_1 === session.user.id ? friend.user_id_2 : friend.user_id_1
                );
                setFriends(friendIds);
            }
        };

        fetchFriends();
    }, [session]);

    useEffect(() => {
        if (friends.length === 0) return;

        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .in('user_id', friends)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('게시물 불러오기 실패:', error.message);
            } else {
                setPosts(data);
            }
        };

        fetchPosts();
    }, [friends]);

    const handlePostChange = async () => {
        // Re-fetch the posts after any changes
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .in('user_id', friends)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('게시물 불러오기 실패:', error.message);
        } else {
            setPosts(data);
        }
    };

    if (!session) {
        return <p>로그인하지 않았습니다. 로그인 후 다시 시도하세요.</p>;
    }

    return (
        <div className="flex">
            <div className="w-3/4 p-4">
                <h2 className="text-xl font-bold mb-4">친구들의 게시물</h2>
                {posts.length === 0 ? (
                    <p>게시물이 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onPostChange={handlePostChange} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
