"use client";

import { useState } from 'react';
import { Book, Chrome, Lock, LogIn, User, UserPlus } from 'lucide-react';
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation'; 

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  
  const router = useRouter(); 

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard'); 
    } catch (err: any) {
      console.error(err);
      setError(
        isRegisterMode
          ? 'Failed to create account. Please check your input and try again.'
          : 'Failed to sign in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative">
      {isSwitchingMode && (
        <div className="absolute inset-0 z-10 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 text-indigo-700 font-semibold">
            <span className="inline-block h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            Loading...
          </div>
        </div>
      )}

      <div className={`text-center mb-8 ${isSwitchingMode ? 'opacity-70' : 'opacity-100'} transition-opacity`}>
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
          <Book size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRegisterMode ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-500 text-sm">
          {isRegisterMode ? 'Create your account to get started' : 'Please sign in to your account'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4" aria-busy={loading || isSwitchingMode}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              disabled={loading || isSwitchingMode}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password123"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              disabled={loading || isSwitchingMode}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || isSwitchingMode}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isRegisterMode ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading
            ? (isRegisterMode ? 'Creating Account...' : 'Signing In...')
            : (isRegisterMode ? 'Create Account' : 'Sign In')}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || isSwitchingMode}
          className="w-full border border-gray-200 bg-white text-gray-700 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <Chrome size={18} />
          Continue with Google
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-4">
        {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setError('');
            setIsSwitchingMode(true);
            setTimeout(() => {
              setIsRegisterMode(!isRegisterMode);
              setIsSwitchingMode(false);
            }, 250);
          }}
          className="text-indigo-600 font-semibold transition-all duration-150 hover:text-indigo-700 hover:underline hover:underline-offset-2 active:scale-95 active:text-indigo-800"
          disabled={loading || isSwitchingMode}
        >
          {isRegisterMode ? 'Sign In' : 'Create one'}
        </button>
      </p>
    </div>
  );
}