import {
  getData, setData, Data, States, INVALID, Quiz, QuizSession
} from './dataStore';
import {
  findQuizIndex, IsValid, isValidErrorReturn as errorReturn
} from './quizQuestion';
import { findUserId } from './auth';

export enum SessionLimits {
  AUTO_START_AND_QUESTIONS_NUM_MIN = 0,
  AUTO_START_NUM_MAX = 50,
  ACTIVE_SESSIONS_NUM_MAX = 10,
}

export type QuizSessionId = { sessionId: number };

/**
 * copies a quiz, and start a new session of a quiz
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} autoStartNum - number of people to autostart
 *
 * @return {object} quizId - unique identifier for a qiz of a user
 * @return {object} error - token, quizId, or questionBody invalid
 */
export function adminQuizSessionCreate(token: string, quizId: number,
  autoStartNum: number): QuizSessionId {
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  if (autoStartNum < SessionLimits.AUTO_START_AND_QUESTIONS_NUM_MIN ||
    autoStartNum > SessionLimits.AUTO_START_NUM_MAX) {
    throw new Error(`Invalid autoStartNum: ${autoStartNum}.`);
  }

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  if (quiz.numQuestions <= SessionLimits.AUTO_START_AND_QUESTIONS_NUM_MIN) {
    throw new Error(`Invalid quiz question number: ${quiz.numQuestions}.`);
  }

  const activeQuizzesNum: number = activeSessionsList(quiz).activeSessions.length;
  if (activeQuizzesNum >= SessionLimits.ACTIVE_SESSIONS_NUM_MAX) {
    throw new Error(`Invalid activeSessionNum: ${activeQuizzesNum}.`);
  }

  const sessionId: number = setNewSession(data, quiz, autoStartNum);
  return { sessionId };
}

/**
 * check if a given token and quiz
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 *
 * @return {object} quizId - unique identifier for a qiz of a user
 * @return {object} error - token, quizId, or questionBody invalid
 */
function isValidIds(token: string, quizId: number) {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) return errorReturn(`Invalid token string: ${token}.`);

  const data: Data = getData();
  let isValidQuiz: IsValid = findQuizIndex(data.quizzes, quizId, authUserId);
  if (isValidQuiz.isValid) return isValidQuiz;

  isValidQuiz = findQuizIndex(data.trashedQuizzes, quizId, authUserId);
  if (isValidQuiz.isValid) {
    return errorReturn(`Invalid quiz in trash: ${quizId}.`);
  }

  return isValidQuiz;
}

function activeSessionsList(quiz: Quiz) {
  const data: Data = getData();
  const activeSessions: number[] = [];
  if (data.quizSessions.length === 0 || quiz.sessionIds.length === 0) {
    return { activeSessions };
  }

  activeSessions.push(...data.quizSessions
    .filter((session: QuizSession) => session.state !== States.END &&
      quiz.quizId === session.metadata.quizId)
    .map((session: QuizSession) => session.sessionId));

  return { activeSessions };
}

function setNewSession(data: Data, quiz: Quiz, autoStartNum: number): number {
  const { sessionIds, questions, questionCounter, ...metaQuiz } = quiz;
  const newSession: QuizSession = {
    sessionId: ++data.sessions.quizSessionCounter,
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
    },
    messages: []
  };
  data.quizSessions.push(newSession);
  quiz.sessionIds.push(newSession.sessionId);

  setData(data);
  return newSession.sessionId;
}
