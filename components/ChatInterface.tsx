
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { askGemini } from '../services/geminiService';

interface ChatInterfaceProps {
  knowledgeBase: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ knowledgeBase }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Bienvenido al seminario de Hacienda Pública! Soy tu tutor. ¿Qué concepto quieres que analicemos hoy?' }
  ]);
  const [sources, setSources] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askGemini(input, knowledgeBase, messages);
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
      if (result.sources && result.sources.length > 0) {
        setSources(prev => [...prev, ...result.sources]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error de conexión con el servidor educativo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
      <div className="bg-slate-900 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
            <i className="fas fa-graduation-cap text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-white font-bold">Tutor Inteligente de Economía</h3>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Basado en Gemini 3 Pro + Google Search</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
              <span className="text-xs font-bold text-slate-400 italic">Consultando fuentes académicas y Google...</span>
            </div>
          </div>
        )}
      </div>

      {sources.length > 0 && (
        <div className="bg-indigo-50 px-8 py-3 border-t border-indigo-100 flex gap-4 overflow-x-auto no-scrollbar">
           <span className="text-[10px] font-black text-indigo-400 uppercase mt-1 shrink-0">Fuentes:</span>
           {sources.map((s, i) => s.web?.uri && (
             <a key={i} href={s.web.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-white border border-indigo-200 px-3 py-1 rounded-full text-indigo-600 font-bold whitespace-nowrap hover:bg-indigo-600 hover:text-white transition-colors">
               <i className="fas fa-external-link-alt mr-1"></i> {s.web.title || 'Ver fuente'}
             </a>
           ))}
        </div>
      )}

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex items-center gap-4 bg-slate-100 p-2 pl-6 rounded-3xl border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre impuestos, fallos de mercado, deuda pública..."
            className="flex-1 bg-transparent py-4 outline-none text-slate-700 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() && !isLoading ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 rotate-0' : 'bg-slate-300 text-slate-400 rotate-12'
            }`}
          >
            <i className="fas fa-paper-plane text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
