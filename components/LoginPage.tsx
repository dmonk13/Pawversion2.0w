
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
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('google_client_id') || '');
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
      if (tokenClient) {
          setIsLoading(true);
          try {
              tokenClient.requestAccessToken();
          } catch (e) {
              setIsLoading(false);
              alert("Google Auth Client not ready. Please wait a moment or check configuration.");
          }
      } else {
          if (googleClientId) {
             alert("Google Sign-In is configured but not fully loaded yet. Please wait a moment.");
          } else {
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

      {/* --- SERVER STATUS & CONFIG --- */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-colors duration-500 ${
           serverStatus === 'online' ? 'bg-green-500/20 border-green-500/30 text-green-300' : 
           serverStatus === 'offline' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-white/10 border-white/20 text-white/50'
         }`}>
            {serverStatus === 'online' ? <Wifi size={10} /> : <WifiOff size={10} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
               {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Connecting'}
            </span>
         </div>
         
         <button 
           onClick={() => { setTempClientId(googleClientId); setIsConfigOpen(true); }}
           className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors border border-white/10"
         >
             <Settings size={18} />
         </button>
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
                      <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                          <div className="flex items-start gap-2">
                            <Key size={14} className="text-slate-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-slate-700 font-bold">Get Your Google OAuth Credentials</p>
                                <ol className="text-[9px] text-slate-600 mt-1 space-y-0.5 list-decimal list-inside">
                                    <li>Go to Google Cloud Console</li>
                                    <li>Create OAuth 2.0 Client ID (Web application)</li>
                                    <li>Add your origin to "Authorized JavaScript origins"</li>
                                    <li>Copy the Client ID and paste below</li>
                                </ol>
                            </div>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Google Client ID</label>
                          <input
                            type="text"
                            value={tempClientId}
                            onChange={(e) => { setTempClientId(e.target.value); setOriginError(null); }}
                            placeholder="123456789-abc.apps.googleusercontent.com"
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
      <div className="relative z-10 w-full max-w-sm text-center mb-8 flex-1 flex flex-col justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 px-6">
          <div className="w-28 h-28 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-500/50 mb-8 transform rotate-3 border-4 border-white/20 backdrop-blur-sm transition-transform hover:rotate-6 hover:scale-105">
            <span className="text-6xl font-black text-white transform -rotate-3">P</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-2xl mb-4 leading-none">PawPal</h1>
          <p className="text-base font-semibold text-white/90 max-w-[280px] leading-relaxed drop-shadow-lg">
            Your intelligent companion for complete pet care and wellness
          </p>
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-t-[3rem] md:rounded-[3rem] p-8 pb-12 md:pb-8 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-20 duration-500 ease-out">
        {/* Decorative Handle for Mobile Feel */}
        <div className="w-16 h-1.5 bg-slate-300 rounded-full mx-auto mb-6 md:hidden"></div>

        {view === 'menu' && (
           <div className="space-y-5 animate-in slide-in-from-left duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Sign in to access your pet's health dashboard and connect with the community</p>
              </div>
              
              <button
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg transition-all active:scale-[0.98] shadow-md relative overflow-hidden group"
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
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-black text-white transition-all active:scale-[0.98] shadow-lg shadow-black/30 hover:bg-slate-900 hover:shadow-xl"
              >
                 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.15 4.09-.6 1.12.39 2.21 1.25 2.72 2.04-2.82 1.62-2.12 5.51.68 6.75-.48 1.4-1.12 2.76-2.57 4.04zM13.03 5.48c-.66 1.76-2.91 3.12-4.43 2.84-.33-1.74 1.18-3.64 2.89-4.32 1.35-.58 3.13.06 1.54 1.48z" /></svg>
                 <span className="font-bold">Continue with Apple</span>
              </button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-wider">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setView('phone')} className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm transition-all active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Phone size={24} className="text-slate-600" />
                    </div>
                    <span>Phone</span>
                 </button>
                 <button onClick={() => setView('email')} className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm transition-all active:scale-[0.98] flex flex-col items-center gap-3 shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <Mail size={24} className="text-slate-600" />
                    </div>
                    <span>Email</span>
                 </button>
              </div>

              <div className="pt-6 text-center">
                 <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
                   <p className="text-xs text-slate-600 mb-3 font-medium">Want to explore first?</p>
                   <button onClick={() => handleFinalLogin('demo', 'Demo User', 'demo@pawpal.com')} className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-xl hover:from-orange-600 hover:to-amber-600 transition-all active:scale-[0.98]">
                      Try Demo Account
                   </button>
                 </div>
              </div>
           </div>
        )}

        {/* EMAIL LOGIN VIEW */}
        {view === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-4 mb-2">
                  <button type="button" onClick={() => setView('menu')} className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all active:scale-95 shadow-sm"><ChevronLeft size={22} /></button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Email Sign In</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Enter your credentials to continue</p>
                  </div>
               </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block ml-1">Email Address</label>
                  <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-10">
                          <Mail size={20} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
                      />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block ml-1">Password</label>
                  <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-10">
                          <Lock size={20} />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
                      />
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end -mt-1">
                    <button
                        type="button"
                        onClick={() => { setView('forgot_password'); setResetSent(false); setResetEmail(''); }}
                        className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors underline underline-offset-2"
                    >
                        Forgot your password?
                    </button>
                </div>

                <button
                  type="submit"
                  disabled={!email || !password || isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl font-black text-base shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-6"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : (
                    <>Sign In <ArrowRight size={22} /></>
                  )}
                </button>

                <div className="text-center pt-4">
                  <p className="text-sm text-slate-500">Don't have an account? <button type="button" onClick={() => handleFinalLogin('user', email.split('@')[0] || 'New User', email)} className="text-orange-500 font-bold hover:text-orange-600 transition-colors">Create one</button></p>
                </div>
              </div>
            </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot_password' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-4 mb-2">
                  <button onClick={() => setView('email')} className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all active:scale-95 shadow-sm"><ChevronLeft size={22} /></button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">We'll send you a reset link</p>
                  </div>
               </div>

               {!resetSent ? (
                   <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                          <p className="text-sm text-blue-900 font-medium leading-relaxed">Enter your email address and we'll send you a secure link to reset your password.</p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-2 block ml-1">Email Address</label>
                          <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-10">
                                  <Mail size={20} />
                              </div>
                              <input
                                  type="email"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  placeholder="you@example.com"
                                  className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
                                  autoFocus
                              />
                          </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!resetEmail || isLoading}
                            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white p-4 rounded-2xl font-black shadow-xl shadow-slate-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'Send Reset Link'}
                        </button>
                   </form>
               ) : (
                   <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                       <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-green-500/40">
                           <Check size={48} strokeWidth={3} />
                       </div>
                       <h4 className="text-2xl font-black text-slate-900 mb-3">Check your email</h4>
                       <p className="text-sm text-slate-600 mb-2 font-medium leading-relaxed px-4">
                           We've sent password reset instructions to:
                       </p>
                       <p className="text-base text-slate-900 font-bold mb-8 px-4">{resetEmail}</p>
                       <button
                           onClick={() => setView('email')}
                           className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 p-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-sm"
                       >
                           Back to Sign In
                       </button>
                   </div>
               )}
            </div>
        )}

        {/* PHONE LOGIN VIEW */}
        {view === 'phone' && (
            <form onSubmit={step === 'request' ? handleSendOtp : handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-4 mb-2">
                  <button type="button" onClick={() => { setView('menu'); setStep('request'); setOtp(''); }} className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all active:scale-95 shadow-sm"><ChevronLeft size={22} /></button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Phone Sign In</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Secure authentication via SMS</p>
                  </div>
               </div>

               {step === 'request' ? (
                 <div className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">Enter your phone number and we'll send you a secure verification code.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block ml-1">Phone Number</label>
                      <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-10">
                              <Phone size={20} />
                          </div>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-2xl font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
                            autoFocus
                          />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || phoneNumber.length < 5}
                      className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white p-4 rounded-2xl font-black shadow-xl shadow-slate-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={22} /> : 'Send Verification Code'}
                    </button>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                       <p className="text-sm text-green-900 font-medium leading-relaxed">We sent a 6-digit code to</p>
                       <p className="text-base text-green-900 font-bold mt-1">{phoneNumber}</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block text-center">Verification Code</label>
                      <input
                        type="text"
                        value={otp}
                        maxLength={6}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        className="w-full p-5 text-center text-4xl tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-2xl font-black shadow-xl shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none mt-4"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={22} /> : (
                        <>Verify & Sign In <Check size={22} /></>
                      )}
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
