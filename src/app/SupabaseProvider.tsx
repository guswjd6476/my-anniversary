import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js'; // ✅ Supabase의 Session 타입 가져오기

interface SessionContextType {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // ✅ Supabase에서 현재 세션 가져오기
        const fetchSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setSession(session);
        };

        fetchSession();

        // ✅ Supabase의 onAuthStateChange 리스너 설정
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // ✅ 리스너 해제
        return () => {
            listener.subscription?.unsubscribe();
        };
    }, []);

    return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
