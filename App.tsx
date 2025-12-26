import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Library from './components/Library';
import ChatInterface from './components/ChatInterface';
import QuizMode from './components/QuizMode';
import ExerciseMode from './components/ExerciseMode';
import KnowledgeBase from './components/KnowledgeBase';
import { AppMode, KnowledgeItem } from './types';
import { OFFICIAL_KNOWLEDGE } from './data';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [localKnowledge, setLocalKnowledge] = useState<KnowledgeItem[]>(() => {
    const saved = localStorage.getItem('eco_master_admin_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : OFFICIAL_KNOWLEDGE;
      } catch (e) {
        return OFFICIAL_KNOWLEDGE;
      }
    }
    return OFFICIAL_KNOWLEDGE;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || localStorage.getItem('eco_admin_session') === 'active') {
      setIsAdmin(true);
      if (params.get('admin') === 'true') localStorage.setItem('eco_admin_session', 'active');
    }
  }, []);

  const currentKnowledge = useMemo(() => {
    // Si hay datos locales (subidos por el usuario en su navegador), los usamos.
    // Si no, usamos los oficiales definidos en data.ts.
    return localKnowledge.length > 0 ? localKnowledge : OFFICIAL_KNOWLEDGE;
  }, [localKnowledge]);

  const fullText = useMemo(() => {
    return currentKnowledge.map(k => `TEMA: ${k.title}\nCONTENIDO: ${k.content}`).join('\n\n---\n\n');
  }, [currentKnowledge]);

  const toggleAdmin = () => {
    const newState = !isAdmin;
    setIsAdmin(newState);
    if (newState) {
      localStorage.setItem('eco_admin_session', 'active');
    } else {
      localStorage.removeItem('eco_admin_session');
      setMode(AppMode.CHAT);
    }
  };

  const handleAddKnowledge = (title: string, content: string) => {
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title,
      content,
      timestamp: Date.now()
    };
    const updated = [newItem, ...localKnowledge];
    setLocalKnowledge(updated);
    localStorage.setItem('eco_master_admin_data', JSON.stringify(updated));
  };

  const handleDeleteKnowledge = (id: string) => {
    const updated = localKnowledge.filter(k => k.id !== id);
    setLocalKnowledge(updated);
    localStorage.setItem('eco_master_admin_data', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 ml-64 p-10 max-w-7xl mx-auto pb-24">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-sm ${isAdmin ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
              {isAdmin ? 'ADMINISTRACIÓN' : 'ESTUDIANTE'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {mode === AppMode.CHAT && "Tutor Personal de Hacienda"}
            {mode === AppMode.CONTENT && "Biblioteca del Curso"}
            {mode === AppMode.TEST && "Entrenamiento de Examen"}
            {mode === AppMode.PRACTICE && "Taller Numérico"}
            {mode === AppMode.ADMIN && "Panel de Gestión"}
          </h1>
        </header>

        <div className="animate-fade-in">
          {mode === AppMode.CONTENT && (
            <Library 
              items={currentKnowledge} 
              isAdmin={isAdmin} 
              onAddClick={() => setMode(AppMode.ADMIN)} 
            />
          )}
          {mode === AppMode.CHAT && <ChatInterface knowledgeBase={fullText} />}
          {mode === AppMode.TEST && <QuizMode knowledgeBase={fullText} />}
          {mode === AppMode.PRACTICE && <ExerciseMode knowledgeBase={fullText} />}
          {mode === AppMode.ADMIN && (
            <KnowledgeBase 
              items={localKnowledge} 
              onAdd={handleAddKnowledge} 
              onDelete={handleDeleteKnowledge}
              onImport={(items) => {
                setLocalKnowledge(items);
                localStorage.setItem('eco_master_admin_data', JSON.stringify(items));
              }}
            />
          )}
        </div>
      </main>

      <button 
        onClick={toggleAdmin}
        className="fixed bottom-6 right-6 w-12 h-12 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-[100]"
        title={isAdmin ? "Salir de Admin" : "Acceso Profesor"}
      >
        <i className={`fas ${isAdmin ? 'fa-user-graduate' : 'fa-user-tie'}`}></i>
      </button>
    </div>
  );
};

export default App;