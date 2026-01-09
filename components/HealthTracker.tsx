import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Pet, HealthLog } from '../types';
import { 
  FileText, 
  PlusCircle, 
  Thermometer, 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  Stethoscope, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Star, 
  X, 
  Activity, 
  Syringe, 
  Pill, 
  History, 
  Plus, 
  Upload, 
  File, 
  Zap, 
  Info, 
  Phone, 
  SlidersHorizontal, 
  Check,
  ArrowRight,
  Shield,
  ExternalLink
} from 'lucide-react';

interface Props {
  pets: Pet[];
  logs: HealthLog[];
  onAddLog: (log: HealthLog) => void;
}

interface VetInfo {
  name: string;
  address?: string;
  distance?: string;
  rating?: number;
  specialty?: string;
  uri: string;
  phone?: string;
  isOpen?: boolean;
}

// Mock Data for Fallback
const MOCK_VETS: Record<string, VetInfo[]> = {
  'General': [
    { name: "City Paws Clinic", address: "123 Main St", distance: "0.8 mi", rating: 4.8, specialty: "General", uri: "#", phone: "555-0123", isOpen: true },
    { name: "Downtown Vet Hospital", address: "456 Oak Ave", distance: "1.2 mi", rating: 4.6, specialty: "General", uri: "#", phone: "555-0124", isOpen: true },
    { name: "Pet First Care", address: "789 Pine Ln", distance: "2.5 mi", rating: 4.5, specialty: "General", uri: "#", phone: "555-0125", isOpen: false },
  ],
  'Emergency': [
    { name: "24/7 Animal ER", address: "101 Emergency Dr", distance: "3.0 mi", rating: 4.9, specialty: "Emergency", uri: "#", phone: "555-9111", isOpen: true },
    { name: "Urgent Pet Care", address: "55 Rescue Blvd", distance: "5.2 mi", rating: 4.7, specialty: "Emergency", uri: "#", phone: "555-9999", isOpen: true },
  ],
  'Dental': [
    { name: "Happy Teeth Veterinary", address: "202 Smile Rd", distance: "5.0 mi", rating: 4.7, specialty: "Dental", uri: "#", phone: "555-3333", isOpen: true },
  ],
  'Surgeon': [
    { name: "Advanced Pet Surgery", address: "500 Surgical Way", distance: "4.2 mi", rating: 4.9, specialty: "Surgeon", uri: "#", phone: "555-5000", isOpen: true },
  ],
  'Dermatology': [
    { name: "Skin & Coat Clinic", address: "300 Derma Dr", distance: "3.5 mi", rating: 4.6, specialty: "Dermatology", uri: "#", phone: "555-3000", isOpen: true },
  ]
};

