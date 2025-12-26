
export enum AppMode {
  CHAT = 'CHAT',
  PRACTICE = 'PRACTICE',
  TEST = 'TEST',
  CONTENT = 'CONTENT',
  SHARE = 'SHARE'
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Exercise {
  title: string;
  statement: string;
  steps: string[];
  solution: string;
}
