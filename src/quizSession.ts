import {
  getData, setData, Data, States, INVALID, Quiz, QuizSession, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST
} from './dataStore';
import {
  findQuizIndex, IsValid
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

  const activeQuizzesNum: number = activeSessionsList(data, quizId).activeSessions.length;
  if (activeQuizzesNum >= SessionLimits.ACTIVE_SESSIONS_NUM_MAX) {
    throw new Error(`Invalid activeSessionNum: ${activeQuizzesNum}.`);
  }

  const sessionId: number = setNewSession(data, quiz, autoStartNum);
  return { sessionId };
}


/**
 * Retrieves active and inactive session ids for a quiz.
 *
 * @param {string} token - A unique identifier for a logged-in user.
 * @param {number} quizId - A unique identifier for a valid quiz.
 *
 * @returns {object} - An object containing arrays of active and inactive session ids.
 * @returns {number[]} activeSessions - An array of active session ids.
 * @returns {number[]} inactiveSessions - An array of inactive session ids.
 * @throws {Error} - Throws an error if the token or quizId is invalid, with an associated status code.
 */
export function adminQuizSessionList(token: string, quizId: number) {
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) {
    throw new Error(isValidObj.errorMsg);
  }

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];

  const activeSessions = data.quizSessions
    .filter(session => session.state !== States.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  const inactiveSessions = data.quizSessions
    .filter(session => session.state === States.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  return { activeSessions, inactiveSessions };
}

function isValidIds(token: string, quizId: number): IsValid {
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

  isValidQuiz = findQuizIndex(data.trashedQuizzes, quizId, authUserId);
  if (isValidQuiz.isValid) {
    return { isValid: false, errorMsg: `Invalid quiz in trash: ${quizId}` };
  }

  return { isValid: false, errorMsg: `Invalid quizId number: ${quizId}` };
}

function activeSessionsList(data: Data, quizId: number) {
  const activeSessions: number[] = [];
  if (data.quizSessions.length === 0) {
    return { activeSessions };
  }

  activeSessions.push(...data.quizSessions
    .filter((session: QuizSession) => session.state !== States.END &&
      session.metadata.quizId === quizId)
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
