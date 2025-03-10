'use client';
import AuthForm from './components/AuthForm';
import Feed from './components/Feed';
import { useSession } from './SupabaseProvider';

export default function HomePage() {
    const { session } = useSession();

    // 로그인이 되어 있지 않은 경우 로그인 UI 표시
    if (!session) {
        return <AuthForm />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Feed />
        </div>
    );
}
