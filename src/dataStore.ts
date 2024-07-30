import fs from 'fs';
const DATA_FILE = './dataStore.json';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
export const SECURE_FILE = 'hs256_secret_key.txt';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let data: Data = {
  users: [],
  quizzes: [],
  trashedQuizzes: [],
  sessions: {
    tokenCounter: 0,
    quizCounter: 0,
    quizSessionCounter: 0,
    playerCounter: 0,
    sessionIds: [],
  },
  quizSessions: []
};

// define constants
export const INVALID = -1;
export const OK = StatusCodes.OK; // 200
export const BAD_REQUEST = StatusCodes.BAD_REQUEST; // 400
export const UNAUTHORIZED = StatusCodes.UNAUTHORIZED; // 401
export const FORBIDDEN = StatusCodes.FORBIDDEN; // 403

export type Algorithms = 'HS256' | 'RS256' | 'ES256' | 'PS256';
export const ALGORITHM: Algorithms = 'RS256';

export enum Colours {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  BROWN = 'brown',
  ORANGE = 'orange'
}
export type Colour = Colours[keyof Colours];

export enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}
export type State = States[keyof States];

// interfaces
export type EmptyObject = Record<string, never>;
export type ErrorObject = { error: string };
export type QuestionResultResponse = QuestionResult | { error: string };
export interface Data {
  users: User[];
  quizzes: Quiz[];
  trashedQuizzes: Quiz[];
  sessions: Sessions;
  quizSessions: QuizSession[];

}

export interface Sessions {
  tokenCounter: number;
  quizCounter: number;
  playerCounter: number;
  quizSessionCounter: number;
  sessionIds: Session[];
}

export interface Session {
  userId: number;
  token: string;
}

interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export interface User {
  userId: number;
  password: string;
  email: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  passwordHistory?: string[];
}

export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  creatorId: number;
  numQuestions: number;
  questionCounter: number;
  questions: Question[];
  duration: number; // in seconds
  sessionIds: number[];
  thumbnailUrl: string;
}

export interface Question {
  questionId: number;
  question: string;
  duration: number; // in seconds
  points: number;
  answers: Answer[];
  thumbnailUrl: string;
}

export interface Answer {
  answerId: number;
  answer: string;
  colour: Colour;
  correct: boolean;
}

export interface QuizSession {
  sessionId: number;
  state: State;
  atQuestion: number;
  autoStartNum: number;
  metadata: Metadata;
  messages: Message[];
  players: Player[]
}

export interface Metadata extends Omit<Quiz, 'questions' | 'sessionIds' | 'questionCounter' > {
  questions: QuestionSession[]
}

export interface QuestionSession extends Question {
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface Message {
  messageBody: string,
  playerId: number,
  playerName: string,
  timeSent: number
}

export interface Player {
  playerId: number;
  name: string;
  points: number;
  answerIds: number[];
  timeTaken: number;
  score: number;
}
export interface QuestionResult {
  id: number;
  result: string;
}

export interface QuizSessionResult {
  usersRankedByScore: { name: string, score: number }[];
  questionResults: {
    questionId: number;
    playersCorrectList: string[];
    averageAnswerTime: number;
    percentCorrect: number;
  }[];
}

/* export interface QuestionResult {
  id: number;
  result: string;
} */

export interface QuestionResults {
  results: QuestionResult[];
  error?: string;
}

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
export function getData(): Data {
  loadData();
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: Data): void {
  data = newData;
  saveData(data);
}

function loadData(): void {
  try {
    const fileData = fs.readFileSync(DATA_FILE, { flag: 'r' });
    data = JSON.parse(String(fileData));
  } catch (error) {
    console.log('No existing data file found. Starting with empty data.');
  }
}

function saveData(data: Data): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' });
}

/**
 * get the keyPair from the storage
 *
 */
export const getKey = (): KeyPair => {
  if (!fs.existsSync(SECURE_FILE)) {
    const keyPair: KeyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    fs.writeFileSync(SECURE_FILE, JSON.stringify(keyPair));
    return keyPair;
  }

  return JSON.parse(fs.readFileSync(SECURE_FILE, 'utf8'));
};