const HealthTracker: React.FC<Props> = ({ pets, logs, onAddLog }) => {
  const [view, setView] = useState<'tracker' | 'vets' | 'history'>('tracker');
  const [activeSpecialty, setActiveSpecialty] = useState('General');
  
  // Vet Search State
  const [vetList, setVetList] = useState<VetInfo[]>([]);
  const [vetCache, setVetCache] = useState<Record<string, VetInfo[]>>({});
  const [isLoadingVets, setIsLoadingVets] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'distance' | 'rating'>('distance');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const listRef = useRef<HTMLDivElement>(null);

  // Modals & Selection
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [isAddTempOpen, setIsAddTempOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);
  const [showVaxDetails, setShowVaxDetails] = useState(false);

  useEffect(() => {
    locateUser();
  }, []);

  // Calculate Average Temp from Logs
  const avgTemp = useMemo(() => {
    const tempLogs = logs.filter(l => l.type === 'Temperature' && l.value);
    if (tempLogs.length === 0) return 'N/A';
    
    // Simple average logic
    const sum = tempLogs.reduce((acc, curr) => acc + parseFloat(curr.value || '0'), 0);
    return (sum / tempLogs.length).toFixed(1);
  }, [logs]);

  // Calculate Vaccine Status dynamically
  const vaxData = useMemo(() => {
    if (pets.length === 0) return { status: '0/0', details: [] };

    const CORE_VACCINES: Record<string, string[]> = {
        'Dog': ['Rabies', 'DHPP', 'Bordetella', 'Leptospirosis'],
        'Cat': ['Rabies', 'FVRCP', 'FeLV'],
        'Rabbit': ['Myxomatosis', 'RHD'],
        'Bird': ['Polyomavirus'],
        'Other': ['Rabies']
    };

    let totalNeeded = 0;
    let satisfied = 0;
    const details: {petName: string, vaccine: string, completed: boolean}[] = [];
    
    pets.forEach(pet => {
        const species = pet.species || 'Other';
        const cores = CORE_VACCINES[species] || CORE_VACCINES['Other'];
        
        cores.forEach(vName => {
            totalNeeded++;
            const hasLog = logs.some(l => 
                l.petId === pet.id && 
                l.type === 'Vaccination' && 
                (l.description.includes(vName) || (l.value && l.value.includes(vName)))
            );
            if (hasLog) satisfied++;
            details.push({
                petName: pet.name,
                vaccine: vName,
                completed: hasLog
            });
        });
    });
    
    return {
        status: `${satisfied}/${totalNeeded}`,
        details
    };
  }, [pets, logs]);

  const locateUser = () => {
    setIsLocating(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          // Don't show an error here, just stop loading state. We will rely on mocks if location fails.
          setIsLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
    }
  };

  const fetchVets = async (specialty: string, forceRefresh = false) => {
    // FIX: If we are currently finding the location, WAIT. Do not fall back to mocks yet.
    if (!location && isLocating) return;

    setActiveSpecialty(specialty);

    // Use Cache if available and not forced
    if (!forceRefresh && vetCache[specialty] && vetCache[specialty].length > 0) {
        setVetList(vetCache[specialty]);
        setCurrentPage(1);
        return;
    }
    
    setIsLoadingVets(true);
    if (forceRefresh) setVetList([]); // Only clear if forcing refresh, otherwise keep showing old/empty
    setLocationError(null);

    try {
      // Safe check for API Key
      const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;
      
      // Fallback: Use mock data ONLY if API key is missing OR (Location is missing AND we are done locating)
      if (!apiKey || (!location && !isLocating)) {
          console.warn("API Key or Location missing. Using mock data.");
          // Simulate network delay for realism
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const mocks = MOCK_VETS[specialty] || MOCK_VETS['General'];
          setVetList(mocks);
          setVetCache(prev => ({ ...prev, [specialty]: mocks }));
          setIsLoadingVets(false);
          return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Request 10 results instead of 5
      const prompt = `List 10 ${specialty === 'General' ? 'veterinary clinics' : specialty + ' veterinarians'} near the user.
      JSON Schema: [{ "name": "string", "address": "string", "distance": "string", "rating": number, "phone": "string", "isOpen": boolean }]`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: { retrievalConfig: { latLng: { latitude: location!.lat, longitude: location!.lng } } }
        }
      });
      
      let parsedVets: VetInfo[] = [];
      try {
        const rawText = response.text || '';
        const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        if (jsonText.startsWith('[') || jsonText.startsWith('{')) {
             parsedVets = JSON.parse(jsonText);
        }
      } catch (jsonError) {
         // Fallback usually handled by grounding chunks below, but good to catch
      }

      // Grounding fallback is critical for Google Maps tool
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      if (parsedVets.length === 0 && chunks.length > 0) {
          parsedVets = chunks.map((c: any) => {
            const src = c.maps || c.web;
            if (!src) return null;
            return {
                name: src.title,
                uri: src.googleMapsUri || src.uri,
                specialty: specialty,
                address: 'View in maps for details',
                distance: 'Nearby',
                rating: 4.5,
                isOpen: true
            };
        }).filter((v: any) => v && v.name && v.uri);
      }
      
      if (parsedVets.length === 0 && chunks.length === 0) {
          throw new Error("No results found nearby.");
      }

      // Use the global Map constructor
      const uniqueVets = Array.from(new Map(parsedVets.map(v => [v.name, v])).values());
      setVetList(uniqueVets);
      setVetCache(prev => ({ ...prev, [specialty]: uniqueVets }));
      setCurrentPage(1);

    } catch (e: any) {
      console.error("Error fetching vets:", e);
      // Silent Failover: Use Mock Data if API fails
      const mocks = MOCK_VETS[specialty] || MOCK_VETS['General'];
      setVetList(mocks);
      // We do NOT set locationError so the user sees the list
    } finally {
      setIsLoadingVets(false);
    }
  };

  const handleDirections = (vet: VetInfo) => {
    if (vet.uri && vet.uri.startsWith('http')) {
        window.open(vet.uri, '_blank');
    } else {
        // Fallback to searching Google Maps with Name + Address
        const query = encodeURIComponent(`${vet.name} ${vet.address || ''}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  useEffect(() => {
    if (view === 'vets' && !isLoadingVets) {
      // Heuristic: Check if we currently have Mock Data loaded
      const isMockData = vetList.length > 0 && vetList[0].name === "City Paws Clinic";
      
      if (location) {
         // We have location now. If we have no data, OR we have mock data, fetch real data.
         if (vetList.length === 0 || isMockData) {
             fetchVets(activeSpecialty, true); // Force refresh to get real data
         }
      } else if (!isLocating && vetList.length === 0) {
         // Location failed and we have no data, fetch (will trigger mock fallback)
         fetchVets(activeSpecialty);
      }
      // If !location && isLocating, do nothing (wait).
    }
  }, [view, location, isLocating]); // Re-run when location status changes

  const sortedVets = useMemo(() => {
      let sorted = [...vetList];
      if (sortOption === 'rating') {
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      // Distance sorting is usually implicit from API
      return sorted;
  }, [vetList, sortOption]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedVets.length / itemsPerPage);
  const currentVets = sortedVets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- Views ---

  if (view === 'history') {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
         <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('tracker')}
                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 active:scale-95 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-2xl font-black text-slate-900">Care Timeline</h2>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-2">
               {logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log, index) => {
                 const pet = pets.find(p => p.id === log.petId);
                 let Icon = FileText;
                 let colorClass = "bg-slate-500 border-slate-500";
                 let iconBg = "bg-slate-100 text-slate-500";

                 if (log.type === 'Vaccination') { Icon = Syringe; colorClass = "bg-green-500 border-green-500"; iconBg = "bg-green-100 text-green-600"; }
                 else if (log.type === 'Checkup') { Icon = Stethoscope; colorClass = "bg-blue-500 border-blue-500"; iconBg = "bg-blue-100 text-blue-600"; }
                 else if (log.type === 'Medication') { Icon = Pill; colorClass = "bg-purple-500 border-purple-500"; iconBg = "bg-purple-100 text-purple-600"; }
                 else if (log.type === 'Temperature') { Icon = Thermometer; colorClass = "bg-orange-500 border-orange-500"; iconBg = "bg-orange-100 text-orange-600"; }
                 else if (log.type === 'Weight') { Icon = Activity; colorClass = "bg-pink-500 border-pink-500"; iconBg = "bg-pink-100 text-pink-600"; }

                 return (
                   <div key={log.id} className="relative pl-8">
                      <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-[3px] border-white ${colorClass} shadow-sm z-10`}></div>
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="w-full text-left bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 active:scale-[0.98] transition-all hover:shadow-md group relative overflow-hidden"
                      >
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                  <Icon size={18} />
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-800 text-sm">{log.type}</h4>
                                  <span className="text-[10px] font-bold text-slate-400 block">{log.date}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                               {pet && <img src={pet.image} alt={pet.name} className="w-4 h-4 rounded-full object-cover" />}
                               <span className="text-[10px] font-bold text-slate-600">{pet?.name}</span>
                            </div>
                         </div>
                         <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pl-[3.25rem]">{log.description}</p>
                         {log.value && (
                            <div className="mt-2 pl-[3.25rem]">
                               <span className="inline-block px-2 py-1 bg-slate-100 rounded-md text-[10px] font-black text-slate-700">{log.value}</span>
                            </div>
                         )}
                         {log.attachments && log.attachments.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 pl-[3.25rem] text-[10px] font-bold text-slate-400">
                               <File size={10} /> {log.attachments.length} Document{log.attachments.length > 1 ? 's' : ''}
                            </div>
                         )}
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={20} />
                         </div>
                      </button>
                   </div>
                 );
               })}
               {logs.length === 0 && (
                 <div className="pl-8 text-slate-400 text-sm italic py-10">No records found. Start tracking!</div>
               )}
            </div>
         </div>
         {selectedLog && (
            <LogDetailModal 
              log={selectedLog} 
              pets={pets}
              onClose={() => setSelectedLog(null)} 
            />
         )}
      </div>
    );
  }

  if (view === 'vets') {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
        {/* Vet Connect Header - Sticky */}
        <div className="bg-white/95 backdrop-blur-md pt-6 pb-2 shadow-sm sticky top-0 z-30 border-b border-slate-100">
          <div className="flex items-center justify-between px-6 mb-4">
            <div className="flex items-center gap-4">
                <button 
                onClick={() => setView('tracker')}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 active:scale-90 transition-all"
                >
                <ChevronLeft size={24} />
                </button>
                <div>
                    <h2 className="text-xl font-black text-slate-800 leading-none">Vet Connect</h2>
                    <div className="flex items-center gap-1 text-slate-400 mt-1">
                        <MapPin size={10} />
                        <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[150px]">
                           {location ? "Nearby" : isLocating ? "Locating..." : "Using Demo Data"}
                        </span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => fetchVets(activeSpecialty, true)}
                className="p-2 bg-slate-50 text-slate-400 rounded-full hover:text-orange-500 active:rotate-180 transition-all"
            >
                <RefreshCw size={18} />
            </button>
          </div>
          
          {/* Controls Row - Integrated */}
          <div className="flex items-center pl-6 gap-2 pb-2">
             {/* Filter Toggle */}
             <button 
               onClick={() => setIsFilterOpen(!isFilterOpen)}
               className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all shrink-0 text-[10px] font-black uppercase tracking-wider ${isFilterOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600'}`}
             >
               <SlidersHorizontal size={14} /> Filter
             </button>

             {/* Horizontal Scroll Chips */}
             <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2 pr-6">
                {['General', 'Emergency', 'Dental', 'Surgeon', 'Dermatology'].map((spec) => (
                <button
                    key={spec}
                    onClick={() => fetchVets(spec)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
                    activeSpecialty === spec
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                    }`}
                >
                    {spec}
                </button>
                ))}
            </div>
          </div>

          {/* Filter Options Panel */}
          {isFilterOpen && (
              <div className="px-6 pb-4 animate-in slide-in-from-top-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sort By</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => setSortOption('distance')}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${sortOption === 'distance' ? 'bg-white border-orange-500 text-orange-500 shadow-sm' : 'bg-white border-slate-200 text-slate-500'}`}
                        >
                            <Navigation size={14} /> Distance
                        </button>
                        <button 
                          onClick={() => setSortOption('rating')}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${sortOption === 'rating' ? 'bg-white border-orange-500 text-orange-500 shadow-sm' : 'bg-white border-slate-200 text-slate-500'}`}
                        >
                            <Star size={14} /> Top Rated
                        </button>
                    </div>
                  </div>
              </div>
          )}
        </div>

        {/* Vet Content */}
        <div ref={listRef} className="p-6 space-y-4 pb-32 overflow-y-auto bg-slate-50 flex-1 scroll-smooth">
          {/* Locating State */}
          {isLocating && !location && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-400">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-bold uppercase tracking-widest">Finding you...</span>
              </div>
          )}

          {/* Error State */}
          {locationError && !isLocating && (
             <div className="p-5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex flex-col gap-3 border border-red-100 items-start">
               <div className="flex items-center gap-2">
                 <AlertCircle size={18} /> 
                 <span>{locationError}</span>
               </div>
               <button onClick={locateUser} className="px-4 py-2 bg-white rounded-xl text-slate-900 shadow-sm text-[10px] uppercase border border-slate-100">Retry Location</button>
             </div>
          )}

          {/* Results */}
          {!isLocating && !locationError && (
             <>
               {isLoadingVets ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 animate-pulse">
                        <div className="flex justify-between mb-4">
                            <div className="w-2/3 h-5 bg-slate-100 rounded-md"></div>
                            <div className="w-10 h-5 bg-slate-100 rounded-md"></div>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-md mb-2"></div>
                        <div className="w-1/2 h-3 bg-slate-100 rounded-md mb-6"></div>
                        <div className="flex gap-2">
                            <div className="flex-1 h-10 bg-slate-100 rounded-xl"></div>
                            <div className="flex-1 h-10 bg-slate-100 rounded-xl"></div>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="space-y-4">
                   {currentVets.length > 0 ? (
                     <>
                        {currentVets.map((vet, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-lg group relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">{vet.name}</h4>
                                <div className="flex items-center gap-2">
                                    {vet.isOpen !== undefined && (
                                        <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${vet.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${vet.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {vet.isOpen ? 'Open Now' : 'Closed'}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-300">•</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{vet.specialty || activeSpecialty}</span>
                                </div>
                            </div>
                            {vet.rating && (
                                <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1.5 rounded-xl text-yellow-600 text-xs font-black border border-yellow-100">
                                <Star size={12} fill="currentColor" /> 
                                <span>{vet.rating}</span>
                                </div>
                            )}
                            </div>
                            
                            <div className="flex items-start gap-2 mb-5 bg-slate-50 p-3 rounded-xl">
                            <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{vet.address || "Address available on map"}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={() => handleDirections(vet)}
                                    className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-blue-100"
                                >
                                    <Navigation size={14} /> Directions
                                </button>
                                <a 
                                    href={`tel:${vet.phone || ''}`}
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-100"
                                >
                                    <Phone size={14} /> Call
                                </a>
                            </div>

                            {vet.distance && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                                    {vet.distance}
                                </div>
                            )}
                        </div>
                        ))}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6 pt-2 pb-6">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${currentPage === 1 ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'bg-white text-slate-600 shadow-sm border border-slate-200 hover:border-orange-200 hover:text-orange-500'}`}
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                
                                <span className="text-xs font-bold text-slate-400">
                                    {currentPage} / {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${currentPage === totalPages ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800'}`}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                     </>
                   ) : (
                     !locationError && (
                        <div className="text-center py-10 text-slate-400 text-sm font-medium">
                            <MapPin size={32} className="mx-auto mb-2 text-slate-200" />
                            <p>No veterinarians found nearby.</p>
                            <button onClick={() => fetchVets(activeSpecialty, true)} className="mt-4 text-orange-500 font-bold text-xs uppercase tracking-wide">Try Again</button>
                        </div>
                     )
                   )}
                 </div>
               )}
             </>
          )}
        </div>
      </div>
    );
  }

  // Main Tracker View
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Health Track</h2>
        <button 
          onClick={() => setView('history')}
          className="text-orange-500 font-black text-xs uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors flex items-center gap-1"
        >
          <History size={14} /> History
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <button 
            onClick={() => setIsAddTempOpen(true)}
            className="absolute top-3 right-3 w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors z-20"
          >
            <Plus size={16} />
          </button>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-bl-[2.5rem] -mr-6 -mt-6 z-0"></div>
          <Thermometer className="text-orange-500 relative z-10" size={24} />
          <div>
             <span className="text-2xl font-black text-slate-800 relative z-10">{avgTemp}{avgTemp !== 'N/A' && '°F'}</span>
             <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest relative z-10">Avg. Temp</span>
             </div>
          </div>
        </div>

        <div 
          className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-2 relative group"
          onMouseLeave={() => setShowVaxDetails(false)}
        >
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
             <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-[2.5rem] -mr-6 -mt-6 z-0"></div>
          </div>

          <button 
             onClick={(e) => { e.stopPropagation(); setShowVaxDetails(!showVaxDetails); }}
             onMouseEnter={() => setShowVaxDetails(true)}
             className="absolute top-3 right-3 w-8 h-8 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:bg-green-100 hover:text-green-600 transition-colors z-20"
          >
             <Info size={16} />
          </button>

          {showVaxDetails && (
             <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-30 animate-in fade-in zoom-in-95 duration-200">
                 <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Vaccines</h4>
                    <button onClick={(e) => { e.stopPropagation(); setShowVaxDetails(false); }} className="text-slate-300 hover:text-slate-500"><X size={14} /></button>
                 </div>
                 <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {vaxData.details.map((item, i) => (
                       <div key={i} className="flex items-center justify-between group/item">
                          <div className="flex items-center gap-2.5">
                             <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                                {item.completed && <Check size={10} strokeWidth={4} />}
                             </div>
                             <span className={`text-xs font-bold ${item.completed ? 'text-slate-700' : 'text-slate-400'}`}>{item.vaccine}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded-md">{item.petName}</span>
                       </div>
                    ))}
                 </div>
             </div>
          )}

          <ShieldCheck className="text-green-500 relative z-10" size={24} />
          <div>
            <span className="text-2xl font-black text-slate-800 relative z-10">{vaxData.status}</span>
            <div className="flex items-center gap-1">
               <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest relative z-10">Vax Status</span>
            </div>
          </div>
        </div>
      </div>

      <section>
        <button 
          onClick={() => setView('vets')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group active:scale-[0.98] transition-all text-left"
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
           
           <div className="relative z-10 flex items-center justify-between">
             <div className="space-y-2">
               <div className="flex items-center gap-2 mb-1">
                 <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                   <Stethoscope size={20} className="text-white" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Vet Connect</span>
               </div>
               <h3 className="text-2xl font-black leading-tight max-w-[70%]">Find Nearby Veterinarians</h3>
               <p className="text-blue-100 text-xs font-medium max-w-[80%]">Locate clinics, emergency care, and specialists instantly.</p>
             </div>
             <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
               <ArrowRight size={24} />
             </div>
           </div>
        </button>
      </section>

      <HealthSuggestions pets={pets} />

      <section className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-xl text-slate-800">Care Logs</h3>
          <button 
            onClick={() => setIsAddLogOpen(true)}
            className="text-orange-500 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
          >
            <PlusCircle size={16} /> Add Record
          </button>
        </div>

        <div className="space-y-4">
          {logs.slice(0, 5).map(log => {
             const pet = pets.find(p => p.id === log.petId);
             let Icon = FileText;
             let colorClass = "bg-slate-100 text-slate-500";
             if (log.type === 'Vaccination') { Icon = Syringe; colorClass = "bg-green-100 text-green-600"; }
             else if (log.type === 'Temperature') { Icon = Thermometer; colorClass = "bg-orange-100 text-orange-600"; }
             else if (log.type === 'Checkup') { Icon = Stethoscope; colorClass = "bg-blue-100 text-blue-600"; }
             
             return (
              <button 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className="w-full flex gap-4 p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm items-start text-left active:scale-[0.98] transition-all hover:shadow-md"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="font-bold text-slate-800 text-sm truncate">{log.type}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{pet?.name} • {log.date}</span>
                     </div>
                     {log.value && <span className="font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-lg text-xs shrink-0">{log.value}</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed truncate">{log.description}</p>
                  {log.attachments && log.attachments.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400 font-bold">
                          <File size={10} /> {log.attachments.length} Document(s)
                      </div>
                  )}
                </div>
              </button>
             );
          })}
          {logs.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">
              <FileText className="mx-auto text-slate-200 mb-3" size={32} />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No records yet</p>
            </div>
          )}
        </div>
      </section>

      {isAddLogOpen && (
        <AddLogModal 
          pets={pets} 
          onClose={() => setIsAddLogOpen(false)} 
          onSubmit={(log) => { onAddLog(log); setIsAddLogOpen(false); }} 
        />
      )}

      {isAddTempOpen && (
        <AddTempModal 
          pets={pets} 
          onClose={() => setIsAddTempOpen(false)} 
          onSubmit={(log) => { onAddLog(log); setIsAddTempOpen(false); }} 
        />
      )}

      {selectedLog && (
        <LogDetailModal 
          log={selectedLog} 
          pets={pets}
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </div>
  );
};

