
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Info } from 'lucide-react';
import { getAIAssistantResponse } from '../services/geminiService';
import { Student, AttendanceRecord, ChatMessage } from '../types';

interface AIAssistantProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ students, attendance }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm your Tasky AI Assistant. I can help you analyze student performance, identify trends, and automate your workflow. What can I do for you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Get current date to help AI understand "today", "yesterday", etc.
      const today = new Date().toISOString().split('T')[0];
      const response = await getAIAssistantResponse(input, { 
        students, 
        attendance, 
        currentDate: today 
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response || "I processed your request but couldn't generate a clear response. Please try again.", 
        timestamp: new Date() 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting to the intelligence engine right now. Please verify your connection.", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 h-full flex flex-col max-w-5xl mx-auto pb-24">
      <div className="mb-10 px-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Assistant</h1>
      </div>

      <div className="flex-1 min-h-[500px] bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${
                  msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {msg.role === 'user' ? 'ME' : 'AI'}
                </div>
                <div className={`p-6 rounded-[2rem] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-blue-600/10' 
                    : 'bg-slate-50 text-slate-800 border border-slate-100'
                }`}>
                  <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-slate-50 px-6 py-4 rounded-full flex gap-2 border border-slate-100 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 md:p-8 bg-white border-t border-slate-50 shrink-0">
          <div className="flex items-center gap-3 bg-slate-50 p-2 pl-6 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-blue-600/5 transition-all">
            <input 
              type="text" 
              placeholder="Ask about today's absentees, trends, or stats..." 
              className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 py-3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-slate-900 text-white p-3.5 rounded-xl hover:scale-105 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
