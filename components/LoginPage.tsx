
import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Check, Loader2, Wifi, Phone, ChevronLeft, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (type: 'demo' | 'user', username?: string, identifier?: string) => void;
}

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585110396065-88b74662ee22?q=80&w=1974&auto=format&fit=crop"
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<'menu' | 'email' | 'phone' | 'apple_sim' | 'forgot_password'>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');

  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleFinalLogin = (method: 'demo' | 'user', username: string, identifier?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(method, username, identifier);
    }, 1000);
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        alert('Failed to sign in with Google. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      alert(`PawPal Security Code: 123456\n\n(This is a simulation of the SMS you would receive)`);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (otp === '123456') {
        handleFinalLogin('user', `User ${phoneNumber.slice(-4)}`, phoneNumber);
      } else {
        alert("Invalid code. Please try 123456");
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (!resetEmail) {
          alert("Please enter your email");
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setResetSent(true);
      }, 1500);
  };


  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-end md:justify-center overflow-hidden">

      {BACKGROUND_IMAGES.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out bg-cover bg-center ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/90"></div>

      <div className="absolute top-0 left-0 p-6 z-20">
         <div className="p-2 rounded-full backdrop-blur-md bg-green-500/20 border border-green-500/30">
            <Wifi size={16} className="text-green-300" />
         </div>
      </div>

      <div className="relative z-10 w-full max-w-sm text-center mb-8 flex-1 flex flex-col justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 mb-6 transform rotate-6 border-4 border-white/10 backdrop-blur-sm">
            <span className="text-5xl font-black text-white">P</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg mb-2">PawPal</h1>
          <p className="text-lg font-medium text-white/80 max-w-[200px] leading-relaxed">
            The smartest companion for your furry family.
          </p>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 pb-12 md:pb-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 ease-out">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 md:hidden"></div>

        {view === 'menu' && (
           <div className="space-y-4 animate-in slide-in-from-left duration-300">
              <h2 className="text-2xl font-black text-slate-800 text-center mb-6">Welcome Back</h2>

              <button
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm relative overflow-hidden group"
              >
                 <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="font-bold text-slate-700">Continue with Google</span>
                  {isLoading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin text-slate-800" /></div>}
              </button>

              <button
                onClick={() => setView('apple_sim')}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-black text-white transition-all active:scale-[0.98] shadow-lg shadow-black/20 hover:bg-slate-900"
              >
                 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.15 4.09-.6 1.12.39 2.21 1.25 2.72 2.04-2.82 1.62-2.12 5.51.68 6.75-.48 1.4-1.12 2.76-2.57 4.04zM13.03 5.48c-.66 1.76-2.91 3.12-4.43 2.84-.33-1.74 1.18-3.64 2.89-4.32 1.35-.58 3.13.06 1.54 1.48z" /></svg>
                 <span className="font-bold">Continue with Apple</span>
              </button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                 <button onClick={() => setView('phone')} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors flex flex-col items-center gap-2">
                    <Smartphone size={24} className="text-slate-400" />
                    Phone
                 </button>
                 <button onClick={() => setView('email')} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors flex flex-col items-center gap-2">
                    <Mail size={24} className="text-slate-400" />
                    Email
                 </button>
              </div>

              <div className="pt-4 text-center">
                 <button onClick={() => handleFinalLogin('demo', 'Demo User', 'demo@pawpal.com')} className="text-orange-500 font-bold text-xs uppercase tracking-widest hover:text-orange-600 transition-colors">
                    Try Demo Account
                 </button>
              </div>
           </div>
        )}

        {view === 'email' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-4">
                  <button onClick={() => setView('menu')} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><ChevronLeft size={24} /></button>
                  <h3 className="text-xl font-black text-slate-800">Email Login</h3>
               </div>

              <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                    />
                </div>

                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => { setView('forgot_password'); setResetSent(false); setResetEmail(''); }}
                        className="text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors"
                    >
                        Forgot Password?
                    </button>
                </div>

                <button
                  onClick={() => handleFinalLogin('user', email.split('@')[0], email)}
                  disabled={!email || !password || isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>Sign In <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </div>
        )}

        {view === 'forgot_password' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-4">
                  <button onClick={() => setView('email')} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><ChevronLeft size={24} /></button>
                  <h3 className="text-xl font-black text-slate-800">Reset Password</h3>
               </div>

               {!resetSent ? (
                   <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-sm text-slate-500 font-medium">Enter your email address and we'll send you a link to reset your password.</p>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!resetEmail || isLoading}
                            className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                        </button>
                   </form>
               ) : (
                   <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                       <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm">
                           <Check size={40} />
                       </div>
                       <h4 className="text-xl font-black text-slate-800 mb-2">Check your email</h4>
                       <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                           We've sent password reset instructions to <br/><span className="text-slate-900 font-bold">{resetEmail}</span>
                       </p>
                       <button
                           onClick={() => setView('email')}
                           className="w-full bg-slate-100 text-slate-700 p-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                       >
                           Back to Login
                       </button>
                   </div>
               )}
            </div>
        )}

        {view === 'phone' && (
            <form onSubmit={step === 'request' ? handleSendOtp : handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-4">
                  <button type="button" onClick={() => { setView('menu'); setStep('request'); setOtp(''); }} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><ChevronLeft size={24} /></button>
                  <h3 className="text-xl font-black text-slate-800">Phone Login</h3>
               </div>

               {step === 'request' ? (
                 <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                            <Phone size={20} />
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                          autoFocus
                        />
                    </div>
                    <p className="text-xs text-slate-400 font-medium px-1">We'll send you a verification code.</p>
                    <button
                      type="submit"
                      disabled={isLoading || phoneNumber.length < 5}
                      className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Code'}
                    </button>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="text-center mb-6">
                       <p className="text-sm text-slate-500 font-medium">Enter code sent to <span className="text-slate-800 font-bold">{phoneNumber}</span></p>
                    </div>

                    <input
                      type="text"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-full p-4 text-center text-3xl tracking-[0.5em] bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                      autoFocus
                    />

                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full bg-green-500 text-white p-4 rounded-2xl font-black shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Login'}
                    </button>
                 </div>
               )}
            </form>
        )}

      </div>

      {view === 'apple_sim' && (
         <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            {view === 'apple_sim' && (
                <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm animate-in zoom-in-95 duration-200 shadow-2xl text-center">
                    <svg className="w-16 h-16 mx-auto mb-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.15 4.09-.6 1.12.39 2.21 1.25 2.72 2.04-2.82 1.62-2.12 5.51.68 6.75-.48 1.4-1.12 2.76-2.57 4.04zM13.03 5.48c-.66 1.76-2.91 3.12-4.43 2.84-.33-1.74 1.18-3.64 2.89-4.32 1.35-.58 3.13.06 1.54 1.48z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Sign in with Apple</h3>
                    <p className="text-slate-500 mb-8 font-medium">Use your Apple ID to sign in to PawPal.</p>
                    <button onClick={() => handleFinalLogin('user', 'Apple User', 'apple-id@hidden.com')} className="w-full bg-black text-white p-4 rounded-xl font-bold mb-3 active:scale-95 transition-transform">Continue with Password</button>
                    <button onClick={() => setView('menu')} className="text-sm text-blue-500 font-bold">Cancel</button>
                </div>
            )}
         </div>
      )}

    </div>
  );
};

export default LoginPage;
