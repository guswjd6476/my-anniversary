'use client';
import { useParams, useRouter } from 'next/navigation'; // useRouter 추가
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const PostDetail = () => {
    const { id } = useParams(); // 동적 경로로 id를 받아옴
    const [post, setPost] = useState<any>(null);
    const router = useRouter(); // useRouter 추가

    useEffect(() => {
        console.log('Post ID:', id); // id 값 출력해 보기
        if (id) {
            const fetchPost = async () => {
                const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
                if (error) {
                    console.error('Post fetch error:', error.message);
                } else {
                    setPost(data);
                }
            };

            fetchPost();
        }
    }, [id]);

    if (!post) {
        return <div>Loading...</div>;
    }

    // image_urls가 JSON 형식인지, 문자열인지 체크 후 처리
    let imageUrls: string[] = [];
    try {
        imageUrls = post.image_urls ? JSON.parse(post.image_urls) : [];
    } catch (e) {
        // JSON.parse 오류가 나면 단순 문자열로 취급
        imageUrls = post.image_urls ? [post.image_urls] : [];
    }

    return (
        <div className="bg-white max-w-lg mx-auto mt-8 rounded-xl shadow-xl overflow-hidden">
            {/* 게시물 상단 헤더 */}
            <div className="p-4 border-b">
                <h2 className="text-2xl font-semibold">{post.description}</h2>
            </div>

            {/* 뒤로가기 버튼 */}
            <div className="p-4">
                <button
                    onClick={() => router.back()} // 뒤로 가기 동작
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                    뒤로가기
                </button>
            </div>

            {/* 이미지 갤러리 */}
            <div className="relative">
                {imageUrls.map((url: string, index: number) => (
                    <div key={index} className="group">
                        <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-[500px] object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                    </div>
                ))}
            </div>

            {/* 게시물 설명 */}
            <div className="px-4 py-2">
                <p className="text-sm text-gray-700">{post.description}</p>
            </div>
        </div>
    );
};

export default PostDetail;
