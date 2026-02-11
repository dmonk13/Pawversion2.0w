
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Pet, HealthLog, Task } from '../types';
import {
  Clock,
  Heart,
  ArrowRight,
  Zap,
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  PlusCircle,
  Repeat,
  CheckCircle,
  Circle,
  X,
  Calendar,
  Utensils,
  Activity,
  Scissors,
  Check,
  Lightbulb,
  Users,
  CalendarPlus,
  Camera,
  ScanLine
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Props {
  pets: Pet[];
  logs: HealthLog[];
  tasks: Task[];
  onSelectPet: (id: string) => void;
  onAddPet: () => void;
  onAddTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: any) => void;
  userName?: string;
}

const FACTS = [
  "Dogs can smell your feelings! They pick up on changes in your scent caused by emotions.",
  "Cats spend 70% of their lives sleeping.",
  "A dog's nose print is unique, much like a human's fingerprint.",
  "Purring doesn't always mean happiness; cats also purr when they are nervous or in pain.",
  "Regular grooming helps build a strong bond between you and your pet.",
  "Dogs have three eyelids to protect and lubricate their eyes.",
  "Cats can rotate their ears 180 degrees.",
  "Chocolate is toxic to dogs because of theobromine, which they can't metabolize well.",
  "Whiskers help cats navigate in the dark by detecting subtle changes in air currents.",
  "Tail wagging has its own language: right for happy, left for nervous."
];

