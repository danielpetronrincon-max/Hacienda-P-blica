
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
      alert("¡Tema guardado! No olvides 'Generar Código' al final para publicarlo en GitHub.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        // Verificamos si la librería PDF.js está disponible
        if (!(window as any).pdfjsLib) {
          throw new Error("La librería PDF.js todavía se está cargando. Espera un segundo y vuelve a intentarlo.");
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += pageText + '\n';
        }
      } else {
        extractedText = await file.text();
      }

      if (extractedText.trim().length < 10) {
        throw new Error("El archivo parece estar vacío o no se ha podido extraer texto legible.");
      }

      onAdd(file.name.replace(/\.[^/.]+$/, ""), extractedText);
      alert(`¡Éxito! Se han importado los apuntes de: ${file.name}`);
      
    } catch (error: any) {
      console.error("Error al subir archivo:", error);
      alert(`ERROR AL SUBIR: ${error.message}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Zona de Publicación */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-700">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-3 justify-center md:justify-start">
              <i className="fas fa-cloud-upload-alt text-indigo-400"></i>
              Publicar Cambios
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-sm">
              Lo que subes aquí se guarda en tu navegador. Para que tus alumnos lo vean, pulsa el botón y actualiza el archivo <b>data.ts</b>.
            </p>
          </div>
          <button 
            onClick={() => {
              const code = `import { KnowledgeItem } from './types';\n\nexport const OFFICIAL_KNOWLEDGE: KnowledgeItem[] = ${JSON.stringify(items, null, 2)};`;
              navigator.clipboard.writeText(code);
              alert("CÓDIGO COPIADO.\n\nAhora ve a tu proyecto en local/GitHub, abre 'data.ts', borra todo y pega este nuevo contenido.");
            }}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
          >
            <i className="fas fa-code mr-2"></i> COPIAR CÓDIGO PARA GITHUB
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-5 rounded-full -mr-20 -mt-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Subir PDF */}
        <div 
          className={`bg-white border-2 border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center text-center group transition-all cursor-pointer ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-rose-500 hover:shadow-xl hover:shadow-rose-50'}`} 
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
            {isProcessing ? <i className="fas fa-spinner fa-spin text-3xl"></i> : <i className="fas fa-file-pdf text-3xl"></i>}
          </div>
          <h3 className="text-xl font-bold mb-2">Importar PDF</h3>
          <p className="text-xs text-slate-400 font-medium">Extraeré el texto de tus archivos automáticamente.</p>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" />
        </div>

        {/* Card Manual */}
        <div 
          className="bg-white border-2 border-slate-200 p-10 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer" 
          onClick={() => setIsAdding(true)}
        >
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            <i className="fas fa-keyboard text-3xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Escribir Manual</h3>
          <p className="text-xs text-slate-400 font-medium">Copia y pega texto de tus apuntes o leyes.</p>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-indigo-100 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Nuevo Tema del Curso</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-rose-500 p-2"><i className="fas fa-times"></i></button>
          </div>
          <input 
            type="text" 
            placeholder="Título del Tema (ej: Tema 1: Fallos del Mercado)" 
            className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea 
            placeholder="Pega aquí el contenido de los apuntes..." 
            rows={12}
            className="w-full p-6 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2">
            <i className="fas fa-save"></i> Guardar en mi Navegador
          </button>
        </form>
      )}

      {/* Lista de temas actuales */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Temario en Memoria ({items.length})</h3>
          <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded-md">Solo tú ves esto en modo Admin</span>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-sm italic">Todavía no has añadido ningún tema.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-center group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-bold text-xs group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                    <i className="fas fa-clock"></i> Creado: {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if(confirm('¿Estás seguro de borrar este tema?')) onDelete(item.id);
                }} 
                className="text-slate-200 hover:text-rose-500 p-3 transition-colors"
                title="Borrar tema"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