// --- Sub-Components ---

const HealthSuggestions = ({ pets }: { pets: Pet[] }) => {
  const hasDogs = pets.some(p => p.species === 'Dog');
  if (!hasDogs) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
         <h3 className="font-bold text-xl text-slate-800">Care Suggestions</h3>
         <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-md text-[10px] font-black uppercase">Dog Care</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
         <div className="w-64 bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm shrink-0 flex flex-col gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
               <Shield size={20} />
            </div>
            <div>
               <h4 className="font-black text-slate-800">Core Vaccines</h4>
               <p className="text-xs text-slate-400 mt-1">Essential protection for every dog.</p>
            </div>
            <div className="space-y-1">
               {['Rabies', 'DHPP (Distemper/Parvo)', 'Leptospirosis'].map(v => (
                  <div key={v} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {v}
                  </div>
               ))}
            </div>
         </div>

         <div className="w-64 bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm shrink-0 flex flex-col gap-3">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
               <Zap size={20} />
            </div>
            <div>
               <h4 className="font-black text-slate-800">Preventative</h4>
               <p className="text-xs text-slate-400 mt-1">Monthly & seasonal treatments.</p>
            </div>
            <div className="space-y-1">
               {['Heartworm Prevention', 'Flea & Tick Control', 'Annual Dental Clean'].map(v => (
                  <div key={v} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                     <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> {v}
                  </div>
               ))}
            </div>
         </div>
      </div>
    </section>
  )
}

