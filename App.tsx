
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import KnowledgeBase from './components/KnowledgeBase';
import ChatInterface from './components/ChatInterface';
import QuizMode from './components/QuizMode';
import ExerciseMode from './components/ExerciseMode';
import { AppMode, KnowledgeItem } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CONTENT);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);

  const fullKnowledgeText = useMemo(() => {
    return knowledge.map(k => `Tema: ${k.title}\n${k.content}`).join('\n\n---\n\n');
  }, [knowledge]);

  const addKnowledge = (title: string, content: string) => {
    const newItem: KnowledgeItem = {
      id: crypto.randomUUID(),
      title,
      content,
      timestamp: Date.now()
    };
    setKnowledge(prev => [newItem, ...prev]);
  };

  const deleteKnowledge = (id: string) => {
    setKnowledge(prev => prev.filter(k => k.id !== id));
  };

  const importKnowledge = (items: KnowledgeItem[]) => {
    // Evitar duplicados por ID si se importa varias veces
    setKnowledge(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newItems = items.filter(item => !existingIds.has(item.id));
      return [...newItems, ...prev];
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        knowledgeCount={knowledge.length}
      />
      
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Panel de Estudiante
            </span>
            <h2 className="text-3xl font-bold text-slate-800">
              {mode === AppMode.CONTENT && "Gestión de Materiales"}
              {mode === AppMode.CHAT && "Consultas al Tutor"}
              {mode === AppMode.PRACTICE && "Resolución de Casos"}
              {mode === AppMode.TEST && "Entrenamiento Tipo Test"}
              {mode === AppMode.SHARE && "Cómo compartir con Alumnos"}
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <i className="fas fa-university text-indigo-400"></i>
            <span className="font-medium">Hacienda Pública I</span>
          </div>
        </header>

        <div className="relative animate-fade-in">
          {mode === AppMode.CONTENT && (
            <KnowledgeBase 
              items={knowledge} 
              onAdd={addKnowledge} 
              onDelete={deleteKnowledge} 
              onImport={importKnowledge}
            />
          )}
          
          {mode === AppMode.CHAT && (
            <ChatInterface knowledgeBase={fullKnowledgeText} />
          )}

          {mode === AppMode.TEST && (
            <QuizMode knowledgeBase={fullKnowledgeText} />
          )}

          {mode === AppMode.PRACTICE && (
            <ExerciseMode knowledgeBase={fullKnowledgeText} />
          )}

          {mode === AppMode.SHARE && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">¿Cómo compartir este tutor?</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Tienes dos formas de hacer que tus alumnos utilicen esta herramienta con tus materiales:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-file-export"></i>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Opción A: El Pack de Estudio</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      1. Ve a <strong>Contenido</strong> y pulsa <strong>Exportar Pack</strong>.<br/>
                      2. Envía el archivo resultante (.json) a tus alumnos por el campus virtual.<br/>
                      3. Los alumnos deben pulsar <strong>Importar Pack</strong> y subir tu archivo.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-cloud-arrow-up"></i>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Opción B: Despliegue Web</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Si quieres que la web sea accesible para todos por URL, puedes desplegar este código en 
                      plataformas gratuitas como <strong>Vercel</strong> o <strong>Netlify</strong>. Solo necesitas subir la carpeta a un repositorio de GitHub.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
                  <i className="fas fa-triangle-exclamation text-amber-500 mt-1"></i>
                  <div>
                    <h5 className="font-bold text-amber-800 text-sm">Privacidad y Claves</h5>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Recuerda que esta aplicación utiliza una API Key. Si compartes la URL pública, asegúrate de controlar el uso. El material que exportas en el pack de estudio se guarda localmente en el navegador de cada alumno, no en un servidor central.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-1/3 bg-indigo-50 rounded-full blur-[120px] opacity-50"></div>
      <div className="fixed bottom-0 left-64 -z-10 w-1/4 h-1/4 bg-blue-50 rounded-full blur-[120px] opacity-50"></div>
    </div>
  );
};

export default App;
