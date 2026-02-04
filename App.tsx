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
  Menu
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
  const [userProfile, setUserProfile] = useState<{name: string, type: 'demo' | 'user'} | null>(null);

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
         image: '', // Will use Icon in component
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
  }, [pets, logs, tasks, isAuthenticated, userProfile]);

  const showNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (type: 'demo' | 'user', username: string = 'User') => {
    const prefix = type === 'demo' ? 'demo_' : 'user_';
    
    // Attempt to load from storage
    const savedPets = localStorage.getItem(`${prefix}pets`);
    const savedLogs = localStorage.getItem(`${prefix}logs`);
    const savedTasks = localStorage.getItem(`${prefix}tasks`);

    if (type === 'demo') {
      // For demo, prefer saved data to persist changes, otherwise fall back to initial
      setPets(savedPets ? JSON.parse(savedPets) : INITIAL_PETS);
      setLogs(savedLogs ? JSON.parse(savedLogs) : INITIAL_LOGS);
      setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_TASKS);
      setUserPlan('Pro');
      setUserProfile({ name: 'Demo User', type: 'demo' });
    } else {
      // For user, prefer saved data, otherwise empty
      setPets(savedPets ? JSON.parse(savedPets) : []);
      setLogs(savedLogs ? JSON.parse(savedLogs) : []);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      setUserPlan('Free');
      setUserProfile({ name: username, type: 'user' });
    }
    
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  // --- Action Handlers ---
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
    if (userProfile) {
        const prefix = userProfile.type === 'demo' ? 'demo_' : 'user_';
        localStorage.removeItem(`${prefix}pets`);
        localStorage.removeItem(`${prefix}logs`);
        localStorage.removeItem(`${prefix}tasks`);
    }
    setIsAuthenticated(false);
    alert("Account and local data permanently deleted."); 
  };

  const executePause = () => {
    setIsSettingsOpen(false);
    setActionModal(null);
    showNotification("Account paused. Data is safe.", "info");
  };

  const handleSavePet = (petData: any) => {
    if (editingPet) {
      setPets(pets.map(p => p.id === editingPet.id ? { ...editingPet, ...petData } : p));
      setEditingPet(null);
      showNotification("Pet profile updated!");
    } else {
      const newPet: Pet = {
        ...petData,
        id: Math.random().toString(36).substr(2, 9),
        image: petData.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        lastFed: new Date().toISOString()
      };
      setPets([...pets, newPet]);
      showNotification(`Welcome to the family, ${newPet.name}!`);
    }
    setIsAddPetOpen(false);
    setActiveTab('pets');
  };

  const removePet = (id: string) => {
    setPets(pets.filter(p => p.id !== id));
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
    
    // Avoid duplicates
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

  // Determine if we are in an active chat session to adjust layout
  const isChatActive = activeTab === 'matches' && activeMatchId !== undefined;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-slate-950 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[160] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
           {toast.type === 'success' ? <CheckCircle size={18} className="text-green-400 dark:text-green-600" /> : <Settings size={18} className="text-orange-400 dark:text-orange-500" />}
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
              {userProfile?.name ? (
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0">
                      {userProfile.name.charAt(0).toUpperCase()}
                  </div>
              ) : (
                  <Settings size={20} />
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
            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-all"><Search size={18} /></button>
            <button onClick={() => setIsNotificationsOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-all">
                {userProfile?.name ? <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-xs">{userProfile.name.charAt(0).toUpperCase()}</div> : <Settings size={18} />}
            </button>
          </div>
        </header>

        {/* Desktop Top Bar (Search & Notifs) */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-30 shrink-0">
           <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tight">{activeTab === 'home' ? 'Dashboard' : activeTab.replace(/([A-Z])/g, ' $1').trim()}</h2>
           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-orange-500 transition-colors" />
                 <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 outline-none w-64 transition-all" />
              </div>
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

      {/* Overlays (Adjusted for Desktop) */}
      
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
                userPlan={userPlan}
                userName={userProfile?.name}
                theme={theme}
                setTheme={setTheme}
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

// --- Helper Components ---

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
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
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

const SettingsSidebar = ({ onClose, onLogout, onDelete, onPause, onOpenPro, userPlan, userName, theme, setTheme }: any) => {
  const [view, setView] = useState<'main' | 'profile' | 'notifications' | 'privacy' | 'appearance' | 'help' | 'terms'>('main');

  const Header = ({ title, onBack }: any) => (
    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 py-2 border-b border-slate-50 dark:border-slate-800">
      <button onClick={onBack} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <h2 className="text-lg font-black text-slate-800 dark:text-white">{title}</h2>
    </div>
  );

  const renderContent = () => {
    switch(view) {
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
      case 'notifications': return ( <div className="animate-in slide-in-from-right duration-300"><Header title="Notifications" onBack={() => setView('main')} /><div className="space-y-4">{['Push Notifications', 'Email Updates', 'Daily Reminders', 'Community Alerts'].map((item, i) => (<div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"><span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item}</span><ToggleRight size={28} className="text-orange-500 cursor-pointer" /></div>))}</div></div> );
      case 'privacy': return ( <div className="animate-in slide-in-from-right duration-300"><Header title="Privacy & Security" onBack={() => setView('main')} /><div className="space-y-4"><div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4"><div className="flex items-center justify-between"><span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Public Profile</span><ToggleRight size={28} className="text-orange-500 cursor-pointer" /></div><div className="h-px bg-slate-200 dark:bg-slate-700"></div><div className="flex items-center justify-between"><span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Share Usage Data</span><ToggleLeft size={28} className="text-slate-400 cursor-pointer" /></div></div><button className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 text-left text-sm flex justify-between items-center">Change Password<ChevronRight size={16} className="text-slate-400" /></button></div></div> );
      case 'profile': return ( <div className="animate-in slide-in-from-right duration-300"><Header title="My Profile" onBack={() => setView('main')} /><div className="space-y-6"><div className="flex flex-col items-center justify-center mb-6"><div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-black mb-3">{userName?.charAt(0)}</div><h3 className="text-xl font-black text-slate-800 dark:text-white">{userName}</h3><p className="text-slate-400 text-sm font-medium">{userPlan} Member</p></div><div className="space-y-3"><div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"><label className="text-[10px] uppercase font-black text-slate-400">Email</label><p className="text-slate-800 dark:text-slate-200 font-bold">user@pawpal.com</p></div></div></div></div> );
      case 'help': return ( <div className="animate-in slide-in-from-right duration-300"><Header title="Help & Support" onBack={() => setView('main')} /><div className="space-y-4"><div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center"><HelpCircle size={40} className="mx-auto text-orange-500 mb-4" /><h3 className="font-black text-slate-800 dark:text-white">Need assistance?</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">Our team is available 24/7 to help you.</p><button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold">Contact Support</button></div></div></div> );
      default: return (
        <div className="space-y-2 animate-in slide-in-from-left duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Settings</h2>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><X size={20}/></button>
          </div>
          
          {userPlan === 'Free' && (
             <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white mb-6 relative overflow-hidden group cursor-pointer" onClick={onOpenPro}>
                <div className="relative z-10 flex items-center justify-between">
                   <div>
                      <h3 className="font-black text-lg flex items-center gap-1"><Crown size={18} fill="currentColor" /> Upgrade to Pro</h3>
                      <p className="text-xs font-medium text-white/90">Unlock advanced AI & analytics</p>
                   </div>
                   <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><ChevronRight size={18}/></div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-white/20 transition-all"></div>
             </div>
          )}

          <div className="space-y-2">
            {[
              { id: 'profile', icon: <User size={18} />, label: 'Profile' },
              { id: 'appearance', icon: <Sun size={18} />, label: 'Appearance' },
              { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
              { id: 'privacy', icon: <Lock size={18} />, label: 'Privacy & Security' },
              { id: 'help', icon: <HelpCircle size={18} />, label: 'Help & Support' },
            ].map(item => (
              <button key={item.id} onClick={() => setView(item.id as any)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-orange-500 transition-colors shadow-sm">{item.icon}</div>
                 <span className="font-bold text-slate-700 dark:text-slate-200 flex-1 text-left text-sm">{item.label}</span>
                 <ChevronRight size={16} className="text-slate-300" />
              </button>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
             <button onClick={onPause} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-orange-500 text-sm font-bold transition-colors">
                <PauseCircle size={18} /> Pause Account
             </button>
             <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-orange-500 text-sm font-bold transition-colors">
                <LogOut size={18} /> Log Out
             </button>
             <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:text-red-600 text-sm font-bold transition-colors">
                <Trash2 size={18} /> Delete Account
             </button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="h-full bg-white dark:bg-slate-900 flex flex-col p-6 overflow-y-auto">{renderContent()}</div>
  );
};

// Simple Modal Components for Add Pet & Pro Plan
const AddPetModal = ({ onClose, onSubmit, initialData }: any) => {
  const [formData, setFormData] = useState(initialData || { name: '', species: 'Dog', breed: '', age: '', weight: '', gender: 'Male' });
  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 sm:p-0">
       <div className="w-full sm:w-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white">{initialData ? 'Edit Pet' : 'Add New Pet'}</h2>
             <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"><X size={24} /></button>
          </div>
          <div className="space-y-4">
             <div><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Pet Name" /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Species</label><select value={formData.species} onChange={e => setFormData({...formData, species: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none"><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></div>
                <div><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Breed</label><input type="text" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none" placeholder="Breed" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Age (yrs)</label><input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none" placeholder="0" /></div>
                <div><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Weight (kg)</label><input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-slate-900 dark:text-white outline-none" placeholder="0" /></div>
             </div>
             <button onClick={() => onSubmit(formData)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-lg mt-4">Save Profile</button>
          </div>
       </div>
    </div>
  )
}

const ProPlanModal = ({ onClose, onUpgrade, userPlan }: any) => {
  if (userPlan === 'Pro') return null;
  return (
     <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 text-center relative">
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 dark:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/20"><X size={20} /></button>
           <div className="h-40 bg-gradient-to-br from-orange-400 to-pink-500 relative flex items-center justify-center">
              <Crown size={64} className="text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-black/10"></div>
           </div>
           <div className="p-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Upgrade to Pro</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Unlock unlimited AI advice, health analytics, and cloud backup.</p>
              <div className="space-y-3 mb-8 text-left">
                 {['Unlimited Dr. Paw Chat', 'Advanced Health Trends', 'Multi-Pet Support (Unlimited)', 'Priority Support'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                       <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={12} strokeWidth={3} /></div> {feat}
                    </div>
                 ))}
              </div>
              <button onClick={onUpgrade} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-transform">Get Pro - $4.99/mo</button>
           </div>
        </div>
     </div>
  )
}

export default App;