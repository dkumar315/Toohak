import {
  getData, setData, Data, States, Quiz, QuizSession, EmptyObject,
  State, Metadata, Player, INVALID, PlayerScore
} from './dataStore';
import fs from 'fs';
import { isValidIds, IsValid } from './helperFunctions';
import { resultsAnalysis } from './resultsAnalysis';

export enum SessionLimits {
  AUTO_START_AND_QUESTIONS_NUM_MIN = 0,
  AUTO_START_NUM_MAX = 50,
  ACTIVE_SESSIONS_NUM_MAX = 10,
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
}

export type QuizSessionId = { sessionId: number };
export type QuizSessions = {
  activeSessions: number[],
  inactiveSessions: number[]
};
export type QuizSessionStatus = {
  state: State,
  atQuestion: number,
  players: Player[],
  metadata: Metadata
};
export type QuizSessionResults = {
  usersRankedByScore: {
    name: string,
    score: number
  }[],
  questionResults: {
    questionId: number,
    playersCorrectList: string[],
    averageAnswerTime: number,
    percentCorrect: number
  }[]
}
export type CSVResult = { url: string };

const COUNTDOWN_SEC = 3;

/** add a new session copy of current quiz in data.quizSessions
 *
 * @param {object} quiz - origin quiz info
 * @param {number} autoStartNum - the number people to auto start a session
 *
 * @return {number} sessionId - the global unique identifier of a quiz session
 */
const setNewSession = (quizIndex: number, autoStartNum: number): number => {
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  const { sessionIds, questionCounter, ...metaQuiz } = quiz;
  const newSession: QuizSession = {
    sessionId: ++data.sessions.quizSessionCounter,
    state: States.LOBBY,
    atQuestion: 0,
    players: [],
    autoStartNum,
    metadata: { ...metaQuiz },
    questionSessions: metaQuiz.questions.map(question => ({
      questionId: question.questionId,
      playersCorrectList: [],
      averageAnswerTime: 0,
      percentCorrect: 0,
      playerAnswers: [],
      timeStart: 0
    })),
    messages: []
  };
  data.quizSessions.push(newSession);
  quiz.sessionIds.push(newSession.sessionId);

  setData(data);
  return newSession.sessionId;
};

export interface SessionListReturn {
  activeSessions: Array<number>,
  inactiveSessions: Array<number>
}

const sessionTimers: Record<number, ReturnType<typeof setTimeout>> = {};

export const clearAllTimers = () => {
  for (const timer of Object.values(sessionTimers)) {
    clearTimeout(timer);
  }
};

const clearTimer = (sessionId: number) => {
  if (sessionTimers[sessionId]) {
    clearTimeout(sessionTimers[sessionId]);
    delete sessionTimers[sessionId];
  }
};

const setTimer = (sessionId: number, duration: number, callback: () => void) => {
  clearTimer(sessionId);
  sessionTimers[sessionId] = setTimeout(callback, duration * 1000);
};

export const questionCountDown = (sessionIndex: number) => {
  const data: Data = getData();
  const session: QuizSession = data.quizSessions[sessionIndex];

  session.state = States.QUESTION_COUNTDOWN;
  session.atQuestion += 1;
  setData(data);

  const questionDuration: number = session.metadata
    .questions[session.atQuestion - 1].duration;
  clearTimer(session.sessionId);
  setTimer(session.sessionId, COUNTDOWN_SEC, () => {
    session.state = States.QUESTION_OPEN;
    setData(data);
    setTimer(session.sessionId, questionDuration, () => {
      session.state = States.QUESTION_CLOSE;
      setData(data);
    });
  });
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
): QuizSessions => {
  const isValidObj: IsValid = isValidIds(token, quizId, true);
  if (!isValidObj.isValid) {
    throw new Error(isValidObj.errorMsg);
  }

  const data: Data = getData();

  const activeSessions: Array<number> = data.quizSessions
    .filter(session => session.state !== States.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  const inactiveSessions: Array<number> = data.quizSessions
    .filter(session => session.state === States.END)
    .map(session => session.sessionId)
    .sort((a, b) => a - b);

  return { activeSessions, inactiveSessions };
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

  const activeQuizzesNum: number = data.quizSessions
    .filter((session: QuizSession) => session.state !== States.END &&
      session.metadata.quizId === quizId).length;
  if (activeQuizzesNum >= SessionLimits.ACTIVE_SESSIONS_NUM_MAX) {
    throw new Error(`Invalid activeSessionNum: ${activeQuizzesNum}.`);
  }

  const sessionId: number = setNewSession(isValidObj.quizIndex, autoStartNum);
  return { sessionId };
};

/**
 * Updates the state of a specific quiz session
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} sessionId - a unique identifier for a quiz session
 * @param {Action} action - the action to be performed on the session
 *
 * @return {object} success or error message
 * @throws {Error} error - if token, quizId, sessionId or action is invalid
 */
export const adminQuizSessionUpdate = (
  token: string,
  quizId: number,
  sessionId: number,
  action: Action
): EmptyObject => {
  const isValidObj: IsValid = isValidIds(token, quizId, false);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const sessionIndex: number = data.quizSessions.findIndex(session =>
    session.sessionId === sessionId
  );

  if (sessionIndex === INVALID) {
    throw new Error(`Invalid sessionId: ${sessionId}.`);
  }
  const session: QuizSession = data.quizSessions[sessionIndex];
  let questionDuration: number;

  switch (action) {
    case Action.NEXT_QUESTION:
      if (session.state !== States.LOBBY &&
          session.state !== States.ANSWER_SHOW &&
          session.state !== States.QUESTION_CLOSE) {
        throw new Error(
          `Cannot perform NEXT_QUESTION action in the current state: ${session.state}.`
        );
      }
      questionCountDown(sessionIndex);
      break;

    case Action.SKIP_COUNTDOWN:
      if (session.state !== States.QUESTION_COUNTDOWN) {
        throw new Error(
          `Cannot perform SKIP_COUNTDOWN action in the current state: ${session.state}.`
        );
      }
      session.state = States.QUESTION_OPEN;
      setData(data);

      questionDuration = session.metadata
        .questions[session.atQuestion - 1].duration;
      clearTimer(session.sessionId);
      setTimer(session.sessionId, questionDuration, () => {
        session.state = States.QUESTION_CLOSE;
        setData(data);
      });
      break;

    case Action.GO_TO_ANSWER:
      if (session.state !== States.QUESTION_OPEN &&
        session.state !== States.QUESTION_CLOSE) {
        throw new Error(
          `Cannot perform GO_TO_ANSWER action in the current state: ${session.state}.`
        );
      }
      session.state = States.ANSWER_SHOW;
      setData(data);

      clearTimer(session.sessionId);
      break;

    case Action.GO_TO_FINAL_RESULTS:
      if (session.state !== States.ANSWER_SHOW &&
        session.state !== States.QUESTION_CLOSE) {
        throw new Error(
          `Cannot perform GO_TO_FINAL_RESULTS action in the current state: ${session.state}.`
        );
      }

      session.state = States.FINAL_RESULTS;
      session.atQuestion = 0;
      setData(data);
      resultsAnalysis(sessionIndex);

      clearTimer(session.sessionId);
      break;

    case Action.END:
      session.state = States.END;
      session.atQuestion = 0;
      setData(data);

      clearTimer(session.sessionId);
      break;

    default:
      throw new Error(`Invalid action: ${action}.`);
  }
  return {};
};

/**
 * Retrieves the status of a specific quiz session
 *
 * @param {string} token - A unique identifier for a logged-in user
 * @param {number} quizId - A unique identifier for a valid quiz
 * @param {number} sessionId - A unique identifier for a quiz session
 *
 * @returns {object} - An object containing the status of the quiz session
 * @throws {Error} - Throws an error if the token, quizId, or sessionId is invalid
 */
export const adminQuizSessionStatus = (
  token: string,
  quizId: number,
  sessionId: number
): QuizSessionStatus => {
  const isValidObj: IsValid = isValidIds(token, quizId, false);
  if (!isValidObj.isValid) {
    throw new Error(isValidObj.errorMsg);
  }

  const data: Data = getData();

  const session: QuizSession | undefined = data.quizSessions.find(
    session => session.sessionId === sessionId
  );
  if (!session) {
    throw new Error(`Invalid sessionId: ${sessionId}.`);
  }

  const { state, atQuestion, players, metadata } = session;
  return { state, atQuestion, players, metadata };
};

/**
 * Retrieves the final results for a completed quiz session.
 *
 * @param {string} token - A unique identifier for a login user.
 * @param {number} quizId - A unique identifier for a valid quiz.
 * @param {number} sessionId - A unique identifier for a valid session.
 *
 * @returns {object} - An object containing users ranked by score and question results.
 * @throws {Error} - Throws an error if the token, quizId, or sessionId is invalid, or if the session is not in FINAL_RESULTS state.
 */
export const adminQuizSessionResults = (
  token: string,
  quizId: number,
  sessionId: number
): QuizSessionResults => {
  const isValidObj = isValidIds(token, quizId, false);
  if (!isValidObj.isValid) {
    throw new Error(isValidObj.errorMsg);
  }

  const data: Data = getData();
  const session = data.quizSessions.find(s => s.sessionId === sessionId && s.metadata.quizId === quizId);
  if (!session) {
    throw new Error(`Invalid sessionId number: ${sessionId}.`);
  }

  if (session.state !== States.FINAL_RESULTS) {
    throw new Error('Session is not in FINAL_RESULTS state.');
  }

  const usersRankedByScore = session.players
    .map(player => ({ name: player.name, score: player.score }))
    .sort((a, b) => b.score - a.score);

  const questionResults = session.questionSessions.map(question => ({
    questionId: question.questionId,
    playersCorrectList: question.playersCorrectList,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentCorrect
  }));

  return {
    usersRankedByScore,
    questionResults
  };
};

/**
 * a link of CSV format of results, ordered in alphabetical order of player name
 *
 * @param {string} token - A unique identifier for a login user
 * @param {number} quizId - A unique identifier for a valid quiz
 * @param {number} sessionId - A unique identifier for a valid session
 *
 * @returns {object} - An url of csv users results
 * @throws {Error} - Throws an error if the token, quizId, or sessionId is invalid,
 * or if the session is not in FINAL_RESULTS state.
 */
export const adminQuizSessionResultsCSV = (
  token: string,
  quizId: number,
  sessionId: number
): CSVResult => {
  const isValidObj = isValidIds(token, quizId, false);
  if (!isValidObj.isValid) {
    throw new Error(isValidObj.errorMsg);
  }

  const data: Data = getData();
  const sessionIndex: number = data.quizSessions
    .findIndex((session: QuizSession) => session.sessionId === sessionId);
  if (sessionIndex === INVALID) {
    throw new Error(`Invalid sessionId: ${sessionId}.`);
  }
  const session: QuizSession = data.quizSessions[sessionIndex];
  if (session.state !== States.FINAL_RESULTS) {
    throw new Error(`Invalid session state: ${session.state}.`);
  }

  const csvContent = arrayToCSV(session.playerScores);
  const url: string = `https://quiz/${quizId}/session/${sessionId}/results.csv`;
  fs.writeFile(url, csvContent, () => {});

  return { url };
};

const arrayToCSV = (playerScores: PlayerScore[]) => {
  const allKeys = new Set();
  playerScores.forEach(player => {
    Object.keys(player).forEach(key => {
      if (key !== 'name') allKeys.add(key);
    });
  });

  const sortedKeys = Array.from(allKeys);
  let csv = 'Player,' + sortedKeys.join(',') + '\n';

  playerScores.forEach((player: PlayerScore) => {
    csv += player.name;
    sortedKeys.forEach((key: string) => {
      csv += ',' +
      (player[key] !== undefined && player[key] !== '' ? player[key] : '0');
    });
    csv += '\n';
  });

  return csv;
};
