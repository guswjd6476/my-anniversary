// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import Feed from './components/Feed';

export default function HomePage() {
    const [session, setSession] = useState<any>(null);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) alert('로그아웃 실패: ' + error.message);
        else setSession(null);
    };

    if (!session) {
        return <AuthForm onAuth={(session) => setSession(session)} />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header onToggleUpload={() => setShowUpload(!showUpload)} onLogout={handleLogout} showUpload={showUpload} />
            {showUpload && <UploadForm session={session} onUploadSuccess={() => setShowUpload(false)} />}
            <Feed session={session} />
        </div>
    );
}
