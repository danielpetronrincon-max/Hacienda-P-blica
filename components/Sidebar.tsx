
import React from 'react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  knowledgeCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, knowledgeCount }) => {
  const menuItems = [
    { id: AppMode.CONTENT, icon: 'fa-book', label: 'Contenido', color: 'text-blue-600' },
    { id: AppMode.CHAT, icon: 'fa-comments', label: 'Chat Tutor', color: 'text-indigo-600' },
    { id: AppMode.PRACTICE, icon: 'fa-pen-ruler', label: 'Ejercicios', color: 'text-emerald-600' },
    { id: AppMode.TEST, icon: 'fa-vial', label: 'Examen Test', color: 'text-amber-600' },
    { id: AppMode.SHARE, icon: 'fa-share-nodes', label: 'Compartir', color: 'text-pink-600' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          EcoMaster
        </h1>
        <p className="text-xs text-slate-500 font-medium">Hacienda Pública AI</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentMode === item.id
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <i className={`fas ${item.icon} ${currentMode === item.id ? item.color : ''}`}></i>
            <span className="font-medium">{item.label}</span>
            {item.id === AppMode.CONTENT && knowledgeCount > 0 && (
              <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {knowledgeCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-indigo-50 rounded-2xl p-4">
          <p className="text-xs text-indigo-700 font-semibold mb-1">Tip del Profesor</p>
          <p className="text-[11px] text-indigo-600 leading-relaxed">
            "Para compartir tu tutor, usa la sección de 'Compartir' y genera un pack de estudio."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
