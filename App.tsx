import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Dog, 
  MessageSquare, 
  Activity, 
  Plus, 
  Bell, 
  Users, 
  Search, 
  X, 
  TrendingUp, 
  Clock, 
  Heart, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Globe, 
  Weight, 
  Calendar, 
  Eye, 
  Edit3, 
  QrCode, 
  Check, 
  Move, 
  ZoomIn, 
  CheckCircle, 
  RotateCcw, 
  Settings, 
  LogOut, 
  Trash2, 
  PauseCircle, 
  Moon, 
  HelpCircle, 
  Shield, 
  User, 
  Lock, 
  Crown, 
  Sparkles, 
  CreditCard, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  ToggleLeft, 
  ToggleRight, 
  Sun, 
  Monitor, 
  AlertTriangle, 
  MessageCircle, 
  FileText, 
  Menu, 
  Image as ImageIcon, 
  Key, 
  Cookie, 
  Smartphone, 
  Loader2, 
  EyeOff, 
  Copy, 
  Info, 
  Dna, 
  AlignLeft, 
  CalendarDays, 
  Zap, 
  Download,
  Stethoscope,
  Syringe,
  Pill,
  Thermometer
} from 'lucide-react';
import { Pet, HealthLog, Task, Match, DiscoverPet } from './types';
import Dashboard from './components/Dashboard';
import PetProfiles from './components/PetProfiles';
import HealthTracker from './components/HealthTracker';
import AIAdvisor from './components/AIAdvisor';
import Community from './components/Community';
import Matches from './components/Matches';
import LoginPage from './components/LoginPage';

// --- INITIAL SAMPLE DATA (For Demo User) ---
const INITIAL_PETS: Pet[] = [
  {
    id: '1',
    name: 'Luna',
    species: 'Dog',
    breed: 'Golden Retriever',
    sex: 'Female',
    age: 3,
    weight: 28,
    origin: 'California, USA',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    lastFed: new Date().toISOString(),
    temperament: ['Friendly', 'Energetic', 'Smart'],
    bio: "Luna is a sun-loving Golden Retriever who enjoys long walks on the beach and chasing tennis balls. She's incredibly friendly with kids and other dogs."
  },
  {
    id: '2',
    name: 'Oliver',
    species: 'Cat',
    breed: 'Maine Coon',
    sex: 'Male',
    age: 2,
    weight: 6,
    origin: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
    lastFed: new Date().toISOString(),
    temperament: ['Calm', 'Independent', 'Cuddly'],
    bio: "Oliver is a majestic Maine Coon who rules the house. He enjoys high places, gourmet treats, and occasional cuddles on his own terms."
  }
];

