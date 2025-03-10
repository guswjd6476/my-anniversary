'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../SupabaseProvider';
export default function AuthForm() {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const { setSession } = useSession();
    const handleLogin = async () => {
        setLoading(true);
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        if (error) {
            alert('로그인 실패: ' + error.message);
        } else {
            setSession(data.session); // data.session은 Session | null 타입입니다.
        }
    };

    const handleSignup = async () => {
        setLoading(true);

        // 🔹 1. 이메일 중복 체크 (users 테이블에서 확인)
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

        if (checkError) {
            alert('회원가입 오류: ' + checkError.message);
            setLoading(false);
            return;
        }

        if (existingUsers.length > 0) {
            alert('이미 가입된 이메일입니다.');
            setLoading(false);
            return;
        }

        // 🔹 2. Supabase Auth를 이용해 회원가입
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            alert('회원가입 실패: ' + error.message);
            setLoading(false);
            return;
        }

        const user = data.user;
        if (user) {
            // 🔹 3. users 테이블에 추가 정보 저장
            const { error: insertError } = await supabase.from('users').insert([
                {
                    id: user.id, // auth.users의 ID와 연결
                    email: user.email,
                    nickname: '', // 기본 닉네임 (추후 설정 가능)
                    profile_image: '', // 기본 프로필 이미지 (추후 업데이트 가능)
                    created_at: new Date(),
                },
            ]);

            if (insertError) {
                alert('회원가입 성공! 그러나 추가 정보 저장에 실패했습니다.');
                console.error('users 테이블 저장 오류:', insertError.message);
            } else {
                alert('회원가입 성공! 확인 이메일을 확인해주세요.');
                setAuthMode('login');
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-4">{authMode === 'login' ? '로그인' : '회원가입'}</h1>
                <input
                    type="email"
                    placeholder="이메일"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 mb-4 rounded w-full"
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password || ''}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 mb-4 rounded w-full"
                />
                {authMode === 'login' ? (
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`px-4 py-2 text-white rounded-lg w-full ${
                            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                ) : (
                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className={`px-4 py-2 text-white rounded-lg w-full ${
                            loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {loading ? '회원가입 중...' : '회원가입'}
                    </button>
                )}
                <div className="mt-4 text-center">
                    {authMode === 'login' ? (
                        <p>
                            계정이 없으신가요?{' '}
                            <span className="text-blue-500 cursor-pointer" onClick={() => setAuthMode('signup')}>
                                회원가입
                            </span>
                        </p>
                    ) : (
                        <p>
                            이미 계정이 있으신가요?{' '}
                            <span className="text-blue-500 cursor-pointer" onClick={() => setAuthMode('login')}>
                                로그인
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
