
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Check, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (type: 'demo' | 'user', username?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'google' | 'apple' | 'demo' | null>(null);

  const handleSimulatedLogin = (method: 'demo' | 'user', specificMethod: 'email' | 'google' | 'apple' | 'demo') => {
    setLoginMethod(specificMethod);
    setIsLoading(true);
    
    // Simulate network delay for realism
    setTimeout(() => {
      setIsLoading(false);
      onLogin(method, email || 'User');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="w-full max-w-sm space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header / Logo */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-orange-500/20 transform rotate-3">
            <span className="text-4xl font-black text-white">P</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">PawPal</h1>
            <p className="text-slate-500 font-medium mt-2 text-sm">The smartest companion for your furry family.</p>
          </div>
        </div>

        {/* Login Options */}
        <div className="space-y-4 pt-4">
          
          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSimulatedLogin('user', 'google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoading && loginMethod === 'google' ? <Loader2 className="animate-spin w-5 h-5" /> : <span className="font-bold text-sm">Google</span>}
            </button>
            <button 
              onClick={() => handleSimulatedLogin('user', 'apple')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
               <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.15 4.09-.6 1.12.39 2.21 1.25 2.72 2.04-2.82 1.62-2.12 5.51.68 6.75-.48 1.4-1.12 2.76-2.57 4.04zM13.03 5.48c-.66 1.76-2.91 3.12-4.43 2.84-.33-1.74 1.18-3.64 2.89-4.32 1.35-.58 3.13.06 1.54 1.48z" />
               </svg>
               {isLoading && loginMethod === 'apple' ? <Loader2 className="animate-spin w-5 h-5" /> : <span className="font-bold text-sm">Apple</span>}
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@pawpal.com"
                  className="w-full p-4 pl-11 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 pl-11 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleSimulatedLogin('user', 'email')}
            disabled={!email || !password || isLoading}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl font-black shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
          >
            {isLoading && loginMethod === 'email' ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Demo Account Access */}
        <div className="pt-6 border-t border-slate-50">
           <button 
             onClick={() => handleSimulatedLogin('demo', 'demo')}
             disabled={isLoading}
             className="w-full group bg-orange-50 hover:bg-orange-100 border border-orange-100 p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98]"
           >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <Check size={20} strokeWidth={3} />
                 </div>
                 <div className="text-left">
                    <h3 className="font-black text-slate-800 text-sm">Demo Access</h3>
                    <p className="text-xs text-slate-500 font-medium">Explore with sample data</p>
                 </div>
              </div>
              {isLoading && loginMethod === 'demo' ? <Loader2 className="animate-spin text-orange-500" size={20} /> : <ArrowRight size={20} className="text-orange-400" />}
           </button>
           <p className="text-center text-[10px] text-slate-400 font-bold mt-6 uppercase tracking-widest">
              By continuing you agree to Terms & Privacy
           </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