const INITIAL_LOGS: HealthLog[] = [
  { id: '101', petId: '1', type: 'Vaccination', date: '2024-03-15', description: 'Annual Rabies Booster' },
  { id: '102', petId: '1', type: 'Checkup', date: '2024-01-10', description: 'General wellness exam - Excellent health.' }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    petId: '1',
    title: 'Dinner Time',
    type: 'Feeding',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    isRecurring: true,
    frequency: 'Daily',
    completed: false
  },
  {
    id: 't2',
    petId: '2',
    title: 'Flea Meds',
    type: 'Health',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '09:00',
    isRecurring: true,
    frequency: 'Monthly',
    completed: false
  }
];

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{name: string, identifier: string, type: 'demo' | 'user', image?: string} | null>(null);

  // App State
  const [activeTab, setActiveTab] = useState<'home' | 'pets' | 'matches' | 'health' | 'community'>('home');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');
  
  // Notification Settings State (Persisted)
  const [notifSettings, setNotifSettings] = useState(() => {
      const saved = localStorage.getItem('user_notifications');
      return saved ? JSON.parse(saved) : {
          browser: false,
          email: true,
          tasks: true
      };
  });

  // Privacy Settings State (Persisted)
  const [privacySettings, setPrivacySettings] = useState(() => {
      const saved = localStorage.getItem('user_privacy');
      return saved ? JSON.parse(saved) : {
          publicProfile: true,
          usageData: false,
          cookies: true,
          twoFactor: false
      };
  });

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Confirmation Modal State
  const [actionModal, setActionModal] = useState<{type: 'logout'|'delete'|'pause', isOpen: boolean} | null>(null);
  
  // Notification Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'info'} | null>(null);

  // Data State
  const [pets, setPets] = useState<Pet[]>([]);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // MATCHES STATE WITH SAMPLE DATA
  const [matches, setMatches] = useState<Match[]>([
     { 
         id: 'ai_expert', 
         name: 'Dr. Paw', 
         image: '', 
         type: 'ai',
         lastMessage: 'How can I help you today?',
         lastMessageTime: 'Now',
         unread: true
     },
     {
         id: 'm1',
         name: 'Cooper', 
         image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80',
         type: 'pet',
         breed: 'Golden Retriever',
         lastMessage: 'Woof! When are we playing? 🦴',
         lastMessageTime: '10m',
         unread: true
     },
     {
         id: 'm2',
         name: 'Bella',
         image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=80',
         type: 'pet',
         breed: 'French Bulldog',
         lastMessage: 'See you at the park tomorrow!',
         lastMessageTime: '1h',
         unread: false
     }
  ]);
  const [activeMatchId, setActiveMatchId] = useState<string | undefined>(undefined);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persistence Effect
  useEffect(() => {
    if (isAuthenticated && userProfile) {
       const prefix = userProfile.type === 'demo' ? 'demo_' : 'user_';
       localStorage.setItem(`${prefix}pets`, JSON.stringify(pets));
       localStorage.setItem(`${prefix}logs`, JSON.stringify(logs));
       localStorage.setItem(`${prefix}tasks`, JSON.stringify(tasks));
    }
    localStorage.setItem('user_notifications', JSON.stringify(notifSettings));
    localStorage.setItem('user_privacy', JSON.stringify(privacySettings));
  }, [pets, logs, tasks, isAuthenticated, userProfile, notifSettings, privacySettings]);

  const showNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- TASK NUDGE / ALARM SYSTEM ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTasks = () => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      const dueTask = tasks.find(t => 
        !t.completed && 
        t.date === currentDate && 
        t.time === currentTime
      );

      if (dueTask && notifSettings.tasks) {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = 880; 
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.5); 
        } catch (e) {
            console.error("Audio play failed", e);
        }

        const petName = pets.find(p => p.id === dueTask.petId)?.name || 'Pet';
        const notifText = `Reminder: ${dueTask.title} for ${petName}!`;

        showNotification(notifText, 'info');

        if (notifSettings.browser && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('PawPal Task Reminder', {
                body: notifText,
                icon: '/icon.png' 
            });
        }
      }
    };

    const interval = setInterval(checkTasks, 60000);
    checkTasks(); 

    return () => clearInterval(interval);
  }, [tasks, isAuthenticated, pets, notifSettings]);

  const handleNotifToggle = async (key: keyof typeof notifSettings) => {
      if (key === 'browser') {
          if (!notifSettings.browser) {
              if (!('Notification' in window)) {
                  alert('This browser does not support desktop notifications');
                  return;
              }
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                  setNotifSettings(prev => ({ ...prev, browser: true }));
                  new Notification('PawPal', { body: 'Browser notifications are now active!' });
              } else {
                  alert('Permission denied. You must enable notifications in your browser settings to use this feature.');
                  setNotifSettings(prev => ({ ...prev, browser: false }));
              }
          } else {
              setNotifSettings(prev => ({ ...prev, browser: false }));
          }
      } else {
          setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
          if (key === 'email' && !notifSettings.email) {
              showNotification("Subscribed to weekly email digest", "success");
          } else if (key === 'email' && notifSettings.email) {
              showNotification("Unsubscribed from email digest", "info");
          }
      }
  };

  const handlePrivacyToggle = (key: keyof typeof privacySettings) => {
      const newVal = !privacySettings[key];
      setPrivacySettings(prev => ({...prev, [key]: newVal}));
      
      if (key === 'publicProfile') {
          showNotification(newVal ? "Your profile is now visible to the community." : "Your profile is now hidden.", "info");
      } else if (key === 'usageData') {
          showNotification(newVal ? "Thanks for helping us improve!" : "Usage data sharing disabled.", "info");
      } else if (key === 'twoFactor' && !newVal) {
          showNotification("Two-Factor Authentication disabled.", "info");
      }
  };

  const handleLogin = (type: 'demo' | 'user', username: string = 'User', identifier: string = '') => {
    const prefix = type === 'demo' ? 'demo_' : 'user_';
    
    const savedPets = localStorage.getItem(`${prefix}pets`);
    const savedLogs = localStorage.getItem(`${prefix}logs`);
    const savedTasks = localStorage.getItem(`${prefix}tasks`);

    if (type === 'demo') {
      setPets(savedPets ? JSON.parse(savedPets) : INITIAL_PETS);
      setLogs(savedLogs ? JSON.parse(savedLogs) : INITIAL_LOGS);
      setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS);
      setUserPlan('Pro');
      setUserProfile({ name: 'Demo User', identifier: 'demo@pawpal.com', type: 'demo' });
    } else {
      setPets(savedPets ? JSON.parse(savedPets) : []);
      setLogs(savedLogs ? JSON.parse(savedLogs) : []);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      setUserPlan('Free');
      setUserProfile({ name: username, identifier: identifier || 'No contact info', type: 'user' });
    }
    
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  const handleUpdateProfile = (updates: Partial<typeof userProfile>) => {
      if (userProfile) {
          const updatedProfile = { ...userProfile, ...updates };
          if (updates.name !== undefined) updatedProfile.name = updates.name;
          if (updates.image !== undefined) updatedProfile.image = updates.image;
          
          setUserProfile(updatedProfile as any);
          showNotification("Profile updated successfully!");
      }
  };

  const executeLogout = () => {
    setIsSettingsOpen(false);
    setActionModal(null);
    setIsAuthenticated(false);
    setUserProfile(null);
    setPets([]);
    setLogs([]);
    setTasks([]);
  };

  const executeDelete = () => {
    setIsSettingsOpen(false);
    setActionModal(null);
    setIsAuthenticated(false);
    alert("Account deleted successfully."); 
  };

  const executePause = () => {
    setIsSettingsOpen(false);
    setActionModal(null);
    showNotification("Account paused. Data is safe.", "info");
  };

  const handleSavePet = (petData: any, newLogs: HealthLog[] = []) => {
    let targetId = editingPet?.id;

    if (editingPet) {
      setPets(pets.map(p => p.id === editingPet.id ? { ...editingPet, ...petData } : p));
      setEditingPet(null);
      showNotification("Pet profile updated!");
    } else {
      targetId = Math.random().toString(36).substr(2, 9);
      const newPet: Pet = {
        ...petData,
        id: targetId,
        image: petData.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        lastFed: new Date().toISOString()
      };
      setPets([...pets, newPet]);
      showNotification(`Welcome to the family, ${newPet.name}!`);
    }

    if (newLogs && newLogs.length > 0 && targetId) {
       const processedLogs = newLogs.map(log => ({
           ...log,
           petId: targetId!
       }));
       setLogs(prev => [...processedLogs, ...prev]);
       if (newLogs.length === 1) showNotification("Health record added.");
       else showNotification(`${newLogs.length} health records added.`);
    }

    setIsAddPetOpen(false);
    setActiveTab('pets');
  };

  const removePet = (id: string) => {
    setPets(prev => prev.filter(p => p.id !== id));
    showNotification("Pet removed from profile", "info");
  };

  const addLog = (newLog: HealthLog) => {
    setLogs([newLog, ...logs]);
    showNotification("Health record added");
  };

  const handleAddTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    showNotification("Reminder set!");
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setIsAddPetOpen(true);
  };

  const handleUpgrade = () => {
    setIsProModalOpen(false);
    setUserPlan('Pro');
    showNotification("Upgraded to Pro! Enjoy!");
  };

  const handleNewMatch = (pet: DiscoverPet) => {
    const newMatch: Match = {
        id: pet.id,
        name: pet.name,
        image: pet.image,
        type: 'pet',
        breed: pet.breed,
        lastMessage: "It's a Match! Say hello.",
        unread: true,
        lastMessageTime: 'Now'
    };
    
    if (!matches.some(m => m.id === newMatch.id)) {
        setMatches(prev => [newMatch, ...prev]);
        showNotification(`You matched with ${pet.name}!`, 'success');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            pets={pets} 
            logs={logs} 
            tasks={tasks}
            onSelectPet={(id) => { setSelectedPetId(id); setActiveTab('pets'); }} 
            onAddPet={() => { setEditingPet(null); setIsAddPetOpen(true); }} 
            onAddTask={handleAddTask}
            onToggleTask={toggleTask}
            onEditPet={openEditModal}
            onRemovePet={removePet}
            onNavigate={(tab) => {
              if (tab === 'ai') {
                setActiveTab('matches');
                setActiveMatchId('ai_expert');
              } else {
                setActiveTab(tab);
              }
            }}
            userName={userProfile?.name}
          />
        );
      case 'pets':
        return (
          <PetProfiles 
            pets={pets} 
            onAddPet={() => { setEditingPet(null); setIsAddPetOpen(true); }} 
            initialSelectedId={selectedPetId} 
            onClearSelection={() => setSelectedPetId(null)}
            onRemovePet={removePet}
            onEditPet={openEditModal}
            logs={logs}
            onAddLog={addLog}
          />
        );
      case 'community':
        return <Community onMatch={handleNewMatch} />;
      case 'matches':
        return (
            <Matches 
                matches={matches} 
                pets={pets}
                activeMatchId={activeMatchId}
                onSelectMatch={setActiveMatchId}
            />
        );
      case 'health':
        return <HealthTracker pets={pets} logs={logs} onAddLog={addLog} />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isChatActive = activeTab === 'matches' && activeMatchId !== undefined;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[160] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
           {toast.type === 'success' ? <CheckCircle size={18} className="text-green-400 dark:text-green-600" /> : <Clock size={18} className="text-orange-400 dark:text-orange-500" />}
           <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">P</div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">PawPal</h1>
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-[0.2em]">Connect</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <SidebarButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Layout size={20} />} label="Dashboard" />
          <SidebarButton active={activeTab === 'pets'} onClick={() => setActiveTab('pets')} icon={<Dog size={20} />} label="My Family" />
          <SidebarButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} icon={<MessageCircle size={20} />} label="Messages" />
          <SidebarButton active={activeTab === 'health'} onClick={() => setActiveTab('health')} icon={<Activity size={20} />} label="Health Tracker" />
          <SidebarButton active={activeTab === 'community'} onClick={() => setActiveTab('community')} icon={<Users size={20} />} label="Community" />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
              {userProfile?.image ? (
                  <img src={userProfile.image} alt="Profile" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0">
                      {userProfile?.name?.charAt(0).toUpperCase()}
                  </div>
              )}
              <div className="flex-1 text-left">
                 <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{userProfile?.name || 'User'}</p>
                 <p className="text-xs text-slate-400">{userPlan} Plan</p>
              </div>
              <Settings size={16} />
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
        
        {/* Header - Sticky on Mobile, Integrated on Desktop */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0 transition-colors duration-300 shadow-sm md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">P</div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">PawPal</h1>
              <span className="text-[9px] text-orange-500 font-bold uppercase tracking-[0.2em]">Connect</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsNotificationsOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-all overflow-hidden">
                {userProfile?.image ? (
                    <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : userProfile?.name ? (
                    <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-xs">{userProfile.name.charAt(0).toUpperCase()}</div>
                ) : (
                    <Settings size={18} />
                )}
            </button>
          </div>
        </header>

        {/* Desktop Top Bar (Search & Notifs) */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-30 shrink-0">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tight">{activeTab === 'home' ? 'Dashboard' : activeTab.replace(/([A-Z])/g, ' $1').trim()}</h2>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsNotificationsOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all relative shadow-sm">
                 <Bell size={18} />
                 <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
              </button>
           </div>
        </div>

        {/* Main Content Render */}
        <main className={`flex-1 transition-colors duration-300 relative w-full mx-auto ${isChatActive ? 'overflow-hidden h-full' : 'overflow-y-auto pb-24 md:pb-8 no-scrollbar bg-slate-50/50 dark:bg-slate-950/50'}`}>
          <div className="h-full w-full max-w-7xl mx-auto md:px-6">
             {renderContent()}
          </div>
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        {!isChatActive && (
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-4 py-3 pb-safe flex justify-between items-center z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300">
              <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedPetId(null); }} icon={<Layout size={22} />} label="Home" />
              <NavButton active={activeTab === 'pets'} onClick={() => { setActiveTab('pets'); setSelectedPetId(null); }} icon={<Dog size={22} />} label="Family" />
              <div className="relative -top-6">
                <button onClick={() => { setActiveTab('matches'); setSelectedPetId(null); }} className={`p-4 rounded-[2rem] shadow-2xl shadow-orange-500/30 transition-all duration-500 ${activeTab === 'matches' ? 'bg-orange-500 rotate-[360deg]' : 'bg-slate-900 dark:bg-slate-800'} text-white group`}>
                  <MessageCircle size={26} className="group-active:scale-90 transition-transform" />
                </button>
              </div>
              <NavButton active={activeTab === 'health'} onClick={() => { setActiveTab('health'); setSelectedPetId(null); }} icon={<Activity size={22} />} label="Health" />
              <NavButton active={activeTab === 'community'} onClick={() => { setActiveTab('community'); setSelectedPetId(null); }} icon={<Users size={22} />} label="Social" />
            </nav>
        )}
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-300 flex flex-col md:hidden">
          <div className="p-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl">
              <Search size={20} className="text-slate-400" />
              <input autoFocus type="text" placeholder="Search pets..." className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-white font-medium" />
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="text-orange-500 font-bold px-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Notifications Overlay */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}>
          <div className="absolute top-0 right-0 w-[85%] md:w-96 h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Alerts</h2>
              <button onClick={() => setIsNotificationsOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <NotificationItem icon={<Clock className="text-orange-500"/>} title="Feeding Time" desc="Luna's dinner is scheduled in 15 mins." time="Now" />
              <NotificationItem icon={<Heart className="text-pink-500"/>} title="Vet Visit" desc="Don't forget Oliver's checkup tomorrow." time="2h ago" />
              <NotificationItem icon={<Users className="text-blue-500"/>} title="Community" desc="Sarah liked your post about Buster." time="5h ago" />
            </div>
          </div>
        </div>
      )}

      {/* Settings Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
          <div className="absolute top-0 right-0 w-[85%] md:w-96 h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
             <SettingsSidebar 
                onClose={() => setIsSettingsOpen(false)} 
                onLogout={() => setActionModal({ type: 'logout', isOpen: true })}
                onDelete={() => setActionModal({ type: 'delete', isOpen: true })}
                onPause={() => setActionModal({ type: 'pause', isOpen: true })}
                onOpenPro={() => setIsProModalOpen(true)}
                onUpdateProfile={handleUpdateProfile}
                onToggleNotif={handleNotifToggle}
                onTogglePrivacy={handlePrivacyToggle}
                notifSettings={notifSettings}
                privacySettings={privacySettings}
                userPlan={userPlan}
                userName={userProfile?.name}
                userIdentifier={userProfile?.identifier}
                userImage={userProfile?.image}
                theme={theme}
                setTheme={setTheme}
                onForceLogout={executeLogout}
                showNotification={showNotification}
              />
          </div>
        </div>
      )}

      {/* Pro Plan Modal */}
      {isProModalOpen && (
        <ProPlanModal onClose={() => setIsProModalOpen(false)} onUpgrade={handleUpgrade} userPlan={userPlan} />
      )}

      {/* Add/Edit Pet Modal */}
      {isAddPetOpen && (
        <AddPetModal 
          onClose={() => { setIsAddPetOpen(false); setEditingPet(null); }} 
          onSubmit={handleSavePet}
          initialData={editingPet}
        />
      )}

      {/* Global Confirmation Modal */}
      {actionModal && actionModal.isOpen && (
        <ConfirmationModal 
          isOpen={actionModal.isOpen}
          title={actionModal.type === 'logout' ? 'Log Out' : actionModal.type === 'delete' ? 'Delete Account' : 'Pause Account'}
          description={
             actionModal.type === 'logout' ? 'Are you sure you want to log out of your account?' :
             actionModal.type === 'delete' ? 'This action is permanent and cannot be undone. All data will be lost.' :
             'You won\'t receive notifications, but your data will be kept safe until you return.'
          }
          confirmText={actionModal.type === 'logout' ? 'Log Out' : actionModal.type === 'delete' ? 'Delete' : 'Pause'}
          cancelText="Cancel"
          onConfirm={() => {
             if (actionModal.type === 'logout') executeLogout();
             if (actionModal.type === 'delete') executeDelete();
             if (actionModal.type === 'pause') executePause();
          }}
          onCancel={() => setActionModal(null)}
          isDanger={actionModal.type === 'delete' || actionModal.type === 'logout'}
        />
      )}
    </div>
  );
};

const SidebarButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
  >
    {icon}
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </button>
);

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 3 : 2 })}
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

const NotificationItem = ({ icon, title, desc, time }: any) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-black text-slate-800 dark:text-white text-sm">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{desc}</p>
      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-500 mt-2 block">{time}</span>
    </div>
  </div>
);

const ConfirmationModal = ({ isOpen, title, description, confirmText, cancelText, onConfirm, onCancel, isDanger = false }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'}`}>
             <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">{description}</p>
          <div className="flex gap-3">
             <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                {cancelText}
             </button>
             <button onClick={onConfirm} className={`flex-1 py-3 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-transform ${isDanger ? 'bg-red-500 shadow-red-500/30 hover:bg-red-600' : 'bg-orange-500 shadow-orange-500/30 hover:bg-orange-600'}`}>
                {confirmText}
             </button>
          </div>
       </div>
    </div>
  )
}

const SettingsSidebar = ({ onClose, onLogout, onDelete, onPause, onOpenPro, onUpdateProfile, onToggleNotif, onTogglePrivacy, notifSettings, privacySettings, userPlan, userName, userIdentifier, userImage, theme, setTheme, onForceLogout, showNotification }: any) => {
  const [view, setView] = useState<'main' | 'profile' | 'edit_profile' | 'notifications' | 'privacy' | 'appearance' | 'help' | 'terms'>('main');
  const [editName, setEditName] = useState(userName || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      setEditName(userName || '');
  }, [userName]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateProfile({ image: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const Header = ({ title, onBack }: any) => (
    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 py-2 border-b border-slate-50 dark:border-slate-800">
      <button onClick={onBack} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h2 className="text-lg font-black text-slate-800 dark:text-white">{title}</h2>
    </div>
  );

  const MENU_GROUPS = [
    {
      title: 'Account',
      items: [
        { id: 'profile', icon: <User size={20} />, label: 'My Profile', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/20' }
      ]
    },
    {
      title: 'App Settings',
      items: [
        { id: 'appearance', icon: <Sun size={20} />, label: 'Appearance', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/20' },
        { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/20' }
      ]
    },
    {
      title: 'Support & Safety',
      items: [
        { id: 'privacy', icon: <Shield size={20} />, label: 'Privacy & Security', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/20' },
        { id: 'help', icon: <HelpCircle size={20} />, label: 'Help & Support', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/20' }
      ]
    }
  ];

  const renderContent = () => {
    switch(view) {
      case 'profile':
        return (
           <div className="animate-in slide-in-from-right duration-300">
              <Header title="My Profile" onBack={() => setView('main')} />
              <div className="space-y-6">
                 <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative group">
                       <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800">
                          {userImage ? (
                             <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-2xl">
                                {editName.charAt(0).toUpperCase()}
                             </div>
                          )}
                       </div>
                       <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                          <Camera size={16} />
                       </button>
                       <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                    <div className="text-center">
                       <h3 className="text-xl font-black text-slate-900 dark:text-white">{userName}</h3>
                       <p className="text-sm text-slate-500 dark:text-slate-400">{userIdentifier}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                       <input 
                         type="text" 
                         value={editName}
                         onChange={(e) => setEditName(e.target.value)}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email / Phone</label>
                       <input 
                         type="text" 
                         value={userIdentifier || ''}
                         disabled
                         className="w-full p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl font-bold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                       />
                    </div>
                 </div>

                 <button 
                   onClick={() => { onUpdateProfile({ name: editName }); setView('main'); }}
                   className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-lg mt-4 active:scale-[0.98] transition-all"
                 >
                    Save Changes
                 </button>
              </div>
           </div>
        );
      case 'appearance':
        return (
           <div className="animate-in slide-in-from-right duration-300">
              <Header title="Appearance" onBack={() => setView('main')} />
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Theme</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-orange-500 bg-orange-50 dark:bg-slate-700 dark:border-orange-500 text-orange-600 dark:text-orange-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><Sun size={24} /><span className="text-xs font-black uppercase">Light</span></button>
                       <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-orange-500 bg-slate-800 text-orange-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><Moon size={24} /><span className="text-xs font-black uppercase">Dark</span></button>
                    </div>
                 </div>
              </div>
           </div>
        );
      case 'notifications':
        return (
           <div className="animate-in slide-in-from-right duration-300">
              <Header title="Notifications" onBack={() => setView('main')} />
              <div className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-700 space-y-1">
                 {[
                    { id: 'browser', label: 'Browser Notifications', desc: 'Receive alerts in your browser' },
                    { id: 'email', label: 'Email Digest', desc: 'Weekly summary of pet health' },
                    { id: 'tasks', label: 'Task Reminders', desc: 'Alerts for feeding & meds' }
                 ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-700/50 transition-colors">
                       <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</p>
                          <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                       </div>
                       <button 
                         onClick={() => onToggleNotif(item.id)}
                         className={`w-12 h-7 rounded-full transition-colors relative ${notifSettings[item.id] ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                       >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${notifSettings[item.id] ? 'left-6' : 'left-1'}`}></div>
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        );
      case 'privacy':
        return (
           <div className="animate-in slide-in-from-right duration-300">
              <Header title="Privacy & Security" onBack={() => setView('main')} />
              <div className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-700 space-y-1">
                 {[
                    { id: 'publicProfile', label: 'Public Profile', desc: 'Allow others to find you in Community' },
                    { id: 'usageData', label: 'Share Usage Data', desc: 'Help us improve PawPal' },
                    { id: 'twoFactor', label: 'Two-Factor Auth', desc: 'Extra layer of security' }
                 ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-700/50 transition-colors">
                       <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</p>
                          <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                       </div>
                       <button 
                         onClick={() => onTogglePrivacy(item.id)}
                         className={`w-12 h-7 rounded-full transition-colors relative ${privacySettings[item.id] ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                       >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${privacySettings[item.id] ? 'left-6' : 'left-1'}`}></div>
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        );
      case 'help':
        return (
           <div className="animate-in slide-in-from-right duration-300">
              <Header title="Help & Support" onBack={() => setView('main')} />
              <div className="space-y-4">
                 <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center space-y-3">
                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-pink-500 shadow-sm">
                       <Heart size={32} fill="currentColor" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg">We're here to help!</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                       If you have any questions or issues, please reach out to our support team. We typically respond within 24 hours.
                    </p>
                    <button onClick={() => showNotification('Support email copied to clipboard!', 'info')} className="px-6 py-3 bg-white dark:bg-slate-700 rounded-xl font-bold text-slate-700 dark:text-white shadow-sm text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-600 mt-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                       pawpal1.51@gmail.com
                    </button>
                 </div>
                 
                 <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">FAQ</h4>
                    {[
                      'How do I add a pet?', 
                      'Is my data secure?', 
                      'How to upgrade to Pro?',
                      'What is the Breed Scanner?',
                      'How do I find a nearby vet?',
                      'Can I track multiple pets?'
                    ].map((q, i) => (
                       <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group cursor-pointer hover:border-orange-200 transition-colors">
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{q}</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        );
      default: return (
        <div className="animate-in slide-in-from-left duration-300 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-2">
              {userPlan === 'Free' && (
                 <div className="p-1 rounded-[2rem] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 shadow-xl shadow-orange-500/20 group cursor-pointer active:scale-[0.98] transition-all" onClick={onOpenPro}>
                    <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] p-5 relative overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-lg">
                              <Crown size={24} fill="currentColor" />
                           </div>
                           <div className="flex-1">
                              <h3 className="font-black text-lg text-slate-900 dark:text-white">Upgrade to Pro</h3>
                              <p className="text-xs font-bold text-slate-400">Unlock AI insights & more</p>
                           </div>
                           <ChevronRight size={20} className="text-slate-300" />
                        </div>
                    </div>
                 </div>
              )}
              {MENU_GROUPS.map((group, idx) => (
                <div key={idx}>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">{group.title}</h4>
                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-2 border border-slate-100 dark:border-slate-800/50 space-y-1">
                      {group.items.map(item => (
                         <button 
                           key={item.id} 
                           onClick={() => setView(item.id as any)}
                           className="w-full flex items-center gap-4 p-3 rounded-[1.5rem] hover:bg-white dark:hover:bg-slate-800 transition-all group active:scale-[0.98]"
                         >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                               {item.icon}
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 flex-1 text-left">{item.label}</span>
                            <div className="w-8 h-8 rounded-full bg-transparent group-hover:bg-slate-50 dark:group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <ChevronRight size={18} className="text-slate-300 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white" />
                            </div>
                         </button>
                      ))}
                   </div>
                </div>
              ))}
              <div className="space-y-3 pt-4">
                 <button onClick={onPause} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <PauseCircle size={20} />
                    <span className="flex-1 text-left">Pause Account</span>
                 </button>
                 <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <LogOut size={20} />
                    <span className="flex-1 text-left">Log Out</span>
                 </button>
                 <button onClick={onDelete} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] bg-red-50 dark:bg-red-900/10 text-red-500 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={20} />
                    <span className="flex-1 text-left">Delete Account</span>
                 </button>
              </div>
              <div className="text-center pb-6">
                 <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">PawPal v1.0.2</p>
              </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="h-full bg-white dark:bg-slate-900 flex flex-col p-6 overflow-y-auto">{renderContent()}</div>
  );
};

const ProPlanModal = ({ onClose, onUpgrade, userPlan }: any) => {
  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
            </button>
            
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30 transform rotate-6">
                    <Crown size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Upgrade to Pro</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Unlock the full potential of PawPal AI</p>
            </div>

            <div className="space-y-4 mb-8">
                {[
                    'Unlimited AI Vet Consultations',
                    'Advanced Health Analytics & Trends',
                    'Priority Community Matching',
                    'Cloud Backup for Medical Records',
                    'Ad-Free Experience'
                ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                            <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{feat}</span>
                    </div>
                ))}
            </div>

            {userPlan === 'Pro' ? (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl font-bold">
                    You are already a Pro member!
                </div>
            ) : (
                <button 
                    onClick={onUpgrade}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles size={20} fill="currentColor" /> Upgrade Now - $9.99/mo
                </button>
            )}
            
            <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">Cancel anytime. Secure payment.</p>
        </div>
    </div>
  );
};

// UPDATED AddPetModal Component
const AddPetModal = ({ onClose, onSubmit, initialData }: any) => {
  const [activeSubTab, setActiveSubTab] = useState<'edit' | 'health' | 'passport'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState(initialData || { 
      name: '', 
      species: 'Dog', 
      breed: '', 
      sex: 'Male', 
      age: '', 
      weight: '', 
      origin: '', 
      bio: '', 
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
      temperament: [] 
  });
  
  const [tempTags, setTempTags] = useState(initialData?.temperament?.join(', ') || '');
  const [pendingLogs, setPendingLogs] = useState<HealthLog[]>([]);
  const [newLogData, setNewLogData] = useState<Partial<HealthLog>>({ 
      type: 'Checkup', 
      date: new Date().toISOString().split('T')[0], 
      description: '' 
  });

  const COMMON_TAGS = ['Friendly', 'Playful', 'Calm', 'Energetic', 'Loyal', 'Shy', 'Smart', 'Cuddly', 'Protective', 'Curious'];

  const handleChange = (field: string, value: any) => {
      setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData({ ...formData, image: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleTagClick = (tag: string) => {
      const current = tempTags.split(',').map((t: string) => t.trim()).filter(Boolean);
      if (!current.includes(tag)) {
          const newTags = current.length > 0 ? `${tempTags}, ${tag}` : tag;
          setTempTags(newTags);
      }
  };

  const handleAddHealthRecord = () => {
      if (!newLogData.description) return;
      const log: HealthLog = {
          id: Math.random().toString(36).substr(2, 9),
          petId: 'temp', // Will be replaced on submit
          type: newLogData.type as any,
          date: newLogData.date || new Date().toISOString().split('T')[0],
          description: newLogData.description
      };
      setPendingLogs([...pendingLogs, log]);
      setNewLogData({ ...newLogData, description: '' });
  };

  const removePendingLog = (id: string) => {
      setPendingLogs(pendingLogs.filter(l => l.id !== id));
  };

  const handleSubmit = () => {
      const finalData = {
          ...formData,
          temperament: tempTags.split(',').map((t: string) => t.trim()).filter(Boolean)
      };
      onSubmit(finalData, pendingLogs);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
       <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
          
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors z-20">
             <X size={20} />
          </button>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 text-center">{initialData ? 'Edit Profile' : 'New Family Member'}</h2>

          {/* Sub-Tabs for Better Web Layout */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8 self-center w-full max-w-md">
             <button 
                onClick={() => setActiveSubTab('edit')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeSubTab === 'edit' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
             >
                <Edit3 size={16} /> Edit
             </button>
             <button 
                onClick={() => setActiveSubTab('health')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeSubTab === 'health' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
             >
                <Activity size={16} /> Health
             </button>
             <button 
                onClick={() => setActiveSubTab('passport')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeSubTab === 'passport' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
             >
                <QrCode size={16} /> Passport
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-1">
             {activeSubTab === 'edit' && (
                 <div className="space-y-8 animate-in slide-in-from-left duration-300">
                    {/* Photo & Basics */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="flex flex-col items-center gap-3 shrink-0 mx-auto sm:mx-0">
                            <div 
                                className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl relative group bg-slate-100 dark:bg-slate-800 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={28} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            <div className="relative w-full">
                                <input 
                                   type="text" 
                                   placeholder="Paste Image URL" 
                                   value={formData.image}
                                   onChange={(e) => handleChange('image', e.target.value)}
                                   className="w-full text-[10px] bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1.5 text-center text-slate-500 font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 space-y-5 w-full">
                            <div>
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Name</label>
                               <div className="relative group">
                                   <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                   <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder="Pet Name" />
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Species</label>
                                   <div className="relative group">
                                       <Dna size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                       <select value={formData.species} onChange={e => handleChange('species', e.target.value)} className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                           <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
                                       </select>
                                       <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                   </div>
                               </div>
                               <div>
                                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Breed</label>
                                   <input type="text" value={formData.breed} onChange={e => handleChange('breed', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder="Breed" />
                               </div>
                            </div>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       <div>
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Sex</label>
                           <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                               {['Male', 'Female'].map(gender => (
                                   <button
                                       key={gender}
                                       onClick={() => handleChange('sex', gender)}
                                       className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${formData.sex === gender ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-[1.02]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                   >
                                       {gender === 'Female' ? <Heart size={14} className={formData.sex === 'Female' ? 'text-pink-500' : ''}/> : <Zap size={14} className={formData.sex === 'Male' ? 'text-blue-500' : ''}/>}
                                       {gender}
                                   </button>
                               ))}
                           </div>
                       </div>
                       
                       <div>
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Origin</label>
                           <div className="relative group">
                               <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                               <input type="text" value={formData.origin || ''} onChange={e => handleChange('origin', e.target.value)} className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder="City, Country" />
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Age (yrs)</label>
                               <div className="relative group">
                                   <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                   <input type="number" value={formData.age} onChange={e => handleChange('age', e.target.value)} className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder="0" />
                               </div>
                           </div>
                           <div>
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Weight (kg)</label>
                               <div className="relative group">
                                   <Weight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                   <input type="number" value={formData.weight} onChange={e => handleChange('weight', e.target.value)} className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder="0" />
                               </div>
                           </div>
                       </div>
                    </div>

                    {/* About & Bio */}
                    <div className="space-y-5">
                        <div>
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Bio / About</label>
                           <div className="relative group">
                               <AlignLeft size={18} className="absolute left-4 top-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                               <textarea 
                                   value={formData.bio || ''} 
                                   onChange={e => handleChange('bio', e.target.value)} 
                                   className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 resize-none h-28 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all leading-relaxed" 
                                   placeholder="Tell us about your pet's personality..."
                               />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-1 block">Temperament</label>
                           <div className="relative group">
                               <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                               <input 
                                   type="text" 
                                   value={tempTags} 
                                   onChange={e => setTempTags(e.target.value)} 
                                   className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all" 
                                   placeholder="Friendly, Energetic, Calm..."
                               />
                           </div>
                           <div className="flex flex-wrap gap-2 mt-3">
                               {COMMON_TAGS.map(tag => (
                                   <button 
                                     key={tag}
                                     onClick={() => handleTagClick(tag)}
                                     className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
                                   >
                                     + {tag}
                                   </button>
                               ))}
                           </div>
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-lg active:scale-[0.99] transition-transform">
                        {initialData ? 'Save Changes' : 'Add Pet'}
                    </button>
                 </div>
             )}

             {activeSubTab === 'health' && (
                 <div className="animate-in slide-in-from-right duration-300 space-y-6">
                     <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                         <h3 className="font-bold text-slate-800 dark:text-white mb-4">Add Health Record</h3>
                         <div className="space-y-3">
                             <div className="grid grid-cols-2 gap-3">
                                 <select 
                                    value={newLogData.type} 
                                    onChange={e => setNewLogData({...newLogData, type: e.target.value as any})}
                                    className="p-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 outline-none"
                                 >
                                     <option>Checkup</option><option>Vaccination</option><option>Medication</option><option>Note</option>
                                 </select>
                                 <input 
                                    type="date"
                                    value={newLogData.date}
                                    onChange={e => setNewLogData({...newLogData, date: e.target.value})}
                                    className="p-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 outline-none"
                                 />
                             </div>
                             <textarea 
                                placeholder="Details..."
                                value={newLogData.description}
                                onChange={e => setNewLogData({...newLogData, description: e.target.value})}
                                className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 outline-none resize-none h-20"
                             />
                             <button 
                                onClick={handleAddHealthRecord}
                                disabled={!newLogData.description}
                                className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold shadow-md disabled:opacity-50 disabled:shadow-none"
                             >
                                 Add to List
                             </button>
                         </div>
                     </div>

                     <div className="space-y-2">
                         <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Pending Records ({pendingLogs.length})</h4>
                         {pendingLogs.length > 0 ? (
                             pendingLogs.map((log, i) => (
                                 <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                     <div>
                                         <div className="flex items-center gap-2">
                                             <span className="text-xs font-bold text-slate-800 dark:text-white">{log.type}</span>
                                             <span className="text-[10px] text-slate-400">{log.date}</span>
                                         </div>
                                         <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{log.description}</p>
                                     </div>
                                     <button onClick={() => removePendingLog(log.id)} className="text-red-400 hover:text-red-500"><X size={16} /></button>
                                 </div>
                             ))
                         ) : (
                             <div className="text-center py-6 text-slate-400 text-xs italic">No records added yet.</div>
                         )}
                     </div>
                     <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-lg active:scale-[0.99] transition-transform">
                        {initialData ? 'Save Changes' : 'Create Profile'}
                    </button>
                 </div>
             )}

             {activeSubTab === 'passport' && (
                 <div className="animate-in slide-in-from-right duration-300 flex flex-col items-center">
                     {/* Updated Official Passport Card - Blue Design */}
                     <div className="w-full max-w-[340px] aspect-[4/5] rounded-[1.8rem] overflow-hidden shadow-2xl relative bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col transform hover:scale-[1.02] transition-transform duration-500">
                        
                        {/* Background Patterns */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 border-[40px] border-white/5 rounded-full pointer-events-none"></div>
                        <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Card Header */}
                        <div className="relative z-10 px-6 pt-6 pb-2 flex justify-between items-start">
                            <div>
                                <p className="text-[9px] font-bold tracking-[0.2em] text-blue-200 uppercase mb-1">OFFICIAL PASSPORT</p>
                                <h1 className="text-3xl font-serif font-bold tracking-wide text-white drop-shadow-sm">PAWPAL</h1>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg shadow-lg">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(formData.name)}`}
                                    className="w-10 h-10"
                                    alt="QR"
                                />
                            </div>
                        </div>

                        {/* ID */}
                        <div className="px-6 relative z-10">
                            <p className="font-mono text-[9px] text-blue-300 tracking-wider">ID: UEWHCBT5</p>
                        </div>

                        {/* Main Content */}
                        <div className="px-6 py-6 flex gap-4 items-center relative z-10">
                            {/* Pet Image */}
                            <div className="w-24 h-24 rounded-2xl border-[3px] border-yellow-400/30 overflow-hidden shadow-lg shrink-0 bg-blue-800">
                                <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
                            </div>
                            
                            {/* Details */}
                            <div className="space-y-3 min-w-0">
                                <div>
                                    <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">NAME</p>
                                    <h2 className="text-xl font-bold leading-none truncate">{formData.name || 'Pet Name'}</h2>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">BREED</p>
                                    <p className="text-xs font-medium leading-tight truncate text-blue-50">{formData.breed || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">MICROCHIP ID</p>
                                    <p className="text-[10px] font-medium leading-tight tracking-wider text-blue-100">985-120-264</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Curved Section */}
                        <div className="mt-auto relative">
                            {/* Curved Divider Illusion */}
                            <div className="absolute -top-12 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-blue-800/40 opacity-50"></div>
                            <div className="bg-blue-800/40 backdrop-blur-sm pt-6 pb-8 px-6 border-t border-white/5 relative z-10">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest mb-1">BORN</p>
                                        <p className="text-sm font-bold">{new Date().getFullYear() - (parseInt(formData.age) || 0)}</p>
                                    </div>
                                    <div className="text-center border-x border-white/10">
                                        <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest mb-1">SEX</p>
                                        <p className="text-sm font-bold">{formData.sex === 'Male' ? 'M' : 'F'}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest mb-1">WEIGHT</p>
                                        <p className="text-sm font-bold">{formData.weight || 0}kg</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 shadow-sm">
                                        <Globe size={10} strokeWidth={3} />
                                    </div>
                                    <span className="text-xs font-bold text-blue-100 truncate">{formData.origin || 'Unknown Location'}</span>
                                </div>
                            </div>
                            
                            {/* Decorative Bottom Curve Overlay */}
                            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute -bottom-20 -right-20 w-48 h-48 border border-white/5 rounded-full"></div>
                            </div>
                        </div>
                     </div>

                     <button onClick={handleSubmit} className="mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <CheckCircle size={18} /> Save Changes
                     </button>
                 </div>
             )}
          </div>
       </div>
    </div>
  )
}

export default App;