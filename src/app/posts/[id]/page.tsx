'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';

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
        <div className="bg-white max-w-xl mx-auto mt-10 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
                <h2 className="text-3xl font-semibold text-gray-800">{post.description}</h2>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition duration-200"
                >
                    뒤로가기
                </button>
            </div>

            {post.event_date && (
                <div className="p-4 text-center text-lg font-semibold text-gray-700">
                    📅 {post.event_date}
                    {dDay !== null && (
                        <span className={`ml-2 text-${dDay >= 0 ? 'green' : 'red'}-500`}>
                            (D{dDay >= 0 ? '-' : '+'}
                            {Math.abs(dDay)})
                        </span>
                    )}
                </div>
            )}

            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-500"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    ref={sliderRef}
                >
                    {imageUrls.map((url, index) => (
                        <div key={index} className="min-w-full">
                            <Image
                                src={url}
                                alt={`Image ${index + 1}`}
                                width={1000} // Set a fixed width for optimization
                                height={600} // Set a fixed height for optimization
                                className="w-full h-[600px] object-cover rounded-xl"
                            />
                        </div>
                    ))}
                </div>
                <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition"
                >
                    ◀
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition"
                >
                    ▶
                </button>
            </div>

            <div className="px-5 py-4">
                <p className="text-sm text-gray-700">{post.description}</p>
            </div>
        </div>
    );
};

export default PostDetail;
