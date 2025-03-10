'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image'; // Import Image from next/image

interface Post {
    id: string;
    description: string;
    image_urls: string | string[];
    event_date?: string;
}

const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
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

    let imageUrls: string[] = [];
    try {
        imageUrls = typeof post.image_urls === 'string' ? JSON.parse(post.image_urls) : post.image_urls;
    } catch {
        imageUrls = typeof post.image_urls === 'string' ? [post.image_urls] : [];
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
    };

    const calculateDday = (eventDate?: string) => {
        if (!eventDate) return null;
        const event = new Date(eventDate);
        const today = new Date();
        const diffTime = event.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const dDay = post.event_date ? calculateDday(post.event_date) : null;

    return (
        <div className="bg-white max-w-lg mx-auto mt-8 rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{post.description}</h2>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                    뒤로가기
                </button>
            </div>

            {post.event_date && (
                <div className="p-4 text-center text-lg font-semibold">
                    📅 {post.event_date} {dDay !== null && `(D${dDay >= 0 ? '-' : '+'}${Math.abs(dDay)})`}
                </div>
            )}

            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-300"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    ref={sliderRef}
                >
                    {imageUrls.map((url, index) => (
                        <div key={index} className="min-w-full">
                            <Image
                                src={url}
                                alt={`Image ${index + 1}`}
                                width={1000} // Set a fixed width for optimization
                                height={500} // Set a fixed height for optimization
                                className="w-full h-[500px] object-cover"
                            />
                        </div>
                    ))}
                </div>
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                >
                    ◀
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                >
                    ▶
                </button>
            </div>

            <div className="px-4 py-2">
                <p className="text-sm text-gray-700">{post.description}</p>
            </div>
        </div>
    );
};

export default PostDetail;
