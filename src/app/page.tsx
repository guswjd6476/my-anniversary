'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ next/router → next/navigation 수정
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import Feed from './components/Feed';

export default function HomePage() {
    const [session, setSession] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // 현재 로그인 상태 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // 로그인 상태 변화 감지
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 로그아웃 기능 추가
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert('로그아웃 실패: ' + error.message);
        } else {
            setSession(null);
        }
    };

    // 로그인되지 않은 경우 로그인 UI 표시
    if (!session) {
        return <AuthForm onAuth={(session) => setSession(session)} />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ✅ `showUpload` prop 추가 */}
            <Header showUpload={true} onToggleUpload={() => router.push('/uploaded')} onLogout={handleLogout} />

            {/* ✅ `session` prop 추가 */}
            <div className="max-w-2xl mx-auto mt-4">
                <Feed session={session} />
            </div>
        </div>
    );
}
