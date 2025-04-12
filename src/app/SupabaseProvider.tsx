import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

interface SessionContextType {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
    isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true); // ✅ 로딩 상태 추가

    useEffect(() => {
        const fetchSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setSession(session);
            setIsLoading(false); // ✅ 세션 확인 후 로딩 false
        };

        fetchSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            listener.subscription?.unsubscribe();
        };
    }, []);

    return <SessionContext.Provider value={{ session, setSession, isLoading }}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
