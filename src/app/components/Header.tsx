'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, PlusCircle, User, LogOut, Settings, Pencil } from 'lucide-react';
import { useSession } from '../SupabaseProvider';

interface HeaderProps {
    onToggleUpload: () => void;
    onLogout: () => void;
}

export default function Header({ onToggleUpload, onLogout }: HeaderProps) {
    const router = useRouter();
    const { session } = useSession();

    return (
        <>
            {/* 공통 헤더 (로고만, 모바일/데스크탑 공통) */}
            <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md border-b fixed w-full top-0 z-50">
                <h1 className="text-2xl font-bold cursor-pointer tracking-wide" onClick={() => router.push('/')}>
                    📸 Anniversary
                </h1>

                {/* 데스크탑 메뉴 */}
                <div className="hidden md:flex items-center space-x-6">
                    <button onClick={() => router.push('/')} className="hover:text-blue-500 transition">
                        <Home size={28} />
                    </button>
                    <button onClick={onToggleUpload} className="hover:text-blue-500 transition">
                        <Pencil size={28} />
                    </button>
                    {session && (
                        <button onClick={() => router.push('/profileedit')} className="hover:text-green-500 transition">
                            <Settings size={28} />
                        </button>
                    )}
                    <button onClick={onLogout} className="hover:text-red-500 transition">
                        <LogOut size={28} />
                    </button>
                </div>
            </header>

            {/* 모바일 하단 메뉴 */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white shadow-md border-t flex justify-around py-3 z-50">
                <button onClick={() => router.push('/')} className="hover:text-blue-500 transition">
                    <Home size={28} />
                </button>
                <button
                    onClick={onToggleUpload}
                    className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all"
                >
                    <PlusCircle size={32} />
                </button>
                <button onClick={() => router.push('/profileedit')} className="hover:text-blue-500 transition">
                    <User size={28} />
                </button>
                <button onClick={onLogout} className="hover:text-red-500 transition">
                    <LogOut size={28} />
                </button>
            </nav>
        </>
    );
}
