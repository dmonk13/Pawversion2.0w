import React, { useState, useMemo, useEffect } from 'react';
import {
  Heart,
  MapPin,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Check,
  Star,
  Bone,
  Sparkles,
  Lock,
  Search,
  Dna,
  ShieldCheck,
  X,
  Activity,
  Filter,
  Stethoscope,
  Info,
  ChevronDown
} from 'lucide-react';
import { DiscoverPet } from '../types';

const DEMO_SAMPLE_DATA: DiscoverPet[] = [
  {
    id: 'd1',
    name: 'Cooper',
    breed: 'Golden Retriever',
    age: '2 yrs',
    energy: 'High',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80',
    bio: 'Super friendly and loves to play fetch till the sun goes down!',
    tags: ['Active', 'Kid-friendly'],
    gender: 'Male',
    status: 'Intact',
    medicalHistory: ['Fully Vaccinated', 'No Allergies']
  },
  {
    id: 'd2',
    name: 'Bella',
    breed: 'French Bulldog',
    age: '1 yr',
    energy: 'Low',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80',
    bio: 'Professional napper looking for a quiet walk in the park.',
    tags: ['Calm', 'City-dweller'],
    gender: 'Female',
    status: 'Neutered',
    medicalHistory: ['Vaccinated', 'Sensitive Stomach']
  },
  {
    id: 'd3',
    name: 'Rocky',
    breed: 'Siberian Husky',
    age: '3 yrs',
    energy: 'High',
    distance: '3.5 km',
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80',
    bio: 'Adventurous spirit. I love hiking and cold weather!',
    tags: ['Athletic', 'Talkative'],
    gender: 'Male',
    status: 'Intact',
    medicalHistory: ['Fully Vaccinated']
  },
  {
    id: 'd4',
    name: 'Mochi',
    breed: 'Corgi',
    age: '4 yrs',
    energy: 'Medium',
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=500&q=80',
    bio: 'I may have short legs, but I have a big heart and lots of speed!',
    tags: ['Playful', 'Smart'],
    gender: 'Female',
    status: 'Intact',
    medicalHistory: ['Vaccinated', 'Hip Dysplasia Monitored']
  },
  {
    id: 'd5',
    name: 'Daisy',
    breed: 'Labradoodle',
    age: '2 yrs',
    energy: 'Medium',
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1591768793355-74d7af236c17?auto=format&fit=crop&w=500&q=80',
    bio: 'Hypoallergenic and highly sociable. Let\'s grab a puppuccino!',
    tags: ['Social', 'Non-shedding'],
    gender: 'Female',
    status: 'Neutered',
    medicalHistory: ['Fully Vaccinated', 'Nut Allergy']
  }
];

interface PetCardProps {
  pet: DiscoverPet;
  mode: 'Play' | 'Mate';
  onProfile: (pet: DiscoverPet) => void;
  onSwipe: (id: string, direction: 'left' | 'right') => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, mode, onProfile, onSwipe }) => {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const handleAction = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    setExitDirection(direction);
    // Delay callback to allow animation to play
    setTimeout(() => {
       onSwipe(pet.id, direction);
    }, 300);
  };

  const themeColor = mode === 'Play' ? 'orange' : 'pink';
  const gradientClass = mode === 'Play' ? 'from-orange-500 to-amber-500' : 'from-pink-500 to-rose-500';
  const shadowClass = mode === 'Play' ? 'shadow-orange-500/30' : 'shadow-pink-500/30';

  // Animation Classes
  let animClass = 'hover:scale-[1.02]';
  if (exitDirection === 'left') animClass = '-translate-x-[120%] rotate-[-15deg] opacity-0';
  if (exitDirection === 'right') animClass = 'translate-x-[120%] rotate-[15deg] opacity-0';

  return (
    <div className={`group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100 transition-all duration-300 ease-out transform ${animClass} flex flex-col h-full`}>
        <div className="relative aspect-[4/5] cursor-pointer flex-1" onClick={() => onProfile(pet)}>
            <img 
                src={pet.image} 
                alt={pet.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            
            {/* Overlay Gradient & Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent flex flex-col justify-end p-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black text-white leading-tight">{pet.name}</h3>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                            {pet.gender === 'Female' ? <Heart size={14} className="text-pink-400" fill="currentColor"/> : <Zap size={14} className="text-blue-400" fill="currentColor"/>}
                            <span className="text-white text-xs font-bold">{pet.age}</span>
                        </div>
                    </div>

                    <p className="text-white/80 font-bold text-sm">{pet.breed}</p>
                    
                    <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                        {pet.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {pet.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                            {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Badges */}
            <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl flex items-center gap-1.5 shadow-sm">
                <MapPin size={12} className={`text-${themeColor}-500`} />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{pet.distance}</span>
            </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 flex items-center gap-3 bg-white border-t border-slate-50 shrink-0">
            <button 
                onClick={(e) => handleAction(e, 'left')}
                className="w-14 h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-90"
                aria-label="Pass"
            >
                <X size={24} strokeWidth={2.5} />
            </button>
            
            <button 
                onClick={(e) => handleAction(e, 'right')}
                className={`flex-1 h-14 rounded-[1.2rem] flex items-center justify-center gap-2 text-white font-black text-sm uppercase tracking-wide shadow-lg transition-all active:scale-95 bg-gradient-to-r ${gradientClass} ${shadowClass}`}
            >
                {mode === 'Play' ? 'Playdate' : 'Connect'} 
                {mode === 'Play' ? <Bone size={18} fill="currentColor" /> : <Heart size={18} fill="currentColor" />}
            </button>
        </div>
    </div>
  );
};

