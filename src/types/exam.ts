export type QuestionType = 'multiple-choice' | 'true-false' | 'numeric';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string | boolean | number;
  unit?: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number; // in minutes
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  published: boolean;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  answers: {
    questionId: string;
    answer: string | boolean | number;
  }[];
  score?: number;
  timeSpent?: number; // in seconds
  status: 'in-progress' | 'completed' | 'abandoned';
}

export interface QuestionState {
  id: string;
  status: 'unread' | 'read' | 'answered';
  answer?: string | boolean | number;
}

export interface ExamSessionState {
  examId: string;
  currentQuestionIndex: number;
  timeRemaining: number;
  questions: QuestionState[];
  isFullscreen: boolean;
}