// Helper to generate Google Calendar Link
const generateGoogleCalendarUrl = (task: Task) => {
    // Format start time
    const startDateTime = new Date(`${task.date}T${task.time}`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // Default 30 min duration
    
    const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const start = format(startDateTime);
    const end = format(endDateTime);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${start}/${end}&details=${encodeURIComponent(task.type)}&sf=true&output=xml`;
};

const Dashboard: React.FC<Props> = ({ pets, logs, tasks, onSelectPet, onAddPet, onAddTask, onToggleTask, onNavigate, userName }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBreedModalOpen, setIsBreedModalOpen] = useState(false);
  const [petFact, setPetFact] = useState('');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    setPetFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Sort by completion (uncompleted first)
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Then by date/time
      return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    });
  }, [tasks]);

  const completionPercentage = useMemo(() => {
    // Check for tasks scheduled today
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);
    
    if (todayTasks.length === 0) return 100; // All good if no tasks
    const completed = todayTasks.filter(t => t.completed).length;
    return Math.round((completed / todayTasks.length) * 100);
  }, [tasks]);

  const getPetImage = (petId: string) => pets.find(p => p.id === petId)?.image;

  // SVG Progress calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

  const handleAddToCalendar = (task: Task) => {
      window.open(generateGoogleCalendarUrl(task), '_blank');
  };

  return (
    <div className="p-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Top Grid: Welcome & Fact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Welcome Header & Progress */}
        <section className="md:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                <Calendar size={12} />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                {greeting}, <br />
                <span className="text-orange-500">{userName || 'Parent'}</span>!
            </h2>
            <p className="text-slate-400 text-xs font-bold mt-1">Your furry friends are doing great.</p>
          </div>
          
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-100" />
                <circle 
                  cx="40" cy="40" r="30" 
                  stroke="currentColor" strokeWidth="6" fill="none" 
                  className="text-orange-500 transition-all duration-1000 ease-out" 
                  strokeDasharray={2 * Math.PI * 30} 
                  strokeDashoffset={2 * Math.PI * 30 - (completionPercentage / 100) * (2 * Math.PI * 30)} 
                  strokeLinecap="round" 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-sm font-black text-slate-800">{completionPercentage}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Daily</span>
             </div>
          </div>
        </section>

        {/* Daily Fact Card */}
        <div className="md:col-span-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 rounded-[2rem] shadow-lg shadow-violet-500/20 text-white relative overflow-hidden group flex flex-col justify-center">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                 <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                   <Lightbulb size={16} className="text-yellow-200" fill="currentColor" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Daily Pet Fact</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{petFact}</p>
           </div>
        </div>
      </div>

      {/* --- BREED SCANNER UI START --- */}
      {/* Moved here and styled with Dark Slate for maximum visibility */}
      <section 
          onClick={() => setIsBreedModalOpen(true)}
          className="w-full bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl shadow-slate-900/20 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all relative overflow-hidden active:scale-[0.98]"
      >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/10 group-hover:bg-orange-500 transition-colors duration-500">
                  <ScanLine size={32} />
              </div>
              <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-white text-xl">Breed Scanner</h4>
                    <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm animate-pulse">New</span>
                  </div>
                  <p className="text-slate-300 text-sm font-medium">Take a photo to identify breed & traits.</p>
              </div>
          </div>
          
          <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md relative z-10 group-hover:scale-110 transition-transform">
              <Camera size={24} />
          </div>
      </section>
      {/* --- BREED SCANNER UI END --- */}

      {/* Discover Banner */}
      <section>
        <button 
          onClick={() => onNavigate('community')}
          className="w-full bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 flex items-center justify-between group active:scale-[0.99] transition-all hover:border-orange-200 hover:shadow-orange-200/20"
        >
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Users size={28} />
             </div>
             <div className="text-left">
                <h4 className="font-black text-slate-800 text-xl">Connect with Community</h4>
                <p className="text-sm text-slate-400 font-medium mt-0.5">Find playdates, advice & friends nearby.</p>
             </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:translate-x-2 transition-all">
             <ArrowRight size={24} />
          </div>
        </button>
      </section>

      {/* Main Content Grid: Family (Left) + Tasks/AI (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Col: Family */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="font-bold text-xl text-slate-800">My Family</h3>
            <button onClick={() => onNavigate('pets')} className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:translate-x-1 transition-transform">
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          {/* Responsive Grid for Pets */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:flex xl:overflow-x-auto">
            {pets.map(pet => (
              <button 
                key={pet.id} 
                onClick={() => onSelectPet(pet.id)}
                className="flex-shrink-0 w-48 md:w-auto xl:w-56 bg-white border border-slate-100 rounded-[2rem] p-3 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform text-left active:scale-95 flex flex-col"
              >
                <div className="relative mb-3 w-full aspect-square">
                  <img src={pet.image} alt={pet.name} className="w-full h-full object-cover rounded-[1.8rem]" />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-black text-slate-900 shadow-sm uppercase">
                    {pet.breed.split(' ')[0]}
                  </div>
                </div>
                <div className="px-2 pb-1">
                  <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{pet.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pet.age} Years Old</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-orange-500"></div>)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <button 
              onClick={onAddPet}
              className="flex-shrink-0 w-48 md:w-auto xl:w-48 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-orange-200 hover:text-orange-300 transition-colors active:scale-95 min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Zap size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Add Pet</span>
            </button>
          </div>
        </section>

        {/* Right Col: Tasks & AI */}
        <div className="space-y-8">
            {/* Task List */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-xl text-slate-800">Upcoming Tasks</h3>
                <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="text-orange-500 text-xs font-black uppercase tracking-widest flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                >
                    <PlusCircle size={14} /> New
                </button>
                </div>
                
                <div className="space-y-3">
                {sortedTasks.length > 0 ? (
                    sortedTasks.slice(0, 3).map(task => { // Limit to 3 on dashboard
                    const petImg = getPetImage(task.petId);
                    const petName = pets.find(p => p.id === task.petId)?.name || 'Pet';
                    
                    let TypeIcon = Zap;
                    let colorClass = 'text-orange-500 bg-orange-50';
                    
                    if (task.type === 'Feeding') { TypeIcon = Utensils; colorClass = 'text-indigo-500 bg-indigo-50'; }
                    else if (task.type === 'Health') { TypeIcon = Heart; colorClass = 'text-pink-500 bg-pink-50'; }
                    else if (task.type === 'Grooming') { TypeIcon = Scissors; colorClass = 'text-purple-500 bg-purple-50'; }
                    else if (task.type === 'Activity') { TypeIcon = Activity; colorClass = 'text-green-500 bg-green-50'; }

                    return (
                        <div 
                        key={task.id} 
                        className={`group flex items-center gap-3 bg-white p-4 rounded-[1.5rem] border transition-all ${task.completed ? 'border-slate-50 opacity-60' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}
                        >
                        <div className={`p-3 rounded-xl shrink-0 relative ${colorClass}`}>
                            <TypeIcon size={18} />
                            {petImg && (
                            <img 
                                src={petImg} 
                                alt={petName} 
                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white object-cover" 
                            />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-slate-800 text-sm truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>{petName}: {task.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{task.time} • {task.type}</p>
                        </div>
                        
                        <div className="flex gap-2">
                             <button
                               onClick={() => handleAddToCalendar(task)}
                               className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                               title="Add to Google Calendar"
                             >
                                <CalendarPlus size={16} />
                             </button>
                             <button 
                                onClick={() => onToggleTask(task.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-300 hover:text-green-500 hover:bg-green-50'}`}
                            >
                                {task.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                            </button>
                        </div>
                        </div>
                    );
                    })
                ) : (
                    <div className="text-center py-8 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No upcoming tasks</p>
                    <button onClick={() => setIsTaskModalOpen(true)} className="mt-2 text-orange-500 text-sm font-bold">Add One</button>
                    </div>
                )}
                </div>
            </section>

            {/* Featured AI Promotion */}
            <section className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/30">
                    AI Assistant
                </div>
                <h3 className="text-xl font-black leading-tight">Expert Advice Instantly</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[90%]">Get tailored care routines based on breed analysis.</p>
                <button 
                    onClick={() => onNavigate('ai')}
                    className="w-full bg-white text-slate-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-orange-500 hover:text-white transition-all mt-2"
                >
                    Chat with Dr. Paw
                </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px] -mr-8 -mt-8"></div>
            </section>
        </div>
      </div>

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <AddTaskModal 
          pets={pets} 
          onClose={() => setIsTaskModalOpen(false)} 
          onSubmit={(task) => { onAddTask(task); setIsTaskModalOpen(false); }} 
        />
      )}

      {/* Breed Scanner Modal */}
      {/* --- BREED SCANNER UI MODAL START --- */}
      {isBreedModalOpen && (
        <BreedScannerModal onClose={() => setIsBreedModalOpen(false)} />
      )}
      {/* --- BREED SCANNER UI MODAL END --- */}
    </div>
  );
};

