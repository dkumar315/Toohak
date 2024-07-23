import { setData, getData, QuizSession, Player } from './dataStore';
import {
  Data, Quiz, Session, INVALID, ErrorObject, EmptyObject, States
} from './dataStore';

enum NameGen {
  LETTERS = 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS = '0123456789',
  RANDOM_SORT_PIVOT = 0.5,
  RANDOM_LETTER_LEN = 5,
  RANDOM_NUMBER_LEN = 3
}

export type PlayerId = { playerId: number };

export const playerJoin = (sessionId: number, name: string): PlayerId => {
  const session: QuizSession = findSession(sessionId);
  if (!session) { throw new Error(`invalid sessionId ${sessionId}.`); }

  name = name || generateName(session.players);
  if (isExistName(name, session.players)) {
    throw new Error(`Invalid ${name}, already exists in the session.`);
  }

  // addPlayer
  const data: Data = getData();
  const playerId: number = ++data.sessions.playerCounter;
  const newPlayer: Player = {
    playerId,
    name,
    points: 0,
    answerIds: [],
    timeTaken: 0
  }
  session.players.push(newPlayer);
  setData(data);

  return { playerId };
}

const findSession = (sessionId: number): QuizSession | undefined => {
  const data: Data = getData();
  return data.quizSessions.find((session: QuizSession) =>
    session.sessionId === sessionId);
};

const generateName = (players: Player[]): string => {
  const shuffle = (str: string) =>
    [...str].sort(() => Math.random() - NameGen.RANDOM_SORT_PIVOT).join('');

  const name: string = 
    shuffle(NameGen.LETTERS).slice(0, NameGen.RANDOM_LETTER_LEN) +
    shuffle(NameGen.NUMBERS).slice(0, NameGen.RANDOM_NUMBER_LEN);

  if (isExistName(name, players)) return generateName(players);
  return name;
};

const isExistName = (name: string, players: Player[]): boolean => {
  return players.some((player: Player) => player.name === name);
}

