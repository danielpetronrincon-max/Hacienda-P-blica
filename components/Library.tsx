
import React from 'react';
import { KnowledgeItem } from '../types';

interface LibraryProps {
  items: KnowledgeItem[];
  isAdmin: boolean;
  onAddClick: () => void;
}

const Library: React.FC<LibraryProps> = ({ items, isAdmin, onAddClick }) => {
  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdmin && (
          <button 
            onClick={onAddClick}
            className="bg-white border-2 border-dashed border-indigo-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-indigo-500 hover:bg-indigo-50 transition-all min-h-[300px]"
          >
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-plus text-2xl"></i>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-indigo-900">Subir Nuevos Apuntes</h3>
              <p className="text-xs text-indigo-400 font-medium px-4">Haz click aquí para añadir archivos PDF o texto manual al curso.</p>
            </div>
          </button>
        )}

        {items.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all group relative overflow-hidden">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all rotate-3 group-hover:rotate-0">
              <i className="fas fa-book text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
              {item.title}
            </h3>
            <div className="text-slate-500 text-sm leading-relaxed line-clamp-4 mb-8 italic">
              {item.content}
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Contenido Oficial</span>
              <button className="text-indigo-600 font-bold text-xs flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                DETALLES <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !isAdmin && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
           <i className="fas fa-lock text-slate-200 text-6xl mb-6"></i>
           <h3 className="text-2xl font-bold text-slate-400">No hay temas publicados todavía</h3>
        </div>
      )}
    </div>
  );
};

export default Library;
