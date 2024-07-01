import fs from 'fs';
const DATA_FILE = './dataStore.json';

// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let data: Data = {
  users: [],
  quizzes: [],
};

// define constants
const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
export { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN };

export interface Data {
  users: User[];
  quizzes: object[];
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
  tokens: string[];
}

export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  creatorId: number;
  questions?: Question[];
}

export interface Question {
  optionId: number;
  optionString: string;
}

export type EmptyObject = Record<string, never>;
export type ErrorObject = { error: string };

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
  // loadData();
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
    console.log('No existing data file found. Starting with empty data.')
  }
}

function saveData(data: Data): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), { flag: 'w' });
}
