import {
  getData, setData, Data, States, INVALID, Quiz, QuizSession
} from './dataStore';
import {
  findQuizIndex, IsValid, isValidErrorReturn as errorReturn
} from './quizQuestion';
import { findUserId } from './auth';

export enum SessionLimits {
  AUTO_START_NUM_MIN = 0,
  AUTO_START_NUM_MAX = 50,
  ACTIVE_SESSIONS_NUM_MAX = 10,
  QUESTIONS_MIN_NUM = 0
}

export type QuizSessionId = { sessionId: number };

export function adminQuizSessionCreate(token: string, quizId: number,
  autoStartNum: number): QuizSessionId {
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  if (autoStartNum < SessionLimits.AUTO_START_NUM_MIN ||
    autoStartNum > SessionLimits.AUTO_START_NUM_MAX) {
    throw new Error(`Invalid autoStartNum: ${autoStartNum}.`);
  }

  const data: Data = getData();
  const quizIndex: number = isValidObj.quizIndex;
  const quiz: Quiz = data.quizzes[quizIndex];
  if (quiz.numQuestions <= SessionLimits.QUESTIONS_MIN_NUM) {
    throw new Error(`Invalid quiz question number: ${quiz.numQuestions}.`);
  }

  const activeQuizzesNum: number = activeSessionsList(quizIndex).activeSessions.length;
  if (activeQuizzesNum >= SessionLimits.ACTIVE_SESSIONS_NUM_MAX) {
    throw new Error(`Invalid activeSessionNum: ${activeQuizzesNum}.`);
  }

  quiz.sessionCounter += 1;
  const { sessions, questions, ...metaQuiz } = quiz;
  const newSession: QuizSession = {
    sessionId: quiz.sessionCounter,
    state: States.LOBBY,
    atQuestion: 0,
    players: [],
    autoStartNum: autoStartNum,
    metadata: {
      ...metaQuiz,
      questions: questions.map(question => ({
        ...question,
        playersCorrectList: [],
        averageAnswerTime: 0,
        percentCorrect: 0
      }))
    }
  };
  quiz.sessions.push(newSession);
  setData(data);

  return { sessionId: quiz.sessionCounter };
}

function isValidIds(token: string, quizId: number) {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) return errorReturn(`Invalid token string: ${token}.`);

  const data: Data = getData();
  let isValidQuiz: IsValid = findQuizIndex(data.quizzes, quizId, authUserId);
  if (isValidQuiz.isValid) return isValidQuiz;

  isValidQuiz = findQuizIndex(data.trashedQuizzes, quizId, authUserId);
  if (isValidQuiz.isValid) return errorReturn(`Invalid quiz in trash: ${quizId}.`);

  return isValidQuiz;
}

function activeSessionsList(quizIndex: number) {
  const data: Data = getData();
  const activeSessions: number[] = [];
  if (data.quizzes.length === 0 ||
    data.quizzes[quizIndex].sessions.length === 0) {
    return { activeSessions };
  }

  activeSessions.push(...data.quizzes[quizIndex].sessions
  .filter((session: QuizSession) => session.state !== States.END)
  .map((session: QuizSession) => session.sessionId));

  return { activeSessions };
}

