
import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Check, Loader2, Wifi, WifiOff, Activity, Phone, ChevronLeft, Smartphone, X, Settings, Info, Copy, Sparkles, Star, Key } from 'lucide-react';

interface LoginPageProps {
  onLogin: (type: 'demo' | 'user', username?: string, identifier?: string) => void;
}

// Replace this with your actual Render URL after deployment
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop", // Dogs
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop", // Cat
  "https://images.unsplash.com/photo-1585110396065-88b74662ee22?q=80&w=1974&auto=format&fit=crop"  // Rabbit/Cute
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Navigation State
  const [view, setView] = useState<'menu' | 'email' | 'phone' | 'google_sim' | 'apple_sim' | 'forgot_password'>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Real Auth Configuration State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  // Check environment variable first, then localStorage
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  const [googleClientId, setGoogleClientId] = useState(
    envClientId || localStorage.getItem('google_client_id') || ''
  );
  const [tempClientId, setTempClientId] = useState('');
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [originError, setOriginError] = useState<string | null>(null);

  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Background Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/`);
        if (res.ok) setServerStatus('online');
        else setServerStatus('offline');
      } catch (e) {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  // Initialize Real Google Sign In if Client ID is present
  useEffect(() => {
    if (googleClientId) {
      if (!googleClientId.endsWith('.apps.googleusercontent.com')) {
          setOriginError("Invalid Client ID format. It should end with '.apps.googleusercontent.com'");
          return;
      }

      const initializeGSI = () => {
         if ((window as any).google) {
            try {
                const client = (window as any).google.accounts.oauth2.initTokenClient({
                    client_id: googleClientId,
                    scope: 'openid email profile', 
                    callback: (response: any) => {
                        if (response.access_token) {
                            fetchGoogleProfile(response.access_token);
                        } else if (response.error) {
                            console.error("Google Auth Error:", response);
                            setIsLoading(false);
                            const errorMessages: { [key: string]: string } = {
                                'access_denied': 'Access denied. Please grant permissions to continue.',
                                'invalid_client': 'Invalid Client ID. Please check your configuration.',
                                'org_internal': 'This app is restricted to your organization only.'
                            };
                            const message = errorMessages[response.error] || `Authentication failed: ${response.error}`;
                            alert(message + '\n\nIf the error persists, verify your OAuth credentials in Google Cloud Console.');
                        }
                    },
                    error_callback: (nonOAuthError: any) => {
                        setIsLoading(false);
                        if (nonOAuthError.type === 'popup_closed') {
                            return; 
                        }
                        console.error("Google Init Error:", nonOAuthError);
                        alert("Google Sign-In failed to initialize. Check Client ID and Origin.");
                    }
                });
                setTokenClient(client);
            } catch (err) {
                console.error("Google Auth Init Failed:", err);
            }
         }
      };

      if ((window as any).google) {
          initializeGSI();
      } else {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = initializeGSI;
          document.body.appendChild(script);
      }
    }
  }, [googleClientId]);

  const fetchGoogleProfile = async (token: string) => {
      setIsLoading(true);
      try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch profile');
          const data = await res.json();
          onLogin('user', data.name || data.email.split('@')[0], data.email);
      } catch (err) {
          console.error(err);
          alert('Login successful, but failed to get profile data. Ensure "Google People API" is enabled in Cloud Console.');
          setIsLoading(false);
      }
  };

  const handleSaveConfig = () => {
      const cleanedId = tempClientId.trim();
      localStorage.setItem('google_client_id', cleanedId);
      setGoogleClientId(cleanedId);
      setIsConfigOpen(false);
      // Removed window.location.reload() to prevent 404s in some environments
      // The useEffect [googleClientId] will handle re-initialization
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin('user', data.user.username, data.user.email);
      } else {
        alert(data.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Unable to connect to server. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleFinalLogin = (method: 'demo' | 'user', username: string, identifier?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(method, username, identifier);
    }, 1000);
  };

  const handleGoogleClick = () => {
      // Always use real Google OAuth if client is ready
      if (tokenClient) {
          setIsLoading(true);
          try {
              tokenClient.requestAccessToken();
          } catch (e) {
              setIsLoading(false);
              alert("Google Auth Client not ready. Please wait a moment or check configuration.");
          }
      } else {
          // If no client but Client ID exists, show alert
          if (googleClientId) {
             alert("Google Sign-In is configured but not fully loaded yet. Please wait a moment.");
          } else {
             // No configuration - open config modal to prompt setup
             alert("To use real Google Sign-In, please configure your Google Client ID in the settings (gear icon at top right).\n\nFor now, you can use the demo mode.");
             setView('google_sim');
          }
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

  // --- GOOGLE SIMULATION VIEW ---
  const GoogleSimulation = () => (
    <div className="bg-white p-6 rounded-3xl w-full max-w-sm animate-in zoom-in-95 duration-200 shadow-2xl border border-slate-100">
       <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
             <svg className="w-10 h-10" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-800">Sign in with Google</h3>
          <p className="text-sm text-slate-500">to continue to PawPal</p>
          <div className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold inline-block">Demo Simulation Mode</div>
       </div>

       <div className="space-y-2">
          <button 
             onClick={() => handleFinalLogin('user', 'Demo User', 'demo.user@gmail.com')}
             className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 text-left"
          >
             <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">D</div>
             <div>
                <p className="text-sm font-medium text-slate-700">Demo User</p>
                <p className="text-xs text-slate-500">demo.user@gmail.com</p>
             </div>
          </button>
          
          <button 
             onClick={() => handleFinalLogin('user', 'Sarah Jenkins', 'sarah.j@gmail.com')}
             className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-100 text-left"
          >
             <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">S</div>
             <div>
                <p className="text-sm font-medium text-slate-700">Sarah Jenkins</p>
                <p className="text-xs text-slate-500">sarah.j@gmail.com</p>
             </div>
          </button>
       </div>
       
       <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button onClick={() => setView('menu')} className="text-xs text-slate-500 hover:text-slate-800">Cancel</button>
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-end md:justify-center overflow-hidden">
      
      {/* --- BACKGROUND CAROUSEL --- */}
      {BACKGROUND_IMAGES.map((img, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out bg-cover bg-center ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      {/* Dark Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/90"></div>

      {/* --- SERVER STATUS ICON --- */}
      <div className="absolute top-0 left-0 p-6 z-20">
         <div className={`p-2.5 rounded-full backdrop-blur-md border transition-colors duration-500 ${
           serverStatus === 'online' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
           serverStatus === 'offline' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-white/10 border-white/20 text-white/50'
         }`}>
            {serverStatus === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />}
         </div>
      </div>

      {/* --- CONFIG MODAL (Unchanged Logic) --- */}
      {isConfigOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-xl font-black text-slate-800">Developer Settings</h3>
                          <p className="text-xs text-slate-500 mt-1">Configure real authentication.</p>
                      </div>
                      <button onClick={() => setIsConfigOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                  </div>

                  <div className="space-y-4">
                      {envClientId && (
                        <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                          <p className="text-[10px] text-green-700 font-bold">Google Client ID is configured via environment variable (.env file)</p>
                          <p className="text-[9px] text-green-600 mt-1">This will work across all devices.</p>
                        </div>
                      )}

                      <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                          <div className="flex items-start gap-2">
                            <Key size={14} className="text-slate-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-slate-700 font-bold">Setup Google OAuth (2 Options)</p>
                                <p className="text-[9px] text-slate-600 mt-1 font-bold">Option 1: Environment Variable (Recommended)</p>
                                <ol className="text-[9px] text-slate-600 mt-0.5 space-y-0.5 list-decimal list-inside ml-2">
                                    <li>Add VITE_GOOGLE_CLIENT_ID to your .env file</li>
                                    <li>Works across all devices automatically</li>
                                </ol>
                                <p className="text-[9px] text-slate-600 mt-2 font-bold">Option 2: Manual Configuration (This Device Only)</p>
                                <ol className="text-[9px] text-slate-600 mt-0.5 space-y-0.5 list-decimal list-inside ml-2">
                                    <li>Get Client ID from Google Cloud Console</li>
                                    <li>Paste below and save</li>
                                    <li>Stored in browser localStorage</li>
                                </ol>
                            </div>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                            Google Client ID {envClientId ? '(Override)' : ''}
                          </label>
                          <input
                            type="text"
                            value={tempClientId}
                            onChange={(e) => { setTempClientId(e.target.value); setOriginError(null); }}
                            placeholder={envClientId || "123456789-abc.apps.googleusercontent.com"}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
                          />
                          {originError && <p className="text-[10px] text-red-500 font-bold ml-1">{originError}</p>}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                          <div className="flex items-start gap-2">
                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">Setup Instructions</p>
                                <p className="text-[10px] text-blue-700/80 leading-relaxed mt-1">
                                    Add the <strong>Detected Origin</strong> below to "Authorized JavaScript origins" in your Google Cloud Console OAuth credentials.
                                </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest ml-1">Your Origin (Add this to Google Console)</label>
                             <div className="flex gap-2">
                                <div className="flex-1 p-2 bg-white rounded-lg border border-blue-100 font-mono text-[10px] text-slate-600 break-all">
                                    {window.location.origin}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.origin);
                                        alert("Origin copied to clipboard!");
                                    }}
                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex-shrink-0"
                                >
                                    <Copy size={14} />
                                </button>
                             </div>
                          </div>
                          <div className="text-[9px] text-blue-600 bg-white/50 p-2 rounded-lg">
                            <strong>Quick Link:</strong> <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Open Google Cloud Console</a>
                          </div>
                      </div>

                      <button 
                        onClick={handleSaveConfig}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98]"
                      >
                          Save Configuration
                      </button>
                      
                      {googleClientId && (
                        <button 
                            onClick={() => {
                                localStorage.removeItem('google_client_id');
                                setGoogleClientId('');
                                setTempClientId('');
                                setTokenClient(null);
                            }}
                            className="w-full py-3 text-red-500 text-xs font-bold hover:bg-red-50 rounded-xl"
                        >
                            Reset / Remove Key
                        </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* --- BRANDING SECTION --- */}
      <div className="relative z-10 w-full max-w-sm text-center mb-8 flex-1 flex flex-col justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 mb-6 transform rotate-6 border-4 border-white/10 backdrop-blur-sm">
            <span className="text-5xl font-black text-white">P</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg mb-2">PawPal</h1>
          <p className="text-lg font-medium text-white/80 max-w-[200px] leading-relaxed">
            The smartest companion for your furry family.
          </p>
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 pb-12 md:pb-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500 ease-out">
        {/* Decorative Handle for Mobile Feel */}
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

        {/* EMAIL LOGIN VIEW */}
        {view === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setView('menu')} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"><ChevronLeft size={24} /></button>
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

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                    <button 
                        onClick={() => { setView('forgot_password'); setResetSent(false); setResetEmail(''); }}
                        className="text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors"
                    >
                        Forgot Password?
                    </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!email || !password || isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>Sign In <ArrowRight size={20} /></>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">Don't have an account? <button type="button" onClick={() => handleFinalLogin('user', email.split('@')[0] || 'New User', email)} className="text-orange-500 font-bold">Create one</button></p>
                </div>
              </div>
            </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
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

        {/* PHONE LOGIN VIEW */}
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

      {/* OVERLAY MODALS FOR SIMULATION */}
      {(view === 'google_sim' || view === 'apple_sim') && (
         <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            {view === 'google_sim' && <GoogleSimulation />}
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
