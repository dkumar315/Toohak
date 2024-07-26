import {
  getData, setData, Data, States, INVALID, Quiz, QuizSession
} from './dataStore';
import { findQuizIndex, IsValid } from './quizQuestion';
import { findUserId } from './auth';

export enum SessionLimits {
  AUTO_START_AND_QUESTIONS_NUM_MIN = 0,
  AUTO_START_NUM_MAX = 50,
  ACTIVE_SESSIONS_NUM_MAX = 10,
}

export type QuizSessionId = { sessionId: number };
export type QuizSessions = {
  activeSessions: number[],
  inactiveSessions: number[]
};

/**
 * copies a quiz, and start a new session of a quiz
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} autoStartNum - number of people to autostart
 *
 * @return {object} quizId - unique identifier for a qiz of a user
 * @throws {Error} error - if token, quizId, or autoStartNum invalid
 */
export const adminQuizSessionCreate = (
  token: string,
  quizId: number,
  autoStartNum: number
): QuizSessionId => {
  const isValidObj: IsValid = isValidIds(token, quizId, true);
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

  const activeQuizzesNum: number = activeSessionsNum(data, quizId);
  if (activeQuizzesNum >= SessionLimits.ACTIVE_SESSIONS_NUM_MAX) {
    throw new Error(`Invalid activeSessionNum: ${activeQuizzesNum}.`);
  }

  const sessionId: number = setNewSession(quiz, autoStartNum);
  return { sessionId };
};

/**
 * Retrieves active and inactive session ids for a quiz.
 *
 * @param {string} token - A unique identifier for a logged-in user
 * @param {number} quizId - A unique identifier for a valid quiz
 *
 * @returns {object} - An object containing arrays of active and inactive session ids
 * @returns {number[]} activeSessions - An array of active session ids
 * @returns {number[]} inactiveSessions - An array of inactive session ids
 * @throws {Error} - Throws an error if the token or quizId is invalid
 */
export const adminQuizSessionList = (
  token: string,
  quizId: number
):QuizSessions => {
  const isValidObj: IsValid = isValidIds(token, quizId, true);
  if (!isValidObj.isValid) {
    throw new Error(isValidObj.errorMsg);
  }

  const data: Data = getData();

  const activeSessions = data.quizSessions
    .filter(session => session.state !== States.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  const inactiveSessions = data.quizSessions
    .filter(session => session.state === States.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  return { activeSessions, inactiveSessions };
};

/**
 * check token, quizId, or and quiz in trash
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {boolean} checkTrashQuiz - whether check quizId in trash
 *
 * @return {object} isValidObj - isValid, errorMsg if invalid
 */
const isValidIds = (
  token: string,
  quizId: number,
  checkTrashQuiz: boolean
):IsValid => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    return { isValid: false, errorMsg: `Invalid token string: ${token}` };
  }

  if (quizId <= 0) {
    return { isValid: false, errorMsg: `Invalid quizId number: ${quizId}` };
  }

  const data: Data = getData();
  let isValidQuiz: IsValid = findQuizIndex(data.quizzes, quizId, authUserId);
  if (isValidQuiz.isValid) return isValidQuiz;

  if (checkTrashQuiz) {
    isValidQuiz = findQuizIndex(data.trashedQuizzes, quizId, authUserId);
    if (isValidQuiz.isValid) {
      return { isValid: false, errorMsg: `Invalid quiz in trash: ${quizId}` };
    }
  }

  return { isValid: false, errorMsg: `Invalid quizId number: ${quizId}` };
};

/**
 * count the active quizSessions number aof a quiz
 *
 * @param {object} data - there info stores
 * @param {number} quizId - a unique identifier for a valid quiz
 *
 * @return {number} activeSessionsNum - of a quiz
 */
const activeSessionsNum = (data: Data, quizId: number): number => {
  const activeSessions: QuizSession[] = data.quizSessions
    .filter((session: QuizSession) => session.state !== States.END &&
      session.metadata.quizId === quizId);

  return activeSessions.length;
};

/** add a new session copy of current quiz in data.quizSessions
 *
 * @param {object} quiz - origin quiz info
 * @param {number} autoStartNum - the number people to auto start a session
 *
 * @return {number} sessionId - the global unique identifier of a quiz session
 */
const setNewSession = (quiz: Quiz, autoStartNum: number): number => {
  const { sessionIds, questions, questionCounter, ...metaQuiz } = quiz;
  const data: Data = getData();
  const newSession: QuizSession = {
    sessionId: ++data.sessions.quizSessionCounter,
    state: States.LOBBY,
    atQuestion: 0,
    players: [],
    autoStartNum,
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
};
