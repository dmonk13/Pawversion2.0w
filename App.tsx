
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
  FileText
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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
           {toast.type === 'success' ? <CheckCircle size={18} className="text-green-400 dark:text-green-600" /> : <Settings size={18} className="text-orange-400 dark:text-orange-500" />}
           <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 animate-in slide-in-from-top duration-300 flex flex-col">
          <div className="p-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl">
              <Search size={20} className="text-slate-400" />
              <input 
                autoFocus 
                type="text" 
                placeholder="Search pets, vets, or advice..." 
                className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-white font-medium placeholder:text-slate-500"
              />
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="text-orange-500 font-bold px-2">Cancel</button>
          </div>
          <div className="p-6 text-center text-slate-400 text-sm">
             Start typing to search...
          </div>
        </div>
      )}

      {/* Notifications Overlay */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}>
          <div 
            className="absolute top-0 right-0 w-[85%] h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Alerts</h2>
              <button onClick={() => setIsNotificationsOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={20} />
              </button>
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0 transition-colors duration-300 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">P</div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">PawPal</h1>
            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-[0.2em]">Connect</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-500 transition-all active:scale-95"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-500 transition-all active:scale-95 relative"
          >
            <Bell size={18} strokeWidth={2.5} />
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-700 hover:text-orange-500 transition-all active:scale-95 overflow-hidden"
          >
            {userProfile?.name ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-black text-xs">
                    {userProfile.name.charAt(0).toUpperCase()}
                </div>
            ) : (
                <Settings size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 transition-colors duration-300 relative ${isChatActive ? 'overflow-hidden h-full bg-white dark:bg-slate-900' : 'overflow-y-auto pb-24 no-scrollbar bg-slate-50/50 dark:bg-slate-950/50'}`}>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      {/* Hidden when in active chat view for cleaner experience */}
      {!isChatActive && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-4 py-3 pb-safe flex justify-between items-center z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300">
            <NavButton 
              active={activeTab === 'home'} 
              onClick={() => { setActiveTab('home'); setSelectedPetId(null); }} 
              icon={<Layout size={22} />} 
              label="Home" 
            />
            <NavButton 
              active={activeTab === 'pets'} 
              onClick={() => { setActiveTab('pets'); setSelectedPetId(null); }} 
              icon={<Dog size={22} />} 
              label="Family" 
            />
            <div className="relative -top-6">
              <button 
                onClick={() => { setActiveTab('matches'); setSelectedPetId(null); }}
                className={`p-4 rounded-[2rem] shadow-2xl shadow-orange-500/30 transition-all duration-500 ${activeTab === 'matches' ? 'bg-orange-500 rotate-[360deg]' : 'bg-slate-900 dark:bg-slate-800'} text-white group`}
              >
                <MessageCircle size={26} className="group-active:scale-90 transition-transform" />
              </button>
            </div>
            <NavButton 
              active={activeTab === 'health'} 
              onClick={() => { setActiveTab('health'); setSelectedPetId(null); }} 
              icon={<Activity size={22} />} 
              label="Health" 
            />
            <NavButton 
              active={activeTab === 'community'} 
              onClick={() => { setActiveTab('community'); setSelectedPetId(null); }} 
              icon={<Users size={22} />} 
              label="Social" 
            />
          </nav>
      )}

      {/* Global Confirmation Modal - Rendered last to ensure z-index dominance */}
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

// --- Sub Components ---

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
                       <button 
                         onClick={() => setTheme('light')}
                         className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-orange-500 bg-orange-50 dark:bg-slate-700 dark:border-orange-500 text-orange-600 dark:text-orange-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                       >
                          <Sun size={24} />
                          <span className="text-xs font-black uppercase">Light</span>
                       </button>
                       <button 
                         onClick={() => setTheme('dark')}
                         className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-orange-500 bg-slate-800 text-orange-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                       >
                          <Moon size={24} />
                          <span className="text-xs font-black uppercase">Dark</span>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        );
      case 'notifications':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <Header title="Notifications" onBack={() => setView('main')} />
            <div className="space-y-4">
              {['Push Notifications', 'Email Updates', 'Daily Reminders', 'Community Alerts'].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item}</span>
                   <ToggleRight size={28} className="text-orange-500 cursor-pointer" />
                 </div>
              ))}
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <Header title="Privacy & Security" onBack={() => setView('main')} />
            <div className="space-y-4">
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Public Profile</span>
                      <ToggleRight size={28} className="text-orange-500 cursor-pointer" />
                   </div>
                   <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                   <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Share Usage Data</span>
                      <ToggleLeft size={28} className="text-slate-400 cursor-pointer" />
                   </div>
               </div>
               <button className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 text-left text-sm flex justify-between items-center">
                  Change Password
                  <ChevronRight size={16} className="text-slate-400" />
               </button>
            </div>
          </div>
        );
      case 'profile':
          return (
            <div className="animate-in slide-in-from-right duration-300">
              <Header title="My Profile" onBack={() => setView('main')} />
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-3 shadow-lg">{userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                    <button className="text-orange-500 text-xs font-black uppercase tracking-widest flex items-center gap-1 bg-orange-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                      <Camera size={12} /> Change Photo
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                      <input type="text" defaultValue={userName || "Parent User"} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email</label>
                      <input type="email" defaultValue="parent@pawpal.com" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none" />
                    </div>
                </div>
                <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black shadow-lg">Save Changes</button>
              </div>
            </div>
          );
      default:
        return (
          <div className="animate-in slide-in-from-left duration-300 space-y-8">
             {/* Profile Section */}
             <button 
               onClick={() => setView('profile')}
               className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors text-left group"
             >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                   {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-slate-800 dark:text-white">{userName || 'Parent User'}</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{userPlan} Plan</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500" />
             </button>

             {/* Pro Banner */}
             <button 
               onClick={onOpenPro}
               className={`w-full rounded-2xl p-4 text-white shadow-lg text-left relative overflow-hidden group transition-all active:scale-[0.98] ${userPlan === 'Pro' ? 'bg-gradient-to-r from-slate-800 to-slate-900 shadow-slate-900/20' : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/20'}`}
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                <div className="relative z-10 flex items-center justify-between">
                   <div>
                      <div className="flex items-center gap-1.5 mb-1">
                         <Crown size={16} fill="white" />
                         <span className="text-xs font-black uppercase tracking-widest">{userPlan === 'Pro' ? 'Pro Active' : 'PawPal Pro'}</span>
                      </div>
                      <p className="text-sm font-bold opacity-90">{userPlan === 'Pro' ? 'Manage Subscription' : 'Unlock AI Vet & More'}</p>
                   </div>
                   <ChevronRight size={20} className="text-white/80 group-active:translate-x-1 transition-transform" />
                </div>
             </button>

             {/* General Settings */}
             <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">General</h3>
                <SettingsItem icon={<User size={18} />} label="Account Info" onClick={() => setView('profile')} />
                <SettingsItem icon={<Bell size={18} />} label="Notifications" onClick={() => setView('notifications')} />
                <SettingsItem icon={<Lock size={18} />} label="Privacy & Security" onClick={() => setView('privacy')} />
                <SettingsItem icon={<Crown size={18} />} label="Subscription Plan" onClick={onOpenPro} />
                <SettingsItem icon={<Moon size={18} />} label="Appearance" onClick={() => setView('appearance')} />
             </div>

             {/* Support */}
             <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Support</h3>
                <SettingsItem icon={<HelpCircle size={18} />} label="Help Center" onClick={() => {}} />
                <SettingsItem icon={<Shield size={18} />} label="Terms & Policies" onClick={() => {}} />
             </div>

             {/* Actions - Fixed Buttons */}
             <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
                   <LogOut size={18} />
                   <span className="font-bold text-sm">Log Out</span>
                </button>
                <button onClick={onDelete} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500">
                   <Trash2 size={18} />
                   <span className="font-bold text-sm">Delete Account</span>
                </button>
                <button onClick={onPause} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-orange-500">
                   <PauseCircle size={18} />
                   <span className="font-bold text-sm">Pause Account</span>
                </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="absolute top-0 right-0 w-[85%] h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl transition-colors duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Settings</h2>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
           {renderContent()}
        </div>
      </div>
    </div>
  )
}

const SettingsItem = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-orange-200 dark:hover:border-slate-600 transition-all group">
     <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 group-hover:text-orange-500">
        {icon}
        <span className="font-bold text-sm">{label}</span>
     </div>
     <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-orange-300" />
  </button>
);

