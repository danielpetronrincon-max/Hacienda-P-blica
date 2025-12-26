
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
  const packInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onAdd(title, content);
      setTitle('');
      setContent('');
      setIsAdding(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let extractedText = '';
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else {
        extractedText = await file.text();
      }

      if (extractedText.trim()) {
        onAdd(file.name.replace(/\.[^/.]+$/, ""), extractedText);
      } else {
        alert("No se pudo extraer texto del archivo.");
      }
    } catch (error) {
      console.error("Error procesando archivo:", error);
      alert("Error al procesar el archivo.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const exportPack = () => {
    if (items.length === 0) return;
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'pack-hacienda-publica.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportPack = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedItems = JSON.parse(text) as KnowledgeItem[];
      if (Array.isArray(importedItems)) {
        onImport(importedItems);
        alert("¡Pack de estudio cargado con éxito!");
      }
    } catch (error) {
      alert("Error al importar el archivo. Asegúrate de que es un pack válido de EcoMaster.");
    } finally {
      if (packInputRef.current) packInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mi Base de Conocimiento</h2>
          <p className="text-slate-500">Gestiona los materiales que el tutor utilizará.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPack}
            disabled={items.length === 0}
            className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40"
            title="Exportar material para tus alumnos"
          >
            <i className="fas fa-file-export"></i>
            Exportar Pack
          </button>
          <input
            type="file"
            ref={packInputRef}
            onChange={handleImportPack}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => packInputRef.current?.click()}
            className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
            title="Importar material del profesor"
          >
            <i className="fas fa-file-import"></i>
            Importar Pack
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-8 flex justify-between items-center">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 font-medium"
          >
            <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
            {isProcessing ? 'Procesando...' : 'Subir PDF/Texto'}
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 font-medium"
          >
            <i className={`fas ${isAdding ? 'fa-times' : 'fa-plus'}`}></i>
            {isAdding ? 'Cerrar' : 'Añadir Manualmente'}
          </button>
        </div>
        <div className="text-xs text-slate-400 italic">
          {items.length} temas cargados en la memoria del tutor
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Título del tema</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Externalidades y Bienes Públicos"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contenido (Texto)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pega aquí el contenido de tus apuntes..."
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            Guardar Material
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-folder-open text-slate-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-600">Sin materiales</h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            Sube el programa de la asignatura para empezar a trabajar con el tutor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm group animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <i className="fas fa-file-lines text-indigo-400 shrink-0"></i>
                  <h4 className="font-bold text-slate-800 truncate" title={item.title}>{item.title}</h4>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              <p className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed">{item.content}</p>
              <div className="flex items-center text-[10px] text-slate-400 font-medium">
                <i className="far fa-calendar-alt mr-1"></i>
                Añadido: {new Date(item.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
