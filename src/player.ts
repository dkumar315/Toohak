import { setData, getData } from './dataStore';
import {
  Data, Quiz, Session, INVALID, ErrorObject, EmptyObject, States
} from './dataStore';

export type PlayerId = { playerId: number };

export function playerJoin(sessionId: number, name: string): PlayerId {
  const sessionIndex: number = findSession(sessionId);
  const session: QizSession = data.quizSessions[sessionIndex];

  // let playerName = name || generateRandomName();
  if (name.length === 0) {
    const name: string === generateName();
  } else if (isExistName(name)) {
    throw new Error(`Invalid ${name}, already exists in the session.`)
  }

  setPlayer(name);

  return { playerId: 0 };
}

function generateRandomName() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const randomLetters = [...letters]
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .join('');
  
  const randomNumbers = [...numbers]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .join('');
  
  return randomLetters + randomNumbers;
}

console.log(generateRandomName());
