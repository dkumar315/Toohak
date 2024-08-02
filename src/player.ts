import {
  setData, getData, States, Data, INVALID, // Actions,
  QuizSession, Player, ErrorObject
} from './dataStore';
import { findSessionPlayer, PlayerIndices } from './helperFunctions';
import { questionCountDown } from './quizSession';
const NOT_AUTOSTART = 0;

enum NameGen {
  LETTERS = 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS = '0123456789',
  RANDOM_SORT_PIVOT = 0.5,
  RANDOM_LETTER_LEN = 5,
  RANDOM_NUMBER_LEN = 3
}

export type PlayerId = { playerId: number };

export interface PlayerStatus {
  state: States[keyof States],
  numQuestions: number;
  atQuestion: number;
}

/**
 * find a seesion given a sessionId
 *
 * @param {number} sessionId - uniqueId for a session
 *
 * @return {number} sessionIndex - where session store in the data
 */
const findSession = (sessionId: number): number => {
  const data: Data = getData();
  return data.quizSessions.findIndex((session: QuizSession) =>
    session.sessionId === sessionId);
};

/**
 * generate a unique random name for a session
 *
 * @param {object} players - the player of the session
 *
 * @return {string} name - a unique random name for a guest player in a session
 */
const generateName = (players: Player[]): string => {
  const shuffle = (str: string) =>
    [...str].sort(() => Math.random() - NameGen.RANDOM_SORT_PIVOT).join('');

  const name: string =
    shuffle(NameGen.LETTERS).slice(0, NameGen.RANDOM_LETTER_LEN) +
    shuffle(NameGen.NUMBERS).slice(0, NameGen.RANDOM_NUMBER_LEN);

  return isExistName(name, players) ? generateName(players) : name;
};

/**
 * check if a name exist in a session
 *
 * @param {string} name - name of a player
 * @param {object} players - the player of the session
 *
 * @return {boolean} true - if the name not exist in a player
 */
const isExistName = (name: string, players: Player[]): boolean => {
  return players.some((player: Player) => player.name === name);
};

/**
 * add a player
 *
 * @param {number} sessionId - uniqueId for a session
 * @param {string} name - '' to auto generateName
 *
 * @return {object} playerId - unique identifier for a guest player
 * @return {object} errorObject - session, session state or namw input invalid
 */
export const playerJoin = (sessionId: number, name: string): PlayerId => {
  const sessionIndex: number = findSession(sessionId);
  if (sessionIndex === INVALID) {
    throw new Error(`Invalid sessionId number: ${sessionId}.`);
  }

  const data: Data = getData();
  const session: QuizSession = data.quizSessions[sessionIndex];
  if (session.state !== States.LOBBY) {
    throw new Error(`Invalid state ${session.state}, sessionId: ${sessionId}.`);
  }

  if (name === '') {
    name = generateName(session.players);
  } else if (isExistName(name, session.players)) {
    throw new Error(`Invalid name string: ${name} exists in current session.`);
  }

  // addPlayer
  const playerId: number = ++data.sessions.playerCounter;
  const newPlayer: Player = {
    playerId,
    name,
    score: 0,
    timeTaken: 0
  };
  session.players.push(newPlayer);
  setData(data);

  // autoStart
  if (session.autoStartNum !== NOT_AUTOSTART &&
  session.players.length >= session.autoStartNum) {
    questionCountDown(sessionIndex);
  }

  return { playerId };
};

/**
 * Get the status of a guest player
 *
 * @param {number} playerId - unique identifier for a guest player
 *
 * @return {object} status - status of the player
 * @return {object} errorObject - if player ID does not exist
 */
export const playerStatus = (playerId: number): PlayerStatus => {
  const isValidPlayer: PlayerIndices | ErrorObject = findSessionPlayer(playerId);
  if ('error' in isValidPlayer) throw new Error(isValidPlayer.error);

  const data: Data = getData();
  const session: QuizSession = data.quizSessions[isValidPlayer.sessionIndex];

  return {
    state: session.state,
    numQuestions: session.metadata.questions.length,
    atQuestion: session.atQuestion
  };
};

export function playerResults(playerId: number) {
  const isvalidPlayer: PlayerIndices | ErrorObject = findSessionPlayer(playerId);
  if ('error' in isvalidPlayer) throw new Error(isvalidPlayer.error);

  const data: Data = getData();
  const session: QuizSession = data.quizSessions[isvalidPlayer.sessionIndex];

  if (session.state !== 'FINAL_RESULTS') {
    throw new Error('Session is not in FINAL_RESULTS state');
  }
  const usersRankedByScore = session.players
    .sort((a, b) => b.score - a.score)
    .map((player) => ({ name: player.name, score: player.score }));

  const questionResults = session.questionSessions.map((question) => ({
    questionId: question.questionId,
    playersCorrectList: question.playersCorrectList,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentCorrect,
  }));

  return {
    usersRankedByScore,
    questionResults,
  };
}
