import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Phone, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (type: 'demo' | 'user', username?: string, identifier?: string) => void;
}

const BACKGROUND_IMAGES = [
  "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1920"
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<'main' | 'email' | 'phone' | 'signup'>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.user) {
        onLogin('user', data.user.email?.split('@')[0], data.user.email || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0]
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        onLogin('user', data.user.email?.split('@')[0], data.user.email || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });
      if (error) throw error;
      if (data.user) {
        onLogin('user', `User ${phoneNumber.slice(-4)}`, phoneNumber);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLogin('demo', 'Demo User', 'demo@pawpal.com');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {BACKGROUND_IMAGES.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out bg-cover bg-center ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/80 to-black/90 backdrop-blur-md"></div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-500">
        <div className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20">
          {view === 'main' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-xl shadow-orange-500/30 mb-4">
                  <span className="text-4xl font-black text-white">P</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome to PawPal</h1>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The smartest companion for your furry family
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] font-semibold text-slate-700 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <button
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-black text-white hover:bg-slate-900 transition-all active:scale-[0.98] font-semibold disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.15 4.09-.6 1.12.39 2.21 1.25 2.72 2.04-2.82 1.62-2.12 5.51.68 6.75-.48 1.4-1.12 2.76-2.57 4.04zM13.03 5.48c-.66 1.76-2.91 3.12-4.43 2.84-.33-1.74 1.18-3.64 2.89-4.32 1.35-.58 3.13.06 1.54 1.48z" />
                      </svg>
                      Continue with Apple
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setView('phone')}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors flex flex-col items-center gap-2"
                >
                  <Phone size={20} className="text-slate-500" />
                  <span className="text-sm">Phone</span>
                </button>
                <button
                  onClick={() => setView('email')}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors flex flex-col items-center gap-2"
                >
                  <Mail size={20} className="text-slate-500" />
                  <span className="text-sm">Email</span>
                </button>
              </div>

              <div className="pt-4 text-center border-t border-slate-100">
                <button
                  onClick={handleDemoLogin}
                  className="text-orange-600 font-bold text-sm hover:text-orange-700 transition-colors"
                >
                  Try Demo Account
                </button>
              </div>
            </div>
          )}

          {view === 'email' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setView('main'); setError(null); }}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Email Sign In</h3>
                  <p className="text-sm text-slate-500">Enter your credentials</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>Sign In <ArrowRight size={20} /></>
                  )}
                </button>
              </form>

              <div className="text-center text-sm">
                <span className="text-slate-500">Don't have an account? </span>
                <button
                  onClick={() => { setView('signup'); setError(null); }}
                  className="text-orange-600 font-bold hover:text-orange-700"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}

          {view === 'signup' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setView('email'); setError(null); }}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Create Account</h3>
                  <p className="text-sm text-slate-500">Join PawPal today</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>Create Account <ArrowRight size={20} /></>
                  )}
                </button>
              </form>

              <div className="text-center text-sm">
                <span className="text-slate-500">Already have an account? </span>
                <button
                  onClick={() => { setView('email'); setError(null); }}
                  className="text-orange-600 font-bold hover:text-orange-700"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {view === 'phone' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setView('main'); setError(null); setOtpSent(false); }}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Phone Sign In</h3>
                  <p className="text-sm text-slate-500">
                    {otpSent ? 'Enter verification code' : 'Enter your phone number'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handlePhoneSendOTP} className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 px-1">
                    We'll send you a verification code
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading || !phoneNumber}
                    className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePhoneVerifyOTP} className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-500">
                      Code sent to <span className="text-slate-900 font-bold">{phoneNumber}</span>
                    </p>
                  </div>

                  <input
                    type="text"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full p-4 text-center text-3xl tracking-[0.5em] bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="w-full bg-green-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>Verify & Sign In <Check size={20} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