interface SpotlightCardProps {
  pet: DiscoverPet;
  woofsLeft: number;
  onWoof: (id: string, msg: string) => void;
  onProfile: (pet: DiscoverPet) => void;
  mode: 'Play' | 'Mate';
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ pet, woofsLeft, onWoof, onProfile, mode }) => {
  const [message, setMessage] = useState('');
  const [isWoofed, setIsWoofed] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  const matchScore = 90 + (pet.name.length * 2) % 10; 

  const handleWoof = () => {
    if (woofsLeft <= 0 || !message.trim()) return;
    setAnimate(true);
    setIsWoofed(true);
    onWoof(pet.id, message);
  };

  const themeColor = mode === 'Play' ? 'orange' : 'pink';

  return (
    <div className="bg-white rounded-[2.5rem] p-5 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-visible h-full flex flex-col">
      <div className="relative mb-4 cursor-pointer flex-1" onClick={() => onProfile(pet)}>
        <img src={pet.image} alt={pet.name} className="w-full aspect-video object-cover rounded-[2rem]" />
        <div className={`absolute -bottom-3 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-white flex items-center gap-1 shadow-lg`}>
          <Sparkles size={12} className={mode === 'Play' ? "text-yellow-400" : "text-pink-400"} />
          {matchScore}% Match
        </div>
      </div>
      
      <div className="mt-4 px-2 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-2xl font-black text-slate-800">{pet.name}</h3>
          <div className="flex items-center gap-2">
             <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${pet.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
               {pet.gender}
             </span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pet.breed}</span>
          </div>
        </div>
        
        {!isWoofed ? (
          <div className="space-y-3 mt-4">
            <input 
              type="text" 
              placeholder={`Message for ${pet.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-${themeColor}-500/20 transition-all`}
            />
            <button 
              onClick={handleWoof}
              disabled={woofsLeft === 0 || !message.trim()}
              className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                woofsLeft > 0 && message.trim() 
                  ? `bg-gradient-to-r from-${themeColor}-500 to-${mode === 'Play' ? 'pink' : 'purple'}-500 text-white shadow-lg shadow-${themeColor}-500/30` 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {woofsLeft > 0 ? (
                <>Send {mode === 'Play' ? 'Woof' : 'Rose'} {mode === 'Play' ? <Bone size={16} fill="currentColor" /> : <Heart size={16} fill="currentColor" />}</>
              ) : (
                <>Daily Limit Reached <Lock size={14} /></>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 text-green-600 rounded-xl py-4 flex flex-col items-center justify-center mt-4 border border-green-100">
            <Check size={24} className="mb-1" />
            <span className="text-xs font-black uppercase tracking-widest">Request Sent!</span>
          </div>
        )}
      </div>

      {animate && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-float-up">
          <div className="flex flex-col items-center">
             <div className={`w-20 h-20 bg-gradient-to-tr ${mode === 'Play' ? 'from-orange-500 to-pink-500' : 'from-pink-500 to-purple-500'} rounded-full flex items-center justify-center shadow-2xl text-white`}>
                {mode === 'Play' ? <Bone size={40} fill="white" /> : <Heart size={40} fill="white" />}
             </div>
             <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${mode === 'Play' ? 'from-orange-500 to-pink-600' : 'from-pink-500 to-purple-600'} mt-2 drop-shadow-sm italic`}>
               {mode === 'Play' ? 'WOOF!' : 'ADORE!'}
             </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface CommunityProps {
  onMatch?: (pet: DiscoverPet) => void;
  userType?: 'demo' | 'user';
}

const Community: React.FC<CommunityProps> = ({ onMatch, userType = 'user' }) => {
  const [mode, setMode] = useState<'Play' | 'Mate'>('Play');
  const [activeView, setActiveView] = useState<'Discover' | 'Spotlight'>('Discover');
  const [filter, setFilter] = useState('All');
  const [woofsLeft, setWoofsLeft] = useState(2);
  const [selectedProfile, setSelectedProfile] = useState<DiscoverPet | null>(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
     ageMax: 20,
     breed: 'All',
     medical: 'All'
  });

  // Database state
  const [communityPets, setCommunityPets] = useState<DiscoverPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);

  // Fetch community pets from database
  useEffect(() => {
    fetchCommunityPets();
    getUserLocation();
  }, [mode]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default');
          setUserLocation(null);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchCommunityPets = async () => {
    setIsLoading(true);
    try {
      // Use demo data for demo accounts
      if (userType === 'demo') {
        // Filter demo data based on mode
        let filteredDemoData = DEMO_SAMPLE_DATA;
        if (mode === 'Mate') {
          filteredDemoData = DEMO_SAMPLE_DATA.filter(p => p.status === 'Intact');
        }
        setCommunityPets(filteredDemoData);
        setIsLoading(false);
        return;
      }

      // Fetch from database for regular users
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not found');
        setCommunityPets([]);
        setIsLoading(false);
        return;
      }

      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      };

      // Build query based on mode
      let query = `${supabaseUrl}/rest/v1/community_pets?select=*`;

      if (mode === 'Play') {
        query += '&available_for_play=eq.true';
      } else {
        query += '&available_for_mating=eq.true&status=eq.Intact';
      }

      const response = await fetch(query, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch community pets');
      }

      const data = await response.json();

      // Transform database records to DiscoverPet format
      const transformedPets: DiscoverPet[] = data.map((pet: any) => {
        let distance = 'Unknown';
        if (userLocation && pet.latitude && pet.longitude) {
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lon,
            parseFloat(pet.latitude),
            parseFloat(pet.longitude)
          );
          distance = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
        }

        return {
          id: pet.id,
          name: pet.name,
          breed: pet.breed,
          age: `${pet.age} yr${pet.age !== 1 ? 's' : ''}`,
          energy: pet.energy_level,
          distance,
          image: pet.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80',
          bio: pet.bio || `Meet ${pet.name}, a friendly ${pet.breed}!`,
          tags: pet.tags || [],
          gender: pet.gender,
          status: pet.status,
          medicalHistory: pet.medical_history || []
        };
      });

      setCommunityPets(transformedPets);
    } catch (error) {
      console.error('Error fetching community pets:', error);
      setCommunityPets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const FILTERS = useMemo(() => {
    return mode === 'Play' 
      ? ['All', 'Low Energy', 'High Energy'] 
      : ['All', 'Intact', 'Pedigree'];
  }, [mode]);

  const availableBreeds = useMemo(() => {
      const breeds = new Set(communityPets.map(p => p.breed));
      return ['All', ...Array.from(breeds)];
  }, [communityPets]);

  const medicalOptions = ['All', 'Fully Vaccinated', 'No Allergies', 'Specific Conditions'];

  const filteredPets = useMemo(() => {
    return communityPets.filter(pet => {
      if (swipedIds.has(pet.id)) return false;
      if (mode === 'Mate' && pet.status === 'Neutered') return false;
      if (filter !== 'All') {
          if (mode === 'Play') {
             if (filter === 'Low Energy' && pet.energy !== 'Low') return false;
             if (filter === 'High Energy' && pet.energy !== 'High') return false;
          }
          if (mode === 'Mate') {
             if (filter === 'Intact' && pet.status !== 'Intact') return false;
          }
      }
      const petAgeNum = parseInt(pet.age);
      if (petAgeNum > advancedFilters.ageMax) return false;

      if (advancedFilters.breed !== 'All' && !pet.breed.includes(advancedFilters.breed)) return false;

      if (advancedFilters.medical !== 'All') {
          if (advancedFilters.medical === 'Fully Vaccinated') {
              if (!pet.medicalHistory.some(h => h.includes('Vaccinated'))) return false;
          } else if (advancedFilters.medical === 'No Allergies') {
              const hasAllergy = pet.medicalHistory.some(h => h.includes('Allergy') && !h.includes('No Allergies'));
              if (hasAllergy) return false;
          } else if (advancedFilters.medical === 'Specific Conditions') {
              const conditions = pet.medicalHistory.filter(h => !h.includes('Vaccinated') && !h.includes('No Allergies'));
              if (conditions.length === 0) return false;
          }
      }

      return true;
    });
  }, [filter, mode, advancedFilters, swipedIds, communityPets]);

  const spotlightPets = useMemo(() => {
     if (mode === 'Mate') {
        return communityPets.filter(p => p.status === 'Intact' && p.gender === 'Female').slice(0, 3);
     }
     return communityPets.slice(0, 3);
  }, [mode, communityPets]);

  const handlePetAction = (id: string, direction: 'left' | 'right') => {
    const pet = communityPets.find(p => p.id === id);
    if (direction === 'right') {
        if (woofsLeft > 0) setWoofsLeft(prev => prev - 1);
        // Simulate Match
        if (pet && onMatch) {
            onMatch(pet);
        }
    }
    setSwipedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
    });
  };

  const handleProfileAction = (direction: 'left' | 'right') => {
    if (direction === 'right') {
        if (woofsLeft <= 0) return;
        // Require message for profile actions if right swipe
        if (!profileMessage.trim()) return; 
    }
    setExitDirection(direction);
    setTimeout(() => {
        if (selectedProfile) {
            handlePetAction(selectedProfile.id, direction);
        }
        setSelectedProfile(null);
        setProfileMessage(''); // Clear message
        setExitDirection(null);
    }, 300); 
  };

  const themeColor = mode === 'Play' ? 'orange' : 'pink';

  return (
    <div className="flex flex-col min-h-full bg-slate-50 animate-in fade-in duration-700">
      <style>{`
        @keyframes floatUp {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -250%) scale(1); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 1.2s ease-out forwards;
        }
      `}</style>

      {/* Mode Switcher Header */}
      <div className="bg-white p-6 pb-0 space-y-6 shrink-0 rounded-b-[2.5rem] shadow-sm sticky top-0 z-30">
        
        {/* Mode Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-2xl relative">
           <div className={`absolute top-1 bottom-1 w-[48%] bg-white rounded-xl shadow-sm transition-all duration-300 ease-spring ${mode === 'Mate' ? 'left-[51%]' : 'left-1'}`}></div>
           <button 
             onClick={() => { setMode('Play'); setFilter('All'); }}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 text-xs font-black uppercase tracking-widest transition-colors ${mode === 'Play' ? 'text-orange-500' : 'text-slate-400'}`}
           >
             <Bone size={16} fill={mode === 'Play' ? "currentColor" : "none"} />
             Playdates
           </button>
           <button 
             onClick={() => { setMode('Mate'); setFilter('All'); }}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 text-xs font-black uppercase tracking-widest transition-colors ${mode === 'Mate' ? 'text-pink-500' : 'text-slate-400'}`}
           >
             <Heart size={16} fill={mode === 'Mate' ? "currentColor" : "none"} />
             Mating
           </button>
        </div>

        {/* Sub-Header: Title & View Switch */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {activeView === 'Discover' ? (mode === 'Play' ? 'Find Friends' : 'Find Partners') : 'Curated Picks'}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              {activeView === 'Discover' ? (mode === 'Play' ? 'Nearby pets to play' : 'Compatible breeding matches') : 'Selected for you'}
            </p>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={() => setActiveView('Discover')}
               className={`text-sm font-bold transition-colors ${activeView === 'Discover' ? `text-${themeColor}-500` : 'text-slate-300'}`}
             >
               Discover
             </button>
             <button 
               onClick={() => setActiveView('Spotlight')}
               className={`text-sm font-bold transition-colors ${activeView === 'Spotlight' ? `text-${themeColor}-500` : 'text-slate-300'}`}
             >
               Spotlight
             </button>
          </div>
        </div>

        {/* Filters (Only visible in Discover) */}
        {activeView === 'Discover' && (
           <div className="pb-4 overflow-x-auto no-scrollbar flex items-center gap-2">
             <button 
               onClick={() => setIsFilterModalOpen(true)}
               className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-95 transition-transform"
             >
               <SlidersHorizontal size={16} />
             </button>
             <div className="w-px h-6 bg-slate-200 mx-1"></div>
             {FILTERS.map(f => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wide border transition-all ${
                     filter === f 
                       ? `bg-${themeColor}-500 border-${themeColor}-500 text-white shadow-lg shadow-${themeColor}-500/20` 
                       : 'bg-white border-slate-100 text-slate-500'
                   }`}
                 >
                   {f}
                 </button>
               ))}
           </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-slate-400 text-sm mt-4 font-bold">Finding nearby pets...</p>
          </div>
        ) : activeView === 'Discover' ? (
          filteredPets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                mode={mode}
                onProfile={setSelectedProfile}
                onSwipe={handlePetAction}
              />
            ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className={`w-20 h-20 bg-${themeColor}-50 rounded-full flex items-center justify-center mb-4`}>
                 <Search size={32} className={`text-${themeColor}-200`} />
              </div>
              <h3 className="text-xl font-black text-slate-800">
                {communityPets.length === 0 ? 'No Pets Nearby' : 'No Matches Found'}
              </h3>
              <p className="text-slate-400 text-xs mt-2 max-w-[260px]">
                {communityPets.length === 0
                  ? `There are no pets in your area yet. Be the first to add your pet to the community!`
                  : `Try adjusting your filters to find more ${mode === 'Play' ? 'pals' : 'partners'}.`
                }
              </p>
              {communityPets.length > 0 && (
                <button
                  onClick={() => { setFilter('All'); setSwipedIds(new Set()); setAdvancedFilters({ageMax: 20, breed: 'All', medical: 'All'}); }}
                  className={`mt-6 px-8 py-3 bg-${themeColor}-500 text-white rounded-2xl font-black shadow-lg shadow-${themeColor}-500/20`}
                >
                  Reset
                </button>
              )}
            </div>
          )
        ) : (
          /* Spotlight View */
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
             {spotlightPets.length > 0 ? (
               <>
                 {/* Daily Limit Banner */}
                 <div className={`bg-gradient-to-r from-${themeColor}-50 to-slate-50 rounded-2xl p-5 flex justify-between items-center border border-${themeColor}-100`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-${themeColor}-500 shadow-sm`}>
                        {mode === 'Play' ? <Bone size={24} fill="currentColor" /> : <Heart size={24} fill="currentColor" />}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase text-${themeColor}-400 tracking-widest`}>Daily Interactions</p>
                        <p className="text-slate-800 font-bold text-sm">{woofsLeft} {mode === 'Play' ? 'Woofs' : 'Roses'} Left</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                       <p className={`text-[10px] font-black uppercase text-${themeColor}-400 tracking-widest`}>Resets In</p>
                       <p className="text-slate-800 font-bold text-sm">12h 30m</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spotlightPets.map((pet) => (
                    <SpotlightCard
                        key={pet.id}
                        pet={pet}
                        woofsLeft={woofsLeft}
                        onWoof={(id, msg) => handlePetAction(id, 'right')}
                        onProfile={setSelectedProfile}
                        mode={mode}
                    />
                    ))}
                 </div>

                 <div className="text-center py-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">You're all caught up!</p>
                    <p className="text-slate-300 text-[10px] mt-2">Check back tomorrow for new {mode === 'Play' ? 'friends' : 'matches'}.</p>
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                 <div className={`w-20 h-20 bg-${themeColor}-50 rounded-full flex items-center justify-center mb-4`}>
                    <Sparkles size={32} className={`text-${themeColor}-200`} />
                 </div>
                 <h3 className="text-xl font-black text-slate-800">No Spotlight Pets</h3>
                 <p className="text-slate-400 text-xs mt-2 max-w-[260px]">
                   There are no curated picks available yet. Check the Discover tab to see all nearby pets!
                 </p>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full sm:w-[90%] sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">Advanced Filters</h3>
                <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
             </div>
             
             <div className="space-y-6">
                {/* Age Filter */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Age</label>
                     <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">{advancedFilters.ageMax} yrs</span>
                   </div>
                   <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={advancedFilters.ageMax} 
                    onChange={(e) => setAdvancedFilters({...advancedFilters, ageMax: parseInt(e.target.value)})}
                    className="w-full accent-orange-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase">
                      <span>1 yr</span>
                      <span>20 yrs</span>
                   </div>
                </div>

                {/* Breed Filter Dropdown */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Breed</label>
                   <div className="relative">
                      <select 
                        value={advancedFilters.breed}
                        onChange={(e) => setAdvancedFilters({...advancedFilters, breed: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-10 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                      >
                        {availableBreeds.map(breed => (
                           <option key={breed} value={breed}>{breed}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>

                {/* Medical Condition Filter Dropdown */}
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Status</label>
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">
                         <Stethoscope size={18} />
                      </div>
                      <select 
                        value={advancedFilters.medical}
                        onChange={(e) => setAdvancedFilters({...advancedFilters, medical: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-11 pr-10 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                      >
                        {medicalOptions.map(option => (
                           <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>
                
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-[0.98] transition-all"
                >
                  Apply Filters
                </button>
             </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {selectedProfile && (
        <div className={`fixed inset-0 z-[60] bg-white overflow-y-auto duration-300 ease-in-out ${exitDirection === 'left' ? '-translate-x-full opacity-0' : exitDirection === 'right' ? 'translate-x-full opacity-0' : 'animate-in slide-in-from-right'}`}>
           <div className="relative h-[40vh] sm:h-[45vh]">
              <img src={selectedProfile.image} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 z-20"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              
              <div className="absolute bottom-0 left-0 p-6 w-full">
                 <div className="flex justify-between items-end mb-2">
                    <h2 className="text-3xl sm:text-4xl font-black text-white">{selectedProfile.name}</h2>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                       <Activity size={16} className="text-green-400" />
                       <span className="text-white font-bold text-xs sm:text-sm">{selectedProfile.energy} Energy</span>
                    </div>
                 </div>
                 <p className="text-white/80 font-bold text-lg">{selectedProfile.breed} • {selectedProfile.age}</p>
              </div>
           </div>

           <div className="p-6 sm:p-8 -mt-6 bg-white rounded-t-[2.5rem] relative z-10 space-y-6 sm:space-y-8 min-h-[60vh] pb-48">
              <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
                 <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px] flex-shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</p>
                    <p className="text-lg font-black text-slate-800 flex items-center gap-1"><MapPin size={14} className="text-orange-500" /> {selectedProfile.distance}</p>
                 </div>
                 <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px] flex-shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                    <p className="text-lg font-black text-slate-800">{selectedProfile.gender}</p>
                 </div>
                 <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px] flex-shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="text-lg font-black text-slate-800">{selectedProfile.status}</p>
                 </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-lg font-black text-slate-800">About {selectedProfile.name}</h3>
                 <p className="text-slate-500 leading-relaxed font-medium text-sm sm:text-base">{selectedProfile.bio}</p>
                 <div className="flex flex-wrap gap-2">
                    {selectedProfile.tags.map(t => (
                       <span key={t} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wide">#{t}</span>
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-green-500" /> Medical History
                 </h3>
                 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                    {selectedProfile.medicalHistory.map((med, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                             <Check size={12} className="text-green-600" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{med}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="fixed bottom-0 left-0 w-full p-4 sm:p-6 bg-white border-t border-slate-100 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
              {/* Message Input */}
              <div className="mb-4">
                  <input 
                      type="text" 
                      value={profileMessage}
                      onChange={(e) => setProfileMessage(e.target.value)}
                      placeholder={`Message for ${selectedProfile.name}...`}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400 text-slate-800"
                  />
              </div>

              {/* Buttons Row */}
              <div className="flex gap-3">
                  <button 
                      onClick={() => handleProfileAction('left')}
                      className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-400 hover:bg-slate-50 transition-colors active:scale-95 text-xs uppercase tracking-widest"
                  >
                      Pass
                  </button>
                  <button 
                      onClick={() => handleProfileAction('right')}
                      disabled={woofsLeft <= 0 || !profileMessage.trim()}
                      className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-xl shadow-${themeColor}-500/30 bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-600 flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs uppercase tracking-widest ${(!profileMessage.trim() || woofsLeft <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                      {woofsLeft > 0 ? (
                          <>Send {mode === 'Play' ? 'Woof' : 'Rose'} {mode === 'Play' ? <Bone size={18} fill="currentColor"/> : <Heart size={18} fill="currentColor"/>}</>
                      ) : (
                          <>Limit Reached <Lock size={14} /></>
                      )}
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Community;