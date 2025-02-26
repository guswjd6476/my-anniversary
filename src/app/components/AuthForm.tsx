// components/AuthForm.tsx
'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthFormProps {
    onAuth: (session: any) => void;
}

export default function AuthForm({ onAuth }: AuthFormProps) {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            alert('로그인 실패: ' + error.message);
        } else {
            onAuth(data.session);
        }
    };

    const handleSignup = async () => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            alert('회원가입 실패: ' + error.message);
        } else {
            alert('회원가입 성공! 확인 이메일을 확인해주세요.');
            setAuthMode('login');
        }
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
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full"
                    >
                        로그인
                    </button>
                ) : (
                    <button
                        onClick={handleSignup}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full"
                    >
                        회원가입
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
