
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
      const ex = await generateExercise(knowledgeBase);
      setExercise(ex);
    } catch (e) {
      alert("Error al generar el ejercicio.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-slate-700">Calculando supuestos...</h3>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-xl text-center border border-slate-200">
        <i className="fas fa-square-root-variable text-emerald-500 text-5xl mb-6"></i>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Práctica de Resolución</h2>
        <p className="text-slate-600 mb-8">
          Generaré un caso práctico (externalidades, impuestos, excedentes) basado en tus apuntes para que lo resuelvas paso a paso.
        </p>
        <button
          onClick={createExercise}
          disabled={knowledgeBase.length < 50}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
            knowledgeBase.length < 50
            ? 'bg-slate-300'
            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {knowledgeBase.length < 50 ? 'Carga material primero' : 'Generar Caso Práctico'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Caso Práctico
          </span>
          <button onClick={createExercise} className="text-slate-400 hover:text-emerald-600 transition-colors">
            <i className="fas fa-sync-alt mr-2"></i> Generar otro
          </button>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{exercise.title}</h2>
        <div className="prose prose-slate max-w-none text-slate-700 bg-slate-50 p-6 rounded-2xl mb-8 leading-relaxed whitespace-pre-wrap italic border border-slate-100">
          {exercise.statement}
        </div>

        <h4 className="font-bold text-slate-800 mb-4 flex items-center">
          <i className="fas fa-list-ol mr-2 text-indigo-500"></i> Pasos para la resolución:
        </h4>
        <ul className="space-y-3 mb-10">
          {exercise.steps.map((step, i) => (
            <li key={i} className="flex items-start space-x-3 text-slate-600 text-sm">
              <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>

        {!showSolution ? (
          <button
            onClick={() => setShowSolution(true)}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            <i className="fas fa-eye"></i> Revelar Solución Detallada
          </button>
        ) : (
          <div className="animate-fade-in">
            <div className="h-px bg-slate-100 mb-8"></div>
            <h4 className="font-bold text-emerald-700 mb-4 flex items-center">
              <i className="fas fa-check-double mr-2"></i> Solución del Profesor:
            </h4>
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-emerald-900 leading-relaxed whitespace-pre-wrap">
              {exercise.solution}
            </div>
            <button
              onClick={() => setShowSolution(false)}
              className="mt-6 text-emerald-600 font-semibold text-sm hover:underline"
            >
              Ocultar solución
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseMode;