const LogDetailModal = ({ log, pets, onClose }: { log: HealthLog, pets: Pet[], onClose: () => void }) => {
   const pet = pets.find(p => p.id === log.petId);
   let Icon = FileText;
   let colorClass = "bg-slate-100 text-slate-500";
   
   if (log.type === 'Vaccination') { Icon = Syringe; colorClass = "bg-green-100 text-green-600"; }
   else if (log.type === 'Checkup') { Icon = Stethoscope; colorClass = "bg-blue-100 text-blue-600"; }
   else if (log.type === 'Medication') { Icon = Pill; colorClass = "bg-purple-100 text-purple-600"; }
   else if (log.type === 'Temperature') { Icon = Thermometer; colorClass = "bg-orange-100 text-orange-600"; }
   else if (log.type === 'Weight') { Icon = Activity; colorClass = "bg-pink-100 text-pink-600"; }

   return (
      <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
         <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-0 flex justify-between items-start">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                  <Icon size={28} />
               </div>
               <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100">
                  <X size={20} />
               </button>
            </div>
            
            <div className="p-6 space-y-6">
               <div>
                  <h3 className="text-2xl font-black text-slate-900">{log.type}</h3>
                  <div className="flex items-center gap-2 mt-2">
                     {pet && <img src={pet.image} alt={pet.name} className="w-6 h-6 rounded-full object-cover border border-slate-100" />}
                     <span className="font-bold text-slate-600">{pet?.name}</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                     <span className="text-slate-400 font-medium text-sm">{log.date}</span>
                  </div>
               </div>
               
               {log.value && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recorded Value</span>
                     <span className="text-2xl font-black text-slate-800">{log.value}</span>
                  </div>
               )}

               <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes / Description</span>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed">
                     {log.description}
                  </div>
               </div>

               {log.attachments && log.attachments.length > 0 && (
                  <div className="space-y-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Documents</span>
                     <div className="space-y-2">
                        {log.attachments.map((file, idx) => (
                           <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                              <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                 <File size={16} />
                              </div>
                              <span className="text-xs font-bold text-slate-700 truncate flex-1">{file}</span>
                              <ExternalLink size={14} className="text-slate-300" />
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

const AddLogModal = ({ pets, onClose, onSubmit }: any) => {
   const [type, setType] = useState<HealthLog['type']>('Checkup');
   const [petId, setPetId] = useState(pets[0]?.id || '');
   const [desc, setDesc] = useState('');
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
   const [vaccine, setVaccine] = useState('');
   const [documents, setDocuments] = useState<string[]>([]);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const selectedPet = pets.find((p: Pet) => p.id === petId);
   const species = selectedPet?.species || 'Dog';

   const VACCINE_OPTIONS: Record<string, string[]> = {
     'Dog': ['Rabies', 'DHPP', 'Bordetella', 'Leptospirosis', 'Lyme Disease', 'Canine Influenza'],
     'Cat': ['Rabies', 'FVRCP', 'FeLV', 'FIV'],
     'Rabbit': ['Myxomatosis', 'RHD'],
     'Bird': ['Polyomavirus', 'Pacheco\'s'],
     'Other': ['Rabies', 'Distemper']
   };
   const currentVaccines = VACCINE_OPTIONS[species as keyof typeof VACCINE_OPTIONS] || VACCINE_OPTIONS['Other'];

   useEffect(() => { setVaccine(''); setDesc(''); }, [type, petId]);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         setDocuments(prev => [...prev, e.target.files![0].name]);
      }
   };

   const removeDoc = (index: number) => setDocuments(prev => prev.filter((_, i) => i !== index));

   const handleSubmit = () => {
      let finalDesc = desc;
      if (type === 'Vaccination') {
          if (vaccine === 'Other') { if (!desc) return; finalDesc = desc; }
          else if (vaccine) { finalDesc = vaccine; }
          else { return; }
      } else { if (!desc) return; }
      onSubmit({ id: Math.random().toString(36).substr(2, 9), petId, type, date, description: finalDesc, attachments: documents });
   };

   return (
      <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center">
         <div className="w-full sm:w-[90%] sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-slate-800">Add Health Record</h3>
               <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <div className="space-y-4">
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {pets.map((p: Pet) => (
                     <button key={p.id} onClick={() => setPetId(p.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${petId === p.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-100'}`}>
                        <img src={p.image} className="w-6 h-6 rounded-full object-cover" alt="" />
                        <span className="text-xs font-bold">{p.name}</span>
                     </button>
                  ))}
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {['Checkup', 'Vaccination', 'Medication', 'Note'].map(t => (
                     <button key={t} onClick={() => setType(t as any)} className={`py-3 rounded-xl text-xs font-black uppercase tracking-wide border ${type === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 border-slate-50 text-slate-500'}`}>
                        {t}
                     </button>
                  ))}
               </div>
               
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
               </div>

               {type === 'Vaccination' ? (
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Vaccine</label>
                     <div className="flex flex-wrap gap-2">
                        {currentVaccines.map(v => (
                           <button key={v} onClick={() => setVaccine(v)} className={`px-3 py-2 rounded-xl text-xs font-bold border ${vaccine === v ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-100 text-slate-500'}`}>{v}</button>
                        ))}
                        <button onClick={() => setVaccine('Other')} className={`px-3 py-2 rounded-xl text-xs font-bold border ${vaccine === 'Other' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-100 text-slate-500'}`}>Other</button>
                     </div>
                     {vaccine === 'Other' && (
                        <input type="text" placeholder="Vaccine Name" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm mt-2 focus:outline-none" />
                     )}
                  </div>
               ) : (
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Details</label>
                     <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Enter details..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  </div>
               )}

               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Attachments</label>
                     <button onClick={() => fileInputRef.current?.click()} className="text-orange-500 text-[10px] font-black uppercase flex items-center gap-1"><Upload size={12} /> Upload</button>
                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  </div>
                  {documents.length > 0 && (
                     <div className="space-y-2">
                        {documents.map((doc, i) => (
                           <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{doc}</span>
                              <button onClick={() => removeDoc(i)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl active:scale-[0.98] transition-all">Save Record</button>
            </div>
         </div>
      </div>
   );
};

const AddTempModal = ({ pets, onClose, onSubmit }: any) => {
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [temp, setTemp] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!temp || !petId) return;
    onSubmit({
      id: Math.random().toString(36).substr(2, 9),
      petId,
      type: 'Temperature',
      date: `${date} ${time}`,
      value: temp,
      description: notes || 'Regular temperature check',
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center">
      <div className="w-full sm:w-[90%] sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">Log Temperature</h3>
            <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
        </div>
        
        <div className="space-y-6">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {pets.map((p: Pet) => (
                 <button key={p.id} onClick={() => setPetId(p.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${petId === p.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-100'}`}>
                    <img src={p.image} className="w-6 h-6 rounded-full object-cover" alt="" />
                    <span className="text-xs font-bold">{p.name}</span>
                 </button>
              ))}
           </div>

           <div className="flex items-center justify-center py-4">
              <div className="relative">
                 <input 
                   type="number" 
                   value={temp} 
                   onChange={(e) => setTemp(e.target.value)} 
                   placeholder="--" 
                   className="w-40 text-center text-5xl font-black text-slate-800 placeholder:text-slate-200 outline-none"
                   autoFocus
                 />
                 <span className="absolute top-2 -right-6 text-xl font-black text-slate-400">°F</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Date</label>
                 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 text-sm" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Time</label>
                 <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 text-sm" />
              </div>
           </div>

           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Notes (Optional)</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. After exercise" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 text-sm" />
           </div>

           <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl active:scale-[0.98] transition-all">Save Log</button>
        </div>
      </div>
    </div>
  );
};

export default HealthTracker;