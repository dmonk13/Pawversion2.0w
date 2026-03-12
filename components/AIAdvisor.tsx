import React, { useState, useRef, useEffect } from 'react';
import { Pet, ChatMessage } from '../types';
import { Send, Sparkles, User, Brain, Heart, Info, Camera, Bot } from 'lucide-react';

interface Props {
  pets: Pet[];
}


const getInitialMessage = (pets: Pet[]) => {
  if (pets.length === 0) {
    return "Woof! I'm your PawPal AI Expert. Add your pets to get personalized care advice!";
  }
  const petNames = pets.map(p => p.name).join(' and ');
  return `Woof! I'm your PawPal AI Expert. I have all the records for ${petNames} ready. How can I assist you with their care today?`;
};

const AIAdvisor: React.FC<Props> = ({ pets }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: 'model', content: getInitialMessage(pets) }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'model', content: getInitialMessage(pets) }]);
  }, [pets.map(p => p.id).join(',')]);

  const suggestedTopics = pets.length > 0
    ? [
        { label: 'Nutrition', icon: <Heart size={14} />, prompt: `What's the best diet for ${pets[0].name}?` },
        { label: 'Health Check', icon: <Info size={14} />, prompt: `Based on ${pets[0].name}'s age, what health checks are needed?` },
        { label: 'Training', icon: <Brain size={14} />, prompt: pets.length > 1 ? `Give me a training tip for ${pets[0].name} and ${pets[1].name}.` : `Give me a fun training tip for ${pets[0].name}.` }
      ]
    : [
        { label: 'Nutrition', icon: <Heart size={14} />, prompt: "What's the best diet for my pets?" },
        { label: 'Health Check', icon: <Info size={14} />, prompt: "What health checks should my pet have?" },
        { label: 'Training', icon: <Brain size={14} />, prompt: "Give me a fun training tip for my pet." }
      ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsLoading(true);

    try {
      const historyForApi = [...messages, { role: 'user', content: textToSend }]
        .filter((_, index) => index > 0)
        .map(m => ({ role: m.role, parts: [{ text: m.content }] }));

      const systemInstruction = pets.length > 0
        ? `You are PawPal AI, a veteran veterinarian and pet behavioral expert.
      You have access to the user's pets: ${pets.map(p => `${p.name} (${p.breed}, ${p.age}yrs)`).join(', ')}.
      Keep responses concise, warm, and professional. Always use the pet names when relevant.
      If a medical emergency is implied, urgently advise visiting a real vet.`
        : `You are PawPal AI, a veteran veterinarian and pet behavioral expert.
      The user hasn't added any pets yet. Encourage them to add their pets to get personalized advice.
      Provide general pet care tips and information. Keep responses concise, warm, and professional.
      If a medical emergency is implied, urgently advise visiting a real vet.`;

      const supabaseUrl = 'https://kumgzpriaxjzizolrlwf.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bWd6cHJpYXhqeml6b2xybHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTMxODgsImV4cCI6MjA4ODg4OTE4OH0.aln5L7K9gDvudZcfTT03qAy7LYcr_na6hNRY3A__57c';
      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          contents: historyForApi,
          config: { systemInstruction, temperature: 0.7 },
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: 'model', content: data.text || "I'm processing that. One moment!" }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting to the service. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      {/* Topics Header */}
      <div className="p-4 bg-white border-b border-slate-100 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {suggestedTopics.map((topic, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(topic.prompt)}
              className="flex-shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-[11px] font-black text-slate-700 uppercase tracking-tight active:scale-95 transition-all hover:bg-slate-100"
            >
              <span className="text-orange-500">{topic.icon}</span>
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center animate-bounce shadow-sm">
                <Brain size={14} />
              </div>
              <div className="flex gap-1.5 px-4 py-3 bg-white rounded-full border border-slate-100">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0 pb-safe">
        <div className="flex gap-2 items-center bg-slate-100 rounded-[2rem] p-1.5 pl-4 border border-slate-100 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
          <button className="text-slate-400 hover:text-orange-500 transition-colors">
            <Camera size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Dr. Paw..."
            className="flex-1 bg-transparent border-none py-2 text-sm font-medium outline-none placeholder:text-slate-400 text-slate-800"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 disabled:bg-slate-300 transition-all active:scale-90 hover:bg-orange-600"
          >
            <Send size={18} fill="currentColor" className={!input.trim() ? "ml-0" : "ml-0.5"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;