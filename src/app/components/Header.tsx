// components/Header.tsx
'use client';
import React from 'react';

interface HeaderProps {
    onToggleUpload: () => void;
    onLogout: () => void;
    showUpload: boolean;
}

export default function Header({ onToggleUpload, onLogout, showUpload }: HeaderProps) {
    return (
        <header className="flex justify-between items-center p-4 bg-white shadow-md">
            <h1 className="text-xl font-bold">Instagram-like Feed</h1>
            <div className="flex items-center space-x-4">
                <button
                    onClick={onToggleUpload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    {showUpload ? '취소' : '작성'}
                </button>
                <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    로그아웃
                </button>
            </div>
        </header>
    );
}
