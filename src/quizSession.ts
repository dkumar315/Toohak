// import { getData, setData, Data, States, State } from './dataStore';
// import { findQuizIndex, IsValid } from './quizQuestion';
// import { findUserId } from './auth';

export enum SessionLimits {
  AUTO_START_NUM_MAX = 50,
  ACTIVE_SESSIONS_NUM_MAX = 10,
  QUESTIONS_MIN_NUM = 0
}

export type QuizSessionId = { sessionId: number };

export function adminQuizSessionCreate(token: string, quizId: number,
  autoStartNum: number): QuizSessionId {
  const sessionId: number = 0;
  return { sessionId };
}
