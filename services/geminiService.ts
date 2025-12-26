
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Exercise } from "../types";

const SYSTEM_PROMPT = `Eres el "Tutor Pro de Hacienda Pública", un experto docente universitario en Economía del Sector Público.
Tu misión es ayudar a estudiantes a aprobar y entender la asignatura.

NORMAS DE RESPUESTA:
1. PRIORIDAD: Usa los apuntes subidos por el profesor si están disponibles.
2. BUSQUEDA: Si la información no está en los apuntes o necesitas datos actuales (leyes, presupuestos, noticias), usa Google Search.
3. FORMATO: Usa Markdown. Para fórmulas matemáticas usa formato claro (ej: Q = 100 - 2P).
4. ESTILO: Profesional, académico pero cercano. No des solo la respuesta, explica el razonamiento económico (eficiencia vs equidad).`;

const getAI = () => {
  // En Netlify/Vercel la API_KEY suele venir en process.env.API_KEY
  // Intentamos obtenerla de varias fuentes comunes
  const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY no encontrada en el entorno. Asegúrate de configurar la variable de entorno API_KEY en Netlify.");
  }
  
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export async function askGemini(prompt: string, knowledgeBase: string, history: {role: string, text: string}[]) {
  try {
    const ai = getAI();
    const contents = [
      ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
      { 
        role: 'user', 
        parts: [{ 
          text: `CONTEXTO DE CLASE (Apuntes del profesor):\n${knowledgeBase || "No hay apuntes específicos subidos."}\n\nPREGUNTA DEL ALUMNO: ${prompt}` 
        }] 
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "No he podido generar una respuesta.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { text: `Lo siento, hay un problema con la conexión al tutor: ${error.message}. Por favor, verifica la configuración de la API Key.`, sources: [] };
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
      contents: [{ role: 'user', parts: [{ text: `Crea un problema numérico de Hacienda Pública (ej: cálculo de impuesto, pérdida de eficiencia, o equilibrio con externalidad) basado en esto:\n${knowledgeBase}` }] }],
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
