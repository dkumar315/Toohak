// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let data = {
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
  users: User[],
  quizzes: any, // fixme
}

export interface User {
  userId: number,
  password: string,
  email: string,
  nameFirst: string,
  nameLast: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  passwordHistory?: string[]
}

export type EmptyObject = Record<string, never>;

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
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
}

export { getData, setData };
