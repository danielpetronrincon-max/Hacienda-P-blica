
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Exercise } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const SYSTEM_PROMPT = `Eres un Profesor Experto en Economía Pública y Hacienda Pública de nivel universitario. 
Tu objetivo es ayudar a los estudiantes a comprender conceptos fundamentales y avanzados.
Dominas temas como:
1. Fallos de mercado: Externalidades (impuestos pigouvianos, Teorema de Coase), Bienes Públicos, Información Asimétrica.
2. Teoría de la Elección Pública (Arrow, Median Voter).
3. Gasto Público: Educación, Sanidad, Pensiones.
4. Ingresos Públicos: Principios impositivos, incidencia fiscal, eficiencia vs equidad, curvas de Laffer.
5. Federalismo Fiscal y Déficit Público.

Cuando respondas dudas, sé pedagógico. Cuando generes ejercicios, asegúrate de que tengan un componente analítico o numérico.
Usa siempre los materiales proporcionados por el usuario como base principal de conocimiento.`;

export async function askGemini(prompt: string, knowledgeBase: string, history: {role: string, text: string}[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const fullPrompt = `Base de conocimiento proporcionada:
---
${knowledgeBase}
---
Pregunta del estudiante: ${prompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: fullPrompt }] }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    },
  });

  return response.text || "Lo siento, no pude procesar tu solicitud.";
}

export async function generateQuiz(knowledgeBase: string, topic?: string): Promise<QuizQuestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const prompt = `Genera un test de autoevaluación de 5 preguntas de opción múltiple sobre ${topic || 'el contenido proporcionado'}. 
  Asegúrate de que sean preguntas de nivel universitario desafiantes.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: `Material:\n${knowledgeBase}\n\nTarea: ${prompt}` }] }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswerIndex: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Error parsing quiz JSON", e);
    return [];
  }
}

export async function generateExercise(knowledgeBase: string): Promise<Exercise> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const prompt = `Genera un ejercicio práctico detallado sobre Hacienda Pública basado en este material.
  Debe incluir un enunciado, pasos sugeridos para la resolución y la solución final detallada.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: `Material:\n${knowledgeBase}\n\nTarea: ${prompt}` }] }
    ],
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

  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Error generating exercise");
  }
}
