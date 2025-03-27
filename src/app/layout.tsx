'use client';

import { useRouter } from 'next/navigation';
import './globals.css';
import LeftNavigation from './components/LeftNavigation';
import Header from './components/Header';
import { SessionProvider, useSession } from './SupabaseProvider';
import { supabase } from './lib/supabase';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LayoutContent>{children}</LayoutContent>
        </SessionProvider>
    );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { session, setSession } = useSession();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        router.push('/');
    };

    return (
        <html lang="en">
            <body>
                {session ? (
                    <>
                        <Header onToggleUpload={() => router.push('/uploaded')} onLogout={handleLogout} />
                        <div className="flex mt-12">
                            <LeftNavigation />
                            <div className="w-full">{children}</div>
                        </div>
                    </>
                ) : (
                    <div className="w-full">{children}</div>
                )}
            </body>
        </html>
    );
}
