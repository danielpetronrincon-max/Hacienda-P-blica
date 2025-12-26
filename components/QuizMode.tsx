
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizModeProps {
  knowledgeBase: string;
}

const QuizMode: React.FC<QuizModeProps> = ({ knowledgeBase }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      // Si no hay temario, le pasamos una instrucción para que use conocimiento general de Hacienda Pública
      const context = knowledgeBase.length > 50 ? knowledgeBase : "Genera preguntas generales sobre Hacienda Pública: Fallos del mercado, Bienes públicos, Externalidades, Presupuestos y Déficit.";
      const qs = await generateQuiz(context);
      setQuestions(qs);
      setCurrentIdx(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
      setIsFinished(false);
    } catch (error) {
      alert("Error generando el test. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === questions[currentIdx].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-slate-700">Diseñando tu examen...</h3>
        <p className="text-slate-400 text-sm mt-2">Analizando conceptos clave para evaluarte.</p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100 animate-fade-in">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${percentage >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          <i className={`fas ${percentage >= 70 ? 'fa-check-double' : 'fa-redo-alt'} text-4xl`}></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Evaluación Completada</h2>
        <p className="text-slate-500 mb-10">Tu rendimiento ha sido analizado por el Tutor IA.</p>
        
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="bg-slate-50 p-6 rounded-3xl">
            <div className="text-4xl font-black text-slate-900">{score}/{questions.length}</div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Aciertos</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl">
            <div className="text-4xl font-black text-indigo-600">{percentage}%</div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Nota Final</div>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl"
        >
          REINTENTAR EXAMEN
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
          <i className="fas fa-file-signature text-3xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Simulacro de Examen</h2>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Generaré un test aleatorio basado en el temario del curso para prepararte para el examen final de la universidad.
        </p>
        <button
          onClick={startQuiz}
          className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
        >
          EMPEZAR TEST AHORA
        </button>
        {knowledgeBase.length < 100 && (
          <p className="mt-4 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            * Nota: Usando base de datos general de Hacienda Pública
          </p>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex justify-between items-center bg-white px-8 py-5 rounded-2xl shadow-sm border border-slate-100">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pregunta {currentIdx + 1} de {questions.length}</span>
        <div className="w-48 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
          <div 
            className="h-full bg-amber-500 transition-all duration-500" 
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-10 leading-snug">
          {currentQ.question}
        </h3>

        <div className="space-y-4">
          {currentQ.options.map((option, idx) => {
            let bgColor = 'bg-slate-50 border-slate-100 hover:border-amber-300 hover:bg-white';
            let textColor = 'text-slate-700';
            let icon = null;

            if (selectedAnswer !== null) {
              if (idx === currentQ.correctAnswerIndex) {
                bgColor = 'bg-emerald-50 border-emerald-500 text-emerald-700';
                icon = <i className="fas fa-check-circle text-lg"></i>;
              } else if (idx === selectedAnswer) {
                bgColor = 'bg-rose-50 border-rose-500 text-rose-700';
                icon = <i className="fas fa-times-circle text-lg"></i>;
              } else {
                bgColor = 'bg-slate-50 border-slate-50 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${bgColor}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${selectedAnswer !== null ? 'bg-transparent' : 'bg-white shadow-sm text-slate-400 group-hover:text-amber-500'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-bold">{option}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-10 p-8 bg-indigo-50 border border-indigo-100 rounded-3xl animate-fade-in">
            <h4 className="font-black text-indigo-900 text-xs mb-3 flex items-center gap-2 tracking-widest uppercase">
              <i className="fas fa-info-circle"></i> Justificación Académica
            </h4>
            <p className="text-indigo-800 text-sm leading-relaxed font-medium italic mb-8">{currentQ.explanation}</p>
            <button
              onClick={handleNext}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
            >
              {currentIdx === questions.length - 1 ? 'Finalizar Evaluación' : 'Siguiente Pregunta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMode;