const AddTaskModal = ({ pets, onClose, onSubmit }: { pets: Pet[], onClose: () => void, onSubmit: (task: Task) => void }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    petId: pets[0]?.id || '',
    type: 'Feeding',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    isRecurring: false,
    frequency: 'Daily',
    completed: false
  });
  const [addToGCal, setAddToGCal] = useState(false);

  const isValid = formData.title && formData.petId;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="w-full sm:w-[500px] bg-white rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">New Reminder</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          {/* Pet Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">For Who?</label>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {pets.map(pet => (
                <button 
                  key={pet.id}
                  onClick={() => setFormData({...formData, petId: pet.id})}
                  className={`flex-shrink-0 flex items-center gap-2 pl-2 pr-4 py-2 rounded-2xl border transition-all ${formData.petId === pet.id ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                >
                  <img src={pet.image} alt={pet.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                  <span className="font-bold text-sm">{pet.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {['Feeding', 'Health', 'Activity', 'Grooming', 'Other'].map(type => (
                <button 
                  key={type}
                  onClick={() => setFormData({...formData, type: type as any})}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide border transition-all ${formData.type === type ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
             <input 
              type="text" 
              placeholder="What needs to be done?" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
             />
             
             <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                   <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-4 pl-11 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none" 
                   />
                </div>
                <div className="relative">
                   <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full p-4 pl-11 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none" 
                   />
                </div>
             </div>
          </div>

          {/* Recurrence */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isRecurring ? 'bg-blue-500 text-white' : 'bg-white text-slate-300'}`}>
                    <Repeat size={20} />
                 </div>
                 <div>
                    <p className="font-bold text-slate-800 text-sm">Repeat Task</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Schedule automatically</p>
                 </div>
               </div>
               <button 
                onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.isRecurring ? 'bg-blue-500' : 'bg-slate-200'}`}
               >
                 <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${formData.isRecurring ? 'left-6' : 'left-1'}`}></div>
               </button>
            </div>

            {formData.isRecurring && (
               <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                  {['Daily', 'Weekly', 'Monthly'].map(freq => (
                    <button 
                      key={freq}
                      onClick={() => setFormData({...formData, frequency: freq as any})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${formData.frequency === freq ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                      {freq}
                    </button>
                  ))}
               </div>
            )}
          </div>

          {/* Google Calendar Toggle */}
          <div 
            onClick={() => setAddToGCal(!addToGCal)}
            className={`p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${addToGCal ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
          >
             <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${addToGCal ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>
                {addToGCal && <Check size={12} strokeWidth={4} />}
             </div>
             <span className={`text-xs font-bold ${addToGCal ? 'text-indigo-700' : 'text-slate-500'}`}>Add to Google Calendar</span>
             <CalendarPlus size={16} className={`ml-auto ${addToGCal ? 'text-indigo-500' : 'text-slate-400'}`} />
          </div>

          <button 
            disabled={!isValid}
            onClick={() => {
              const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData as Task
              };
              onSubmit(newTask);
              if(addToGCal) {
                  window.open(generateGoogleCalendarUrl(newTask), '_blank');
              }
            }}
            className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

const BreedScannerModal = ({ onClose }: { onClose: () => void }) => {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null); // Reset result on new image
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const apiKey = (process.env as any).API_KEY || (process.env as any).GEMINI_API_KEY;

            if (!apiKey) {
                setResult("API key not configured. Please set your GEMINI_API_KEY in the environment variables.");
                setLoading(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const base64Data = image.split(',')[1] || image;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: [{
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                        { text: "Identify the dog breed in this image. Provide the breed name and 3 short bullet points about their typical personality traits. If it's not a dog, strictly say 'This doesn't look like a dog'." }
                    ]
                }],
            });

            setResult(response.text || "I couldn't identify the breed. Try a clearer photo!");
        } catch (error) {
            console.error("Breed Scanner Error:", error);
            setResult("Failed to analyze image. Please ensure your API key is valid and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-300 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-800">Breed Scanner</h2>
                    <p className="text-sm text-slate-400 font-medium">Snap a photo to identify breed</p>
                </div>

                <div className="space-y-6">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors relative overflow-hidden group"
                    >
                        {image ? (
                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mx-auto mb-3 group-hover:text-blue-500 transition-colors">
                                    <Camera size={32} />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tap to Upload</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>

                    {result ? (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="font-black text-blue-800 text-lg mb-2 flex items-center gap-2">
                                <ScanLine size={18} /> Analysis Result
                            </h3>
                            <div className="text-sm text-blue-700/80 leading-relaxed space-y-2 whitespace-pre-wrap">
                                {result}
                            </div>
                            <button 
                                onClick={() => { setImage(null); setResult(null); }}
                                className="mt-4 w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-blue-50 transition-colors"
                            >
                                Scan Another
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleAnalyze}
                            disabled={!image || loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>Analyzing...</>
                            ) : (
                                <>Analyze Breed <Zap size={18} fill="currentColor" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