const AddPetModal = ({ onClose, onSubmit, initialData }: any) => {
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [formData, setFormData] = useState({ 
    name: '', 
    species: 'Dog', 
    breed: '', 
    age: 0, 
    weight: 0,
    origin: '',
    image: '',
    temperament: [] as string[],
    bio: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        species: initialData.species,
        breed: initialData.breed,
        age: initialData.age,
        weight: initialData.weight,
        origin: initialData.origin || '',
        image: initialData.image || '',
        temperament: initialData.temperament || [],
        bio: initialData.bio || ''
      });
    }
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTempImage(reader.result as string);
          setIsCropping(true);
        };
        reader.readAsDataURL(file);
      }
  };
  
  const handleDragStart = (x: number, y: number) => { setIsDragging(true); setDragStart({ x: x - cropOffset.x, y: y - cropOffset.y }); };
  const handleDragMove = (x: number, y: number) => { if(isDragging) setCropOffset({ x: x - dragStart.x, y: y - dragStart.y }); };
  const handleDragEnd = () => setIsDragging(false);
  const handleCropComplete = () => {
      if (!imageRef.current || !tempImage) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 500; 
      const scaleFactor = size / 256; 
      canvas.width = size;
      canvas.height = size;
      if (ctx) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, size, size);
        ctx.translate(size / 2, size / 2);
        ctx.scale(cropZoom, cropZoom);
        ctx.translate(cropOffset.x * scaleFactor, cropOffset.y * scaleFactor);
        const img = imageRef.current;
        const aspect = img.naturalWidth / img.naturalHeight;
        let drawWidth, drawHeight;
        if (aspect > 1) { drawHeight = size; drawWidth = size * aspect; } 
        else { drawWidth = size; drawHeight = size / aspect; }
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        setFormData(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.9) }));
        setIsCropping(false);
        setTempImage(null);
      }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.temperament.includes(tagInput.trim())) {
      setFormData(prev => ({...prev, temperament: [...prev.temperament, tagInput.trim()]}));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
     setFormData(prev => ({...prev, temperament: prev.temperament.filter(t => t !== tagToRemove)}));
  };

  if (isCropping && tempImage) {
      return (
        <div className="fixed inset-0 z-[110] bg-slate-900 flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-full max-w-md p-6 flex flex-col items-center gap-6">
              <h3 className="text-white font-black text-xl tracking-wide">Adjust Photo</h3>
              <div 
                className="w-64 h-64 rounded-full border-4 border-white/20 overflow-hidden relative bg-black shadow-2xl cursor-move touch-none"
                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchEnd={handleDragEnd}
              >
                 <img ref={imageRef} src={tempImage} alt="Crop" draggable={false} className="absolute max-w-none origin-center transition-transform duration-75 ease-out" style={{ top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})` }} />
              </div>
              <div className="flex items-center gap-4 w-full px-8"><ZoomIn size={20} className="text-white/60" /><input type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={(e) => setCropZoom(parseFloat(e.target.value))} className="flex-1 accent-orange-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" /></div>
              <div className="flex gap-4 w-full mt-4">
                 <button onClick={() => { setIsCropping(false); setTempImage(null); }} className="flex-1 py-4 bg-white/10 rounded-2xl text-white font-bold backdrop-blur-md hover:bg-white/20 transition-colors flex items-center justify-center gap-2"><RotateCcw size={18} /> Cancel</button>
                 <button onClick={handleCropComplete} className="flex-1 py-4 bg-orange-500 rounded-2xl text-white font-black hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"><CheckCircle size={18} /> Apply</button>
              </div>
           </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center">
      <div className="w-full sm:w-[90%] sm:max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-0 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden flex flex-col">
         <div className="p-6 pb-0 bg-white dark:bg-slate-900">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black text-slate-800 dark:text-white">{initialData ? 'Edit Profile' : 'New Companion'}</h2>
               <button onClick={onClose} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><X size={20} /></button>
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl relative mb-2">
               <div className={`absolute top-1 bottom-1 w-[48%] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-spring ${activeView === 'preview' ? 'left-[51%]' : 'left-1'}`}></div>
               <button onClick={() => setActiveView('edit')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 text-xs font-black uppercase tracking-widest transition-colors ${activeView === 'edit' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}><Edit3 size={14} /> Details</button>
               <button onClick={() => setActiveView('preview')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 text-xs font-black uppercase tracking-widest transition-colors ${activeView === 'preview' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}><Eye size={14} /> Passport</button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 pt-4">
             {activeView === 'edit' && (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                   <div className="flex justify-center">
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                      <button onClick={() => fileInputRef.current?.click()} className="relative group w-28 h-28 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 gap-2 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-700 transition-all overflow-hidden">
                         {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <><Camera size={24} /><span className="text-[9px] font-black uppercase">Add Photo</span></>}
                      </button>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Name</label>
                         <input type="text" placeholder="e.g. Luna" value={formData.name} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Species</label>
                        <div className="grid grid-cols-4 gap-2">
                           {['Dog', 'Cat', 'Bird', 'Rabbit'].map(s => (
                              <button key={s} onClick={() => setFormData({...formData, species: s as any})} className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.species === s ? 'bg-slate-800 dark:bg-slate-700 border-slate-800 dark:border-slate-700 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                 {s}
                              </button>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Breed</label>
                         <input type="text" placeholder="e.g. Golden Retriever" value={formData.breed} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none" onChange={e => setFormData({...formData, breed: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">About Me</label>
                         <textarea 
                           placeholder="Describe your pet's personality..." 
                           value={formData.bio} 
                           className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none h-32 resize-none" 
                           onChange={e => setFormData({...formData, bio: e.target.value})} 
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Origin</label>
                         <div className="relative">
                            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="e.g. California" value={formData.origin} className="w-full p-4 pl-11 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none" onChange={e => setFormData({...formData, origin: e.target.value})} />
                         </div>
                      </div>
                      
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Temperament & Traits</label>
                         <div className="flex gap-2">
                            <input 
                               type="text" 
                               value={tagInput}
                               onChange={(e) => setTagInput(e.target.value)}
                               onKeyDown={(e) => { if(e.key === 'Enter') addTag(); }}
                               placeholder="e.g. Playful, Kid-friendly"
                               className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20"
                            />
                            <button onClick={addTag} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                               <Plus size={20} />
                            </button>
                         </div>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {formData.temperament.map(tag => (
                               <span key={tag} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                  {tag}
                                  <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                               </span>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Age</label>
                            <input type="number" placeholder="0" value={formData.age || ''} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none" onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Weight</label>
                            <input type="number" placeholder="0.0" value={formData.weight || ''} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500/20 transition-all outline-none" onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
                         </div>
                      </div>
                   </div>
                </div>
             )}
             {activeView === 'preview' && (
                <div className="flex flex-col items-center justify-center py-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="w-full max-w-[320px] bg-[#1e40af] text-white rounded-[1.5rem] overflow-hidden shadow-2xl relative transform transition-transform hover:scale-[1.02] duration-300">
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      <div className="relative z-10 p-6 space-y-6">
                        <div className="flex justify-between items-start">
                           <div><h4 className="text-[10px] font-bold tracking-[0.2em] text-blue-200 uppercase">Official Passport</h4><h2 className="text-2xl font-serif font-bold text-white mt-1 tracking-wide">PAWPAL</h2></div>
                           <div className="bg-white p-2 rounded-xl shadow-lg transform rotate-3">
                             <img 
                               src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({
                                 name: formData.name || 'New Pet',
                                 breed: formData.breed,
                                 species: formData.species
                               }))}`}
                               alt="QR"
                               className="w-10 h-10"
                             />
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="w-24 h-32 bg-slate-200 rounded-xl overflow-hidden border-2 border-blue-300/30 shadow-md shrink-0">
                             {formData.image ? <img src={formData.image} alt="Pet" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Camera size={24} /></div>}
                           </div>
                           <div className="flex flex-col justify-center gap-3">
                              <div><p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Name</p><p className="text-lg font-bold leading-none truncate w-32">{formData.name || 'Unknown'}</p></div>
                              <div><p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-0.5">Breed</p><p className="text-sm font-medium leading-tight truncate w-32">{formData.breed || 'Unknown'}</p></div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
             )}
         </div>

         <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => onSubmit(formData)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-[1.5rem] font-black shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] text-sm">{initialData ? 'Save Changes' : 'Create Profile'}</button>
         </div>
      </div>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 px-3 py-1 transition-all ${active ? 'text-orange-500 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    {icon}
    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

const NotificationItem = ({ icon, title, desc, time }: any) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h4>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{time}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ProPlanModal = ({ onClose, onUpgrade, userPlan }: any) => {
  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
       <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-600 dark:text-white backdrop-blur-md z-10">
             <X size={18} />
          </button>
          
          <div className="h-48 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden flex items-center justify-center text-white">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 rotate-3">
                   <Crown size={32} fill="white" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">PawPal Pro</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Unlock Full Potential</p>
             </div>
          </div>

          <div className="p-8 space-y-6">
             <div className="space-y-4">
                {[
                  'Unlimited AI Vet Consultations',
                  'Advanced Health Analytics', 
                  'Cloud Backup for Pet Documents',
                  'Priority Support'
                ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                         <Check size={10} strokeWidth={4} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feat}</span>
                   </div>
                ))}
             </div>
             
             {userPlan === 'Pro' ? (
                 <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center border border-green-100 dark:border-green-900/30">
                    <p className="text-green-600 dark:text-green-400 font-bold text-sm">You are currently on the Pro Plan.</p>
                 </div>
             ) : (
                 <button 
                   onClick={onUpgrade}
                   className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   <Star size={18} fill="currentColor" className="text-yellow-200" />
                   Upgrade for $9.99/mo
                 </button>
             )}
             <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cancel anytime. Terms apply.</p>
          </div>
       </div>
    </div>
  );
};

export default App;
