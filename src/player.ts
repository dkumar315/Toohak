import {
  setData, getData, States, Data, INVALID,
  QuizSession, Player
} from './dataStore';

enum NameGen {
  LETTERS = 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS = '0123456789',
  RANDOM_SORT_PIVOT = 0.5,
  RANDOM_LETTER_LEN = 5,
  RANDOM_NUMBER_LEN = 3
}

export type PlayerId = { playerId: number };

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
    points: 0,
    answerIds: [],
    timeTaken: 0
  };
  session.players.push(newPlayer);
  setData(data);

  return { playerId };
};

const findSession = (sessionId: number): number => {
  const data: Data = getData();
  return data.quizSessions.findIndex((session: QuizSession) =>
    session.sessionId === sessionId);
};

const generateName = (players: Player[]): string => {
  const shuffle = (str: string) =>
    [...str].sort(() => Math.random() - NameGen.RANDOM_SORT_PIVOT).join('');

  const name: string =
    shuffle(NameGen.LETTERS).slice(0, NameGen.RANDOM_LETTER_LEN) +
    shuffle(NameGen.NUMBERS).slice(0, NameGen.RANDOM_NUMBER_LEN);

  return isExistName(name, players) ? generateName(players) : name;
};

const isExistName = (name: string, players: Player[]): boolean => {
  return players.some((player: Player) => player.name === name);
};
