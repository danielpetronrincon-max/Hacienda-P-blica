
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
      const qs = await generateQuiz(knowledgeBase);
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
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-slate-700">Preparando examen...</h3>
        <p className="text-slate-500">Analizando el material para crear preguntas desafiantes.</p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-xl text-center border border-slate-200">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className={`fas ${percentage >= 70 ? 'fa-award' : 'fa-redo'} text-4xl text-amber-600`}></i>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Test Finalizado!</h2>
        <p className="text-slate-500 mb-8">Has completado tu autoevaluación de Hacienda Pública.</p>
        
        <div className="flex justify-center space-x-12 mb-10">
          <div>
            <div className="text-4xl font-bold text-indigo-600">{score}/{questions.length}</div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Aciertos</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-600">{percentage}%</div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Puntuación</div>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          Repetir con nuevas preguntas
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-xl text-center border border-slate-200">
        <i className="fas fa-file-signature text-amber-500 text-5xl mb-6"></i>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">¿Preparado para el examen?</h2>
        <p className="text-slate-600 mb-8">
          Generaré 5 preguntas tipo test basadas en el material que has subido.
        </p>
        <button
          onClick={startQuiz}
          disabled={knowledgeBase.length < 100}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
            knowledgeBase.length < 100 
            ? 'bg-slate-300 cursor-not-allowed' 
            : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
          }`}
        >
          {knowledgeBase.length < 100 ? 'Añade más contenido primero' : 'Comenzar Test Ahora'}
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
        <span className="text-sm font-bold text-slate-500">Pregunta {currentIdx + 1} de {questions.length}</span>
        <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-300" 
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-8 leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let bgColor = 'bg-slate-50 border-slate-200 hover:border-amber-400';
            let textColor = 'text-slate-700';
            let icon = null;

            if (selectedAnswer !== null) {
              if (idx === currentQ.correctAnswerIndex) {
                bgColor = 'bg-emerald-50 border-emerald-500';
                textColor = 'text-emerald-700';
                icon = <i className="fas fa-check-circle ml-auto"></i>;
              } else if (idx === selectedAnswer) {
                bgColor = 'bg-red-50 border-red-500';
                textColor = 'text-red-700';
                icon = <i className="fas fa-times-circle ml-auto"></i>;
              } else {
                bgColor = 'bg-slate-50 border-slate-100 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={`w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-200 ${bgColor} ${textColor}`}
              >
                <span className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center font-bold mr-4 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-medium">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-fade-in">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center">
              <i className="fas fa-lightbulb mr-2"></i> Explicación del Profesor
            </h4>
            <p className="text-blue-700 text-sm leading-relaxed">{currentQ.explanation}</p>
            <button
              onClick={handleNext}
              className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800"
            >
              {currentIdx === questions.length - 1 ? 'Ver Resultado Final' : 'Siguiente Pregunta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMode;
