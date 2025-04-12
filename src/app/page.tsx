'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from './components/AuthForm';
import Feed from './components/Feed';
import { useSession } from './SupabaseProvider';
import { supabase } from './lib/supabase';

export default function HomePage() {
    const { session, isLoading } = useSession();
    const router = useRouter();
    const [checkingProfile, setCheckingProfile] = useState(true);
    const didCheck = useRef(false);

    useEffect(() => {
        const checkNickname = async () => {
            if (!session || didCheck.current) return;

            didCheck.current = true;

            const { data, error } = await supabase.from('users').select('nickname').eq('id', session.user.id).single();

            if (error) {
                console.error('닉네임 확인 오류:', error);
                return;
            }

            if (!data?.nickname) {
                const confirmed = confirm('닉네임이 설정되지 않았습니다. 프로필을 수정하시겠습니까?');
                if (confirmed) {
                    router.push('/profileedit');
                }
            }

            setCheckingProfile(false);
        };

        checkNickname();
    }, [session, router]);

    if (isLoading) {
        return <div className="p-10 text-center">세션을 확인 중입니다...</div>;
    }

    if (!session) {
        return <AuthForm />;
    }

    if (checkingProfile) {
        return <div className="p-10 text-center">프로필 정보를 확인 중입니다...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Feed />
        </div>
    );
}
