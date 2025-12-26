import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Exercise } from "../types";

const SYSTEM_PROMPT = `Eres el "Tutor Pro de Hacienda Pública", un experto docente universitario en Economía del Sector Público.
Tu misión es ayudar a estudiantes a aprobar y entender la asignatura.

NORMAS DE RESPUESTA:
1. PRIORIDAD: Usa los apuntes subidos por el profesor si están disponibles.
2. BUSQUEDA: Si la información no está en los apuntes o necesitas datos actuales (leyes, presupuestos, noticias), usa Google Search.
3. FORMATO: Usa Markdown. Para fórmulas matemáticas usa formato claro.
4. ESTILO: Profesional, académico pero cercano. No des solo la respuesta, explica el razonamiento económico (eficiencia vs equidad).`;

// Inicialización segura para Netlify
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export async function askGemini(prompt: string, knowledgeBase: string, history: {role: 'user' | 'model', text: string}[]) {
  try {
    const ai = getAI();
    const contents = [
      ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      { 
        role: 'user', 
        parts: [{ 
          text: `CONTEXTO DE CLASE (Apuntes):\n${knowledgeBase || "Utiliza tu conocimiento general de Hacienda Pública."}\n\nPREGUNTA DEL ALUMNO: ${prompt}` 
        }] 
      }
    ] as any;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "Lo siento, no he podido procesar esa consulta.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message === "API_KEY_MISSING") {
      return { text: "⚠️ Error: No se ha configurado la API_KEY en las variables de entorno de Netlify.", sources: [] };
    }
    return { text: "Hubo un error al conectar con el Tutor IA. Por favor, revisa la conexión.", sources: [] };
  }
}

export async function generateQuiz(knowledgeBase: string): Promise<QuizQuestion[]> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Genera 5 preguntas de examen tipo test sobre este material:\n${knowledgeBase}` }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Quiz Error:", e);
    return [];
  }
}

export async function generateExercise(knowledgeBase: string): Promise<Exercise> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Crea un problema numérico de Hacienda Pública basado en esto:\n${knowledgeBase}` }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            statement: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            solution: { type: Type.STRING }
          },
          required: ["title", "statement", "steps", "solution"]
        }
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Exercise Error:", e);
    return { title: "Error", statement: "No se pudo generar el ejercicio", steps: [], solution: "" };
  }
}