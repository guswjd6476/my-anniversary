'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../SupabaseProvider';
import { useRouter } from 'next/navigation'; // useRouter 추가
import Image from 'next/image'; // 추가
interface Friend {
    user_id_1: string;
    user_id_2: string;
    status: string;
    sender_email?: string; // sender_email을 추가
}

export default function LeftNavigation() {
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<{ id: string; email: string; profile_image: string; nickname: string }[]>(
        []
    ); // 이메일, 프로필 이미지, 닉네임 포함
    const [allUsers, setAllUsers] = useState<{ id: string; email: string; profile_image: string; nickname: string }[]>(
        []
    );
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
    const { session } = useSession();
    const userId = session?.user?.id;
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;

        const fetchFriends = async () => {
            try {
                const { data, error } = await supabase
                    .from('friends')
                    .select('user_id_1, user_id_2, status')
                    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

                if (error) throw error;

                const friendIds: string[] = [];
                const pendingRequests: Friend[] = [];

                for (const friend of data) {
                    if (friend.status === 'accepted') {
                        friendIds.push(friend.user_id_1 === userId ? friend.user_id_2 : friend.user_id_1);
                    } else if (friend.status === 'pending') {
                        pendingRequests.push(friend);
                    }
                }

                // 친구들의 이메일, 프로필 이미지, 닉네임도 가져옵니다.
                const friendDetails = await Promise.all(
                    friendIds.map(async (id) => {
                        const { data, error } = await supabase
                            .from('users')
                            .select('email, profile_image, nickname')
                            .eq('id', id)
                            .single();

                        if (error) {
                            console.error('정보 가져오기 실패:', error);
                            return null;
                        }
                        return {
                            id,
                            email: data?.email,
                            profile_image: Array.isArray(data?.profile_image)
                                ? data?.profile_image[0]
                                : data?.profile_image || '', // 배열 처리 추가
                            nickname: data?.nickname || '이름 없음',
                        };
                    })
                );

                // null 값이 포함되지 않도록 필터링
                setFriends(
                    friendDetails.filter(Boolean) as {
                        id: string;
                        email: string;
                        profile_image: string;
                        nickname: string;
                    }[]
                );
                setPendingRequests(pendingRequests);
            } catch (error) {
                console.error('친구 목록 불러오기 실패:', error);
            }
        };

        const fetchAllUsers = async () => {
            try {
                const { data, error } = await supabase.from('users').select('id, email, profile_image, nickname');
                if (error) throw error;
                setAllUsers(data);
            } catch (error) {
                console.error('전체 유저 목록 불러오기 실패:', error);
            }
        };

        fetchFriends();
        fetchAllUsers();
    }, [userId]);

    const handleAddFollow = async (targetId: string) => {
        if (!userId || targetId === userId) return;
        try {
            const { error } = await supabase
                .from('friends')
                .insert([{ user_id_1: userId, user_id_2: targetId, status: 'pending' }]);

            if (error) throw error;
            alert('친구 요청을 보냈습니다.');

            // 상태 업데이트
            setPendingRequests((prev) => [...prev, { user_id_1: userId, user_id_2: targetId, status: 'pending' }]);
        } catch (error) {
            console.error('친구 추가/팔로우 실패:', error);
        }
    };

    const handleAcceptRequest = async (request: Friend) => {
        if (!userId) return;
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('email, profile_image, nickname')
                .eq('id', request.user_id_1)
                .single();

            if (userError) throw userError;

            const { error } = await supabase
                .from('friends')
                .update({ status: 'accepted' })
                .match({ user_id_1: request.user_id_1, user_id_2: request.user_id_2, status: 'pending' });

            if (error) throw error;
            alert('친구 요청을 수락했습니다.');

            // 상태 업데이트
            setFriends((prev) => [
                ...prev,
                {
                    id: request.user_id_1,
                    email: userData.email || '이메일 없음',
                    profile_image: Array.isArray(userData.profile_image)
                        ? userData.profile_image[0]
                        : userData.profile_image || '', // 배열 처리 추가
                    nickname: userData.nickname || '이름 없음',
                },
            ]);
            setPendingRequests((prev) => prev.filter((r) => r.user_id_1 !== request.user_id_1));
        } catch (error) {
            console.error('친구 요청 수락 실패:', error);
        }
    };

    const handleNavigateToFeed = (friendId: string) => {
        // 친구의 피드로 이동
        router.push(`/profile/${friendId}`);
    };

    console.log(friends, '?friends?');
    return (
        <div className="w-1/4 p-4 bg-gray-100 overflow-auto shadow-md">
            <div className="flex justify-between mb-4">
                <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-500 text-white rounded">
                    홈으로 돌아가기
                </button>
            </div>
            <input
                type="text"
                placeholder="친구 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border rounded mb-4"
            />

            <h3 className="font-bold mb-2">친구 목록</h3>
            <ul>
                {friends.length > 0 ? (
                    friends.map((friend) => (
                        <li
                            key={friend.id}
                            className="p-2 border-b cursor-pointer hover:bg-gray-200 flex items-center"
                            onClick={() => handleNavigateToFeed(friend.email)} // 친구 클릭 시 피드로 이동
                        >
                            {friend.profile_image ? (
                                <Image
                                    src={friend.profile_image}
                                    alt={friend.nickname}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
                            )}
                            {friend.nickname} {/* 닉네임 표시 */}
                        </li>
                    ))
                ) : (
                    <li className="text-gray-500">친구가 없습니다.</li>
                )}
            </ul>

            <h3 className="font-bold mt-4 mb-2">추천 친구</h3>
            <ul>
                {allUsers
                    .filter(
                        (user) =>
                            user.id !== userId &&
                            !friends.some((friend) => friend.id === user.id) &&
                            !pendingRequests.some((req) => req.user_id_2 === user.id && req.user_id_1 === userId)
                    )
                    .map((user) => (
                        <li key={user.id} className="p-2 border-b flex justify-between items-center">
                            <div className="flex items-center">
                                {user.profile_image ? (
                                    <Image
                                        src={user.profile_image}
                                        alt={user.nickname}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full mr-2"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
                                )}
                                <span>{user.nickname}</span>
                            </div>
                            <button
                                onClick={() => handleAddFollow(user.id)}
                                className="ml-2 bg-blue-500 text-white rounded px-2 py-1 text-sm"
                            >
                                친구 추가
                            </button>
                        </li>
                    ))}
                {allUsers
                    .filter((user) =>
                        pendingRequests.some((req) => req.user_id_2 === user.id && req.user_id_1 === userId)
                    )
                    .map((user) => (
                        <li key={user.id} className="p-2 border-b flex justify-between items-center">
                            <div className="flex items-center">
                                {user.profile_image ? (
                                    <Image
                                        src={user.profile_image}
                                        alt={user.nickname}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full mr-2"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
                                )}
                                <span>{user.nickname}</span>
                            </div>
                            <button
                                className="ml-2 bg-gray-400 text-white rounded px-2 py-1 text-sm cursor-default"
                                disabled
                            >
                                대기 중
                            </button>
                        </li>
                    ))}
            </ul>

            <h3 className="font-bold mt-4 mb-2">친구 요청</h3>
            <ul>
                {pendingRequests.length > 0 ? (
                    pendingRequests
                        .filter((req) => req.user_id_2 === userId) // 받은 요청만 표시
                        .map((request) => (
                            <li key={request.user_id_1} className="p-2 border-b flex justify-between items-center">
                                {/* 이메일이 있는 경우 표시 */}
                                <span>
                                    {
                                        // 이메일을 직접 가져와서 표시합니다.
                                        allUsers.find((user) => user.id === request.user_id_1)?.email || '이메일 없음'
                                    }
                                </span>
                                <button
                                    onClick={() => handleAcceptRequest(request)}
                                    className="ml-2 bg-green-500 text-white rounded px-2 py-1 text-sm"
                                >
                                    수락
                                </button>
                            </li>
                        ))
                ) : (
                    <li className="text-gray-500">받은 친구 요청이 없습니다.</li>
                )}
            </ul>
            {session?.user?.email && (
                <div className="flex justify-between mb-4">
                    <button
                        onClick={() => router.push(`/profile/${session.user.email}`)}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        내피드
                    </button>
                </div>
            )}
        </div>
    );
}
