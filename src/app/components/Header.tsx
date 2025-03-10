'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    onToggleUpload: () => void;
    onLogout: () => void;
    showUpload: boolean;
}

export default function Header({ onToggleUpload, onLogout }: HeaderProps) {
    const pathname = usePathname();
    const isProfilePage = pathname.startsWith('/profile/');
    const router = useRouter();

    const onEditProfile = () => {
        router.push('/profileedit');
    };
    return (
        <header className="flex justify-between items-center p-4 bg-white shadow-md">
            <h1 className="text-xl font-bold">내기념일공유</h1>
            <div className="flex items-center space-x-4">
                {isProfilePage && (
                    <button
                        onClick={onEditProfile}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        프로필 수정
                    </button>
                )}
                <button
                    onClick={onToggleUpload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    작성
                </button>
                <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    로그아웃
                </button>
            </div>
        </header>
    );
}
