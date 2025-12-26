
import React, { useState, useRef } from 'react';
import { KnowledgeItem } from '../types';

interface KnowledgeBaseProps {
  items: KnowledgeItem[];
  onAdd: (title: string, content: string) => void;
  onDelete: (id: string) => void;
  onImport: (items: KnowledgeItem[]) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ items, onAdd, onDelete, onImport }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onAdd(title, content);
      setTitle('');
      setContent('');
      setIsAdding(false);
      alert("¡Tema añadido correctamente!");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let extractedText = '';
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } else {
        extractedText = await file.text();
      }

      if (extractedText.trim()) {
        onAdd(file.name.replace(/\.[^/.]+$/, ""), extractedText);
        alert(`¡Éxito! Archivo "${file.name}" procesado y subido.`);
      }
    } catch (error) {
      alert("Error al leer el archivo. Asegúrate de que no tenga contraseña.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Panel de Control de Publicación */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black mb-2">Publicar Cambios</h2>
            <p className="text-slate-400 text-xs font-medium max-w-sm">
              Cuando termines de subir tus temas aquí abajo, copia los datos y pégalos en el archivo <b>data.ts</b> de tu proyecto en GitHub.
            </p>
          </div>
          <button 
            onClick={() => {
              const code = `import { KnowledgeItem } from './types';\n\nexport const OFFICIAL_KNOWLEDGE: KnowledgeItem[] = ${JSON.stringify(items, null, 2)};`;
              navigator.clipboard.writeText(code);
              alert("CÓDIGO COPIADO.\n\nPégalo en 'data.ts' para que tus alumnos vean los cambios.");
            }}
            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl"
          >
            <i className="fas fa-copy mr-2"></i> GENERAR CÓDIGO GITHUB
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full -mr-20 -mt-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Botón Subir PDF */}
        <div className="bg-white border-2 border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-rose-500 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
            {isProcessing ? <i className="fas fa-spinner fa-spin text-3xl"></i> : <i className="fas fa-file-pdf text-3xl"></i>}
          </div>
          <h3 className="text-xl font-bold mb-2">Subir PDF</h3>
          <p className="text-xs text-slate-400 font-medium">Extrae automáticamente el texto de tus apuntes.</p>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" />
        </div>

        {/* Botón Escribir Manual */}
        <div className="bg-white border-2 border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-indigo-500 transition-all cursor-pointer" onClick={() => setIsAdding(true)}>
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            <i className="fas fa-keyboard text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Escribir a Mano</h3>
          <p className="text-xs text-slate-400 font-medium">Copia y pega fragmentos de texto directamente.</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-indigo-100 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Nuevo Material</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-rose-500"><i className="fas fa-times"></i></button>
          </div>
          <input 
            type="text" 
            placeholder="Título (Ej: Tema 1: Teoría del Gasto Público)" 
            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea 
            placeholder="Contenido de los apuntes..." 
            rows={10}
            className="w-full p-6 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg">
            GUARDAR TEMA EN MEMORIA
          </button>
        </form>
      )}

      {/* Lista de temas actuales */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-4">Materiales en Memoria ({items.length})</h3>
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs">{item.title.substring(0,2).toUpperCase()}</div>
              <div>
                <h4 className="font-bold text-slate-800">{item.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Última edición: {new Date(item.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-rose-500 p-3 transition-colors">
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;
