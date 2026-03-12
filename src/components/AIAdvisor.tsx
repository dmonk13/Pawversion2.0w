
import React, { useState, useRef, useEffect } from 'react';
import { Pet, ChatMessage } from '../types';
import { Send, Sparkles, User, Brain, Heart, Info, Camera, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  pets: Pet[];
}

const AIAdvisor: React.FC<Props> = ({ pets }) => {
  const getInitialMessage = () => {
    if (pets.length === 0) {
      return "Woof! I'm your PawPal AI Expert. Add your pets to get personalized care advice!";
    }
    const petNames = pets.map(p => p.name).join(' and ');
    return `Woof! I'm your PawPal AI Expert. I have all the records for ${petNames} ready. How can I assist you with their care today?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: getInitialMessage() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedTopics = [
    { label: 'Nutrition', icon: <Heart size={14} />, prompt: "What's the best diet for my pets?" },
    { label: 'Health Check', icon: <Info size={14} />, prompt: "Based on their age, what health checks do my pets need?" },
    { label: 'Training', icon: <Brain size={14} />, prompt: "Give me a fun training tip." }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages([{ role: 'model', content: getInitialMessage() }]);
  }, [pets.length, pets.map(p => p.id).join(',')]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    // Optimistically add user message
    const newMessages = [...messages, { role: 'user', content: textToSend } as ChatMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      // Filter history to ensure it complies with API requirements (starts with user)
      // We skip the very first welcome message from the model context if it's purely UI
      // We map the messages state to the format required by the API.
      const historyForApi = newMessages
        .filter((_, index) => index > 0) // Skip initial welcome message
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const systemInstruction = pets.length > 0
        ? `You are PawPal AI, a veteran veterinarian and pet behavioral expert.
      You have access to the user's pets: ${pets.map(p => `${p.name} (${p.breed}, ${p.age}yrs)`).join(', ')}.
      Keep responses concise, warm, and professional. Always use the pet names when relevant.
      If a medical emergency is implied, urgently advise visiting a real vet.`
        : `You are PawPal AI, a veteran veterinarian and pet behavioral expert.
      The user hasn't added any pets yet. Encourage them to add their pets to get personalized advice.
      Provide general pet care tips and information. Keep responses concise, warm, and professional.
      If a medical emergency is implied, urgently advise visiting a real vet.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: historyForApi,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const responseText = response.text || "I'm having trouble thinking right now. Please try again.";
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting to the service. Please check your internet connection and try again." }]);
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
