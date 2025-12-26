
import React, { useState } from 'react';
import { Exercise } from '../types';
import { generateExercise } from '../services/geminiService';

interface ExerciseModeProps {
  knowledgeBase: string;
}

const ExerciseMode: React.FC<ExerciseModeProps> = ({ knowledgeBase }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const createExercise = async () => {
    setIsLoading(true);
    setShowSolution(false);
    try {
      const context = knowledgeBase.length > 50 ? knowledgeBase : "Crea un ejercicio numérico de Hacienda Pública sobre oferta y demanda con impuestos, pérdida de eficiencia social o externalidades.";
      const ex = await generateExercise(context);
      setExercise(ex);
    } catch (e) {
      alert("Error al generar el ejercicio. Prueba de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-black text-slate-700 tracking-tight">Preparando Caso Práctico...</h3>
        <p className="text-slate-400 text-sm mt-2">Planteando supuestos económicos y ecuaciones.</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 -rotate-3">
          <i className="fas fa-calculator text-3xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Taller de Prácticas</h2>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Resuelve problemas numéricos reales de la asignatura. Ideal para practicar el cálculo de excedentes, impuestos y fallos de mercado.
        </p>
        <button
          onClick={createExercise}
          className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          GENERAR NUEVO EJERCICIO
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
            Resolución de Problemas
          </span>
          <button onClick={createExercise} className="text-slate-300 hover:text-emerald-600 transition-colors p-2">
            <i className="fas fa-sync-alt mr-2"></i> Cambiar Caso
          </button>
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{exercise.title}</h2>
        
        <div className="bg-slate-900 text-emerald-400 p-8 rounded-3xl mb-10 font-mono text-sm leading-relaxed border-l-8 border-emerald-500 shadow-inner">
          <p className="whitespace-pre-wrap">{exercise.statement}</p>
        </div>

        <div className="mb-12">
          <h4 className="font-black text-slate-900 text-xs mb-6 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-tasks text-emerald-500"></i> ¿Qué debes calcular?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercise.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="w-6 h-6 bg-white shadow-sm rounded-lg flex items-center justify-center text-[10px] font-black text-emerald-600 shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-700 text-xs font-bold leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {!showSolution ? (
          <button
            onClick={() => setShowSolution(true)}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <i className="fas fa-lightbulb"></i> VER SOLUCIÓN PASO A PASO
          </button>
        ) : (
          <div className="animate-fade-in bg-emerald-50 border-2 border-emerald-100 p-10 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-emerald-700 text-xs uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Respuesta del Tutor
              </h4>
              <button 
                onClick={() => setShowSolution(false)}
                className="text-emerald-400 hover:text-emerald-600 text-xs font-bold"
              >
                OCULTAR
              </button>
            </div>
            <div className="text-emerald-900 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {exercise.solution}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseMode;
