
import React from 'react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, isAdmin }) => {
  const menuItems = [
    { id: AppMode.CHAT, icon: 'fa-robot', label: 'Tutor IA', color: 'text-indigo-500' },
    { id: AppMode.CONTENT, icon: 'fa-book', label: 'Temario', color: 'text-blue-500' },
    { id: AppMode.PRACTICE, icon: 'fa-pen-ruler', label: 'Ejercicios', color: 'text-emerald-500' },
    { id: AppMode.TEST, icon: 'fa-graduation-cap', label: 'Auto-Test', color: 'text-amber-500' },
  ];

  return (
    <div className="w-64 h-screen bg-white flex flex-col fixed left-0 top-0 z-50 border-r border-slate-200">
      <div className="p-10">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
          EcoMaster<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hacienda Pública</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-bold text-sm ${
              currentMode === item.id
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {isAdmin && (
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setMode(AppMode.ADMIN)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-bold text-sm ${
              currentMode === AppMode.ADMIN ? 'bg-red-50 text-red-600' : 'text-slate-400'
            }`}
          >
            <i className="fas fa-tools"></i>
            <span>Configuración</span>
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="bg-slate-900 rounded-2xl p-5 text-white">
          <p className="text-[10px] font-black opacity-50 uppercase mb-3 tracking-widest text-indigo-400">Universidad</p>
          <p className="text-xs font-medium leading-relaxed italic">"La economía es el estudio de la humanidad en los asuntos ordinarios de la vida."</p>
          <p className="text-[9px] mt-2 font-bold opacity-40">— Alfred Marshall</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
