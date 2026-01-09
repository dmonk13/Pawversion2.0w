
import React, { useState, useEffect, useRef } from 'react';
import { Match, Pet } from '../types';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image,
  Sparkles,
  Search,
  CheckCheck,
  Bot,
  Mic,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Check,
  Activity
} from 'lucide-react';
import AIAdvisor from './AIAdvisor';

interface MatchesProps {
  matches: Match[];
  pets: Pet[];
  activeMatchId?: string;
  onSelectMatch: (id: string | undefined) => void;
}

interface ChatMessage {
  text?: string;
  image?: string;
  isMe: boolean;
  time: string;
}

const Matches: React.FC<MatchesProps> = ({ matches, pets, activeMatchId, onSelectMatch }) => {
  const [chatInput, setChatInput] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize messages with sample data for demonstration
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
     'm1': [ // Cooper
         { text: "Hey! We saw Luna at the park yesterday. She's so fast!", isMe: false, time: '10:00 AM' },
         { text: "Yeah she loves chasing frisbees! 🥏", isMe: true, time: '10:05 AM' },
         { text: "Woof! When are we playing? 🦴", isMe: false, time: '10m' }
     ],
     'm2': [ // Bella
         { text: "Are you going to the puppy meetup?", isMe: false, time: 'Yesterday' },
         { text: "We might be a bit late.", isMe: true, time: 'Yesterday' },
         { text: "See you at the park tomorrow!", isMe: false, time: '1h' }
     ]
  });

  const activeMatch = matches.find(m => m.id === activeMatchId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewingProfile(false);
  }, [activeMatchId]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeMatchId, isCalling]);

  const handleSendMessage = () => {
      if (!chatInput.trim() || !activeMatchId) return;
      
      const newMsg: ChatMessage = { text: chatInput, isMe: true, time: 'Now' };
      setMessages(prev => ({
          ...prev,
          [activeMatchId]: [...(prev[activeMatchId] || []), newMsg]
      }));
      setChatInput('');

      // Auto-reply simulation for demo
      if (activeMatch?.type === 'pet') {
          setTimeout(() => {
              setMessages(prev => ({
                  ...prev,
                  [activeMatchId]: [...(prev[activeMatchId] || []), { text: "Sounds awesome! 🐾", isMe: false, time: 'Now' }]
              }));
          }, 1500);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeMatchId) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newMsg: ChatMessage = { image: reader.result as string, isMe: true, time: 'Now' };
              setMessages(prev => ({
                  ...prev,
                  [activeMatchId]: [...(prev[activeMatchId] || []), newMsg]
              }));
          };
          reader.readAsDataURL(file);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const AI_AVATAR = (
      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white">
          <Bot size={20} />
      </div>
  );

  // --- Render Chat Interface ---
  if (activeMatchId && activeMatch) {
     if (activeMatch.type === 'ai') {
         return (
             <div className="flex flex-col h-full bg-white relative">
                 {/* Frosted Glass Header */}
                 <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                     <div className="flex items-center gap-3">
                         <button onClick={() => onSelectMatch(undefined)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors">
                             <ArrowLeft size={24} className="text-slate-800" />
                         </button>
                         <div className="relative">
                             <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                                 {AI_AVATAR}
                             </div>
                             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                         </div>
                         <div>
                             <h3 className="font-black text-slate-800 leading-none flex items-center gap-1 text-base">
                                 {activeMatch.name} <Sparkles size={14} className="text-orange-500" fill="currentColor" />
                             </h3>
                             <p className="text-xs text-green-600 font-bold mt-0.5">Always Active</p>
                         </div>
                     </div>
                     <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors">
                         <MoreVertical size={20} />
                     </button>
                 </div>
                 
                 {/* AI Chat Container - Ensure it fills height */}
                 <div className="flex-1 overflow-hidden relative z-10 bg-slate-50">
                     <AIAdvisor pets={pets} />
                 </div>
             </div>
         );
     }

     // Regular Pet Chat
     const currentMessages = messages[activeMatchId] || [];
     
     return (
        <div className="flex flex-col h-full bg-slate-50 relative">
             {/* Profile View Overlay */}
             {viewingProfile && (
                <div className="absolute inset-0 z-[60] bg-white overflow-y-auto animate-in slide-in-from-right duration-300">
                    <div className="relative h-[40vh]">
                        <img src={activeMatch.image} className="w-full h-full object-cover" alt={activeMatch.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        <button 
                            onClick={() => setViewingProfile(false)}
                            className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 z-20"
                        >
                            <ChevronRight size={24} className="rotate-180" />
                        </button>
                        
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h2 className="text-4xl font-black text-white">{activeMatch.name}</h2>
                            <p className="text-white/80 font-bold text-lg">{activeMatch.breed || 'Unknown Breed'} • 2 yrs</p>
                        </div>
                    </div>

                    <div className="p-8 -mt-6 bg-white rounded-t-[2.5rem] relative z-10 space-y-8 min-h-[60vh] pb-32">
                        {/* Stats Row */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px] flex-shrink-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</p>
                                <p className="text-lg font-black text-slate-800 flex items-center gap-1"><MapPin size={14} className="text-orange-500" /> 1.5 km</p>
                            </div>
                            <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px] flex-shrink-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                                <p className="text-lg font-black text-slate-800">Male</p>
                            </div>
                            <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px] flex-shrink-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                <p className="text-lg font-black text-slate-800">Intact</p>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-black text-slate-800">About {activeMatch.name}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Hey! I'm {activeMatch.name}. I love playing fetch, running in the park, and making new friends. 
                                Looking forward to our next playdate! 🐾
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Playful', 'Energetic', 'Friendly'].map(t => (
                                <span key={t} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wide">#{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Medical */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-green-500" /> Medical History
                            </h3>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                {['Fully Vaccinated', 'No Allergies'].map((med, i) => (
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
                </div>
             )}

             {/* Call Overlay */}
             {isCalling && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden mb-6 relative shadow-2xl">
                        <img src={activeMatch.image} alt={activeMatch.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                    </div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">{activeMatch.name}</h2>
                    <p className="text-slate-400 font-bold mb-12 animate-pulse uppercase tracking-widest text-sm">Calling...</p>
                    
                    <div className="flex gap-8">
                        <button className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors">
                            <Mic size={24} />
                        </button>
                        <button 
                            onClick={() => setIsCalling(false)} 
                            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all active:scale-90"
                        >
                            <Phone size={32} className="rotate-[135deg]" fill="currentColor" />
                        </button>
                        <button className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors">
                            <Video size={24} />
                        </button>
                    </div>
                </div>
             )}

             {/* Chat Header */}
             <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                 <div className="flex items-center gap-3">
                     <button onClick={() => onSelectMatch(undefined)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors">
                         <ArrowLeft size={24} className="text-slate-800" />
                     </button>
                     <button 
                        onClick={() => setViewingProfile(true)}
                        className="flex items-center gap-3 text-left group"
                     >
                        <div className="relative">
                            <img src={activeMatch.image} alt={activeMatch.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 leading-none text-base group-hover:text-orange-500 transition-colors">{activeMatch.name}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-0.5">{activeMatch.breed}</p>
                        </div>
                     </button>
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={() => setIsCalling(true)} className="w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><Phone size={20} /></button>
                     <button onClick={() => setIsCalling(true)} className="w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><Video size={20} /></button>
                 </div>
             </div>

             {/* Messages Area */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                 <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-slate-200/50 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today</span>
                 </div>
                 
                 {currentMessages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-48 opacity-60">
                         <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                            <span className="text-4xl">👋</span>
                         </div>
                         <p className="text-sm font-bold text-slate-500">Say hello to {activeMatch.name}!</p>
                     </div>
                 )}

                 {currentMessages.map((msg, i) => (
                     <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm relative group text-sm font-medium ${msg.isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
                             {msg.image ? (
                                <div className="rounded-lg overflow-hidden mb-1">
                                    <img src={msg.image} alt="Sent" className="max-w-full h-auto object-cover max-h-60" />
                                </div>
                             ) : (
                                <p className="leading-relaxed">{msg.text}</p>
                             )}
                             <div className={`text-[9px] font-bold mt-1.5 flex items-center gap-1 ${msg.isMe ? 'text-slate-400 justify-end' : 'text-slate-300'}`}>
                                 {msg.time} {msg.isMe && <CheckCheck size={12} />}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>

             {/* Input Area - Redesigned for Visibility */}
             <div className="p-3 bg-white border-t border-slate-100 pb-safe z-20">
                 <div className="flex items-end gap-2 bg-slate-100 p-1.5 rounded-[2rem] border border-slate-100">
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                     />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shrink-0"
                     >
                         <Image size={20} />
                     </button>
                     <textarea 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-1 py-2.5 max-h-24 min-h-[44px] resize-none text-slate-800 placeholder:text-slate-400"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                     />
                     <button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0 shadow-md ${!chatInput.trim() ? 'bg-slate-200 text-slate-400' : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-90'}`}
                     >
                         <Send size={18} fill="currentColor" className={!chatInput.trim() ? "ml-0" : "ml-0.5"} />
                     </button>
                 </div>
             </div>
        </div>
     );
  }

  // --- Render Matches List View ---
  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 pb-24">
       <div className="p-6 pb-2 pt-8">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h2>
           <div className="mt-4 relative">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search chats..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-slate-800" />
           </div>
       </div>

       {/* New Matches Stories */}
       <div className="space-y-4 mt-2">
           <h3 className="px-6 text-xs font-black uppercase text-slate-400 tracking-widest">New Matches</h3>
           <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
               {/* Dr. Paw Story */}
               <button 
                 onClick={() => onSelectMatch('ai_expert')}
                 className="flex flex-col items-center gap-2 shrink-0 group"
               >
                   <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 to-amber-500 relative shadow-lg shadow-orange-500/20">
                       <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-orange-50">
                           {AI_AVATAR}
                       </div>
                       <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                   </div>
                   <span className="text-xs font-bold text-slate-800">Dr. Paw</span>
               </button>

               {matches.filter(m => m.type !== 'ai').map((match) => (
                   <button 
                     key={match.id} 
                     onClick={() => onSelectMatch(match.id)}
                     className="flex flex-col items-center gap-2 shrink-0 group"
                   >
                       <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-rose-500 relative">
                           <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden">
                               <img src={match.image} alt={match.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                           </div>
                           <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                       </div>
                       <span className="text-xs font-bold text-slate-700 max-w-[64px] truncate">{match.name}</span>
                   </button>
               ))}
           </div>
       </div>

       {/* Messages List */}
       <div className="flex-1 overflow-y-auto mt-2">
            <h3 className="px-6 text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Recent</h3>
            <div className="space-y-1 px-2 pb-24">
                {matches.map(match => (
                    <button 
                        key={match.id} 
                        onClick={() => onSelectMatch(match.id)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[1.5rem] transition-colors text-left group border border-transparent hover:border-slate-100"
                    >
                        <div className="relative shrink-0">
                            {match.type === 'ai' ? (
                                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                                    {AI_AVATAR}
                                </div>
                            ) : (
                                <img src={match.image} alt={match.name} className="w-14 h-14 rounded-full object-cover border border-slate-100 shadow-sm" />
                            )}
                            
                            {match.type === 'ai' ? (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                        <Sparkles size={8} className="text-white" fill="currentColor" />
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                                    {match.name} 
                                    {match.type === 'ai' && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-md text-[9px] font-black uppercase tracking-wide">AI</span>}
                                </h4>
                                <span className={`text-[10px] font-bold ${match.unread ? 'text-orange-500' : 'text-slate-400'}`}>
                                    {match.lastMessageTime || 'Now'}
                                </span>
                            </div>
                            <p className={`text-xs truncate ${match.unread ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                                {match.lastMessage || (match.type === 'ai' ? 'Ready to help!' : 'Say hello! 👋')}
                            </p>
                        </div>
                        
                        {match.unread && (
                            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50"></div>
                        )}
                    </button>
                ))}
            </div>
       </div>
    </div>
  );
};

export default Matches;
