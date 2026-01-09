
import React, { useState, useMemo, useEffect } from 'react';
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
  Users
} from 'lucide-react';

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

const Dashboard: React.FC<Props> = ({ pets, logs, tasks, onSelectPet, onAddPet, onAddTask, onToggleTask, onNavigate, userName }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Welcome Header & Progress */}
      <section className="space-y-4">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div>
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
          
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
             <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="32" 
                  cy="32" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  fill="none" 
                  className="text-slate-100" 
                />
                <circle 
                  cx="32" 
                  cy="32" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  fill="none" 
                  className="text-orange-500 transition-all duration-1000 ease-out" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={offset} 
                  strokeLinecap="round" 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-[10px] font-black text-slate-800">{completionPercentage}%</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase">Daily</span>
             </div>
          </div>
        </div>

        {/* Daily Fact Card */}
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-5 rounded-[1.5rem] shadow-lg shadow-violet-500/20 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                   <Lightbulb size={14} className="text-yellow-200" fill="currentColor" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Daily Pet Fact</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{petFact}</p>
           </div>
        </div>
      </section>

      {/* Discover / Community CTA */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-xl text-slate-800">Discover Pals</h3>
        </div>
        
        <button 
          onClick={() => onNavigate('community')}
          className="w-full bg-white border border-slate-100 p-5 rounded-[2rem] shadow-xl shadow-slate-200/40 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-orange-200"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Users size={24} />
             </div>
             <div className="text-left">
                <h4 className="font-black text-slate-800 text-lg">Connect with Community</h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Find playdates, advice & friends nearby.</p>
             </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
             <ArrowRight size={20} />
          </div>
        </button>
      </section>

      {/* My Pets Horizontal Scroll */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-bold text-xl text-slate-800">My Family</h3>
          <button onClick={() => onNavigate('pets')} className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:translate-x-1 transition-transform">
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
          {pets.map(pet => (
            <button 
              key={pet.id} 
              onClick={() => onSelectPet(pet.id)}
              className="flex-shrink-0 w-44 bg-white border border-slate-100 rounded-[2rem] p-3 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform text-left active:scale-95"
            >
              <div className="relative mb-3">
                <img src={pet.image} alt={pet.name} className="w-full h-44 object-cover rounded-[1.8rem]" />
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-black text-slate-900 shadow-sm uppercase">
                  {pet.breed.split(' ')[0]}
                </div>
              </div>
              <div className="px-2 pb-1">
                <h4 className="font-black text-slate-800 text-lg leading-tight">{pet.name}</h4>
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
            className="flex-shrink-0 w-44 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-orange-200 hover:text-orange-300 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Add Pet</span>
          </button>
        </div>
      </section>

      {/* Task List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-xl text-slate-800">Upcoming Tasks</h3>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="text-orange-500 text-xs font-black uppercase tracking-widest flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
          >
            <PlusCircle size={14} /> New Reminder
          </button>
        </div>
        
        <div className="space-y-3">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => {
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
                  className={`group flex items-center gap-4 bg-white p-5 rounded-[2rem] border transition-all ${task.completed ? 'border-slate-50 opacity-60' : 'border-slate-100 shadow-sm'}`}
                >
                  <div className={`p-4 rounded-2xl shrink-0 relative ${colorClass}`}>
                    <TypeIcon size={20} />
                    {petImg && (
                      <img 
                        src={petImg} 
                        alt={petName} 
                        className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white object-cover" 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{task.type}</span>
                      {task.isRecurring && (
                        <div className="flex items-center gap-0.5 text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          <Repeat size={8} /> {task.frequency}
                        </div>
                      )}
                    </div>
                    <h4 className={`font-bold text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>{petName}: {task.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{task.time} • {task.date === new Date().toISOString().split('T')[0] ? 'Today' : task.date}</p>
                  </div>
                  <button 
                    onClick={() => onToggleTask(task.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-300 hover:text-green-500 hover:bg-green-50'}`}
                  >
                    {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </button>
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
      <section className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/30">
            AI Assistant
          </div>
          <h3 className="text-2xl font-black leading-tight">Expert Advice Instantly</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[80%]">Get tailored care routines based on breed analysis.</p>
          <button 
            onClick={() => onNavigate('ai')}
            className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:bg-orange-500 hover:text-white transition-all"
          >
            Chat with Dr. Paw
          </button>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] -mr-12 -mt-12"></div>
      </section>

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <AddTaskModal 
          pets={pets} 
          onClose={() => setIsTaskModalOpen(false)} 
          onSubmit={(task) => { onAddTask(task); setIsTaskModalOpen(false); }} 
        />
      )}
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

  const isValid = formData.title && formData.petId;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center">
      <div className="w-full sm:w-[90%] sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300">
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
                  className={`flex items-center gap-2 pl-2 pr-4 py-2 rounded-2xl border transition-all ${formData.petId === pet.id ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
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

          <button 
            disabled={!isValid}
            onClick={() => {
              const newTask: Task = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData as Task
              };
              onSubmit(newTask);
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

export default Dashboard;
