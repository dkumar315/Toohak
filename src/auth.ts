import { setData, getData } from './dataStore';
import isEmail from 'validator/lib/isEmail';

// interfeces
import { Data, User, ErrorObject, EmptyObject } from './dataStore';

const NAME_MIN_LEN: number = 2;
const NAME_MAX_LEN: number = 20;
const PASSWORD_MIN_LEN: number = 8;
const INVALID_USER_INDEX: number = -1;

export interface UserDetails {
  userId: number;
  email: string;
  name: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface UserDetailReturn {
  user: UserDetails;
}

/**
 * Register a user with an email, password, and names.
 *
 * @param {string} email - user's email
 * @param {string} password - user's matching password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {number} authUserId - unique identifier for a user
 * @return {object} returns error if email, password, nameFirst, nameLast invalid
 */
export function adminAuthRegister(email, password, nameFirst, nameLast) {
  // Check if email is valid or already exists
  if (!isValidEmail(email, INVALID_USER_INDEX)) {
    return { error: `Email invalid format or already in use ${email}.` };
  }

  const data = getData();
  const authUserId = data.users.length + 1;

  // Check nameFirst meets requirements
  if (!isValidName(nameFirst)) {
    return { error: `Firstname does not meet requirements ${nameFirst}.` };
  }

  // Check nameLast meets requirements
  if (!isValidName(nameLast)) {
    return { error: `Lastname does not meet requirements ${nameLast}.` };
  }

  // Check password meets requirements
  if (!isValidPassword(password)) {
    return { error: `Invalid password ${password}.` };
  }

  const token = generateToken();

  const newUser = {
    userId: authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    tokens: [token],
  };

  data.users.push(newUser);
  setData(data);

  return { token: token };
}

/**
* Validates a user's login, given their email and password.
*
* @param {string} email - user's email
* @param {string} password - user's matching password
*
* @return {number} authUserId - unique identifier for a user
* @return {object} returns error if email or password invalid
*/
export function adminAuthLogin(email, password) {
  const data = getData();
  const userIndex = data.users.findIndex(user => user.email === email);
  if (userIndex === INVALID_USER_INDEX) {
    return { error: `Invalid email ${email}.` };
  }

  const user = data.users[userIndex];
  if (password.localeCompare(user.password) !== 0) {
    user.numFailedPasswordsSinceLastLogin += 1;
    return { error: `Invalid password ${password}.` };
  }

  // reset numFailedPasswordsSinceLastLogin
  user.numSuccessfulLogins += 1;
  user.numFailedPasswordsSinceLastLogin = 0;

  const token = generateToken();
  user.tokens.push(token);

  setData(data);
  return { token: token };
}

/**
 * Given an login user's token, return details about the user.
 *
 * @param {string} token - unique identifier for a login user
 *
 * @return {object} return user - userDetails
 * @return {object} returns error if token invalid
 */
export function adminUserDetails(token: string): UserDetailReturn | ErrorObject {
  const userIndex: number = isValidUser(token);
  if (userIndex === INVALID_USER_INDEX) return { error: `Invalid token ${token}.` };

  const data: Data = getData();
  const user: User = data.users[userIndex];

  return {
    user: {
      userId: user.userId,
      name: user.nameFirst + ' ' + user.nameLast,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
 * Given an admin user's authUserId and a set of properties,
 * update the properties of this logged in admin user.
 *
 * @param {string} token - unique identifier for a login user
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {object} empty object
 * @return {object} returns error if authUserId, email, or names invalid
 */
export function adminUserDetailsUpdate(token: string, email: string,
  nameFirst: string, nameLast: string): EmptyObject | ErrorObject {
  const data: Data = getData();
  const userIndex: number = isValidUser(token);
  if (userIndex === INVALID_USER_INDEX) return { error: `Invalid token ${token}.` };

  const user: User = data.users[userIndex];

  // check email, nameFirst, nameLast whether is valid
  if (!isValidEmail(email, userIndex)) return { error: `Invalid email ${email}.` };
  if (!isValidName(nameFirst)) return { error: `Invalid nameFirst ${nameFirst}.` };
  if (!isValidName(nameLast)) return { error: `Invalid nameLast ${nameLast}.` };

  // update userDetails
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);

  return {};
}

/**
 * Updates the password of a logged in user.
 *
 * @param {string} token - unique identifier for a login user
 * @param {string} oldPassword - the current password stored requires update
 * @param {string} newPassword - the replacement password submitted by user
 *
 * @return {object} empty object
 * @return {object} returns error if authUserId or passwords invalid
 */
export function adminUserPasswordUpdate(token: string, oldPassword: string,
  newPassword: string) : EmptyObject | ErrorObject {
  // check the authUserId whether is valid and find its userDetails
  const userIndex = isValidUser(token);
  if (userIndex === INVALID_USER_INDEX) return { error: `Invalid token ${token}.` };

  const data: Data = getData();
  const user: User = data.users[userIndex];

  //  check the oldPassword whether is valid and match the user password
  if (user.password !== oldPassword) return { error: `Invalid oldPassword ${oldPassword}.` };

  // check the newPassword whether is valid and not used before
  user.passwordHistory = user.passwordHistory || [];
  if (oldPassword === newPassword || !isValidPassword(newPassword) ||
    user.passwordHistory.includes(newPassword)) {
    return { error: `Invalid newPassword ${newPassword}.` };
  }

  // if all input valid, then update the password
  user.password = newPassword;
  user.passwordHistory.push(oldPassword);
  setData(data);

  return {};
}

/**
 * Generate a token that is unique
 *
 * @return {string} return a new token
 */
function generateToken(): string {
  const data: Data = getData();
  const allTokensLength: number = data.users.reduce((sum, currUser) =>
    sum + currUser.tokens.length, 0
  );
  return String(allTokensLength + 1);
}

/**
 * Given an admin user's token, return its corresponding userIndex
 *
 * @param {number} token - unique identifier for a user
 *
 * @return {number} return corresonding index of a user
 */
export function isValidUser(token: string): number {
  const data: Data = getData();
  return data.users.findIndex(user => user.tokens.includes(token));
}

/**
 * Given an email, return true if it is not used by the other and it is email
 *
 * @param {number} userIndex - unique identifier for a user,
 * set to -1 if it is new user
 * @param {string} email - user's email, according to
 * https://www.npmjs.com/package/validator
 *
 * @return {boolean} return true if email is valid and not used by others
 */
function isValidEmail(email: string, userIndex: number): boolean {
  const data: Data = getData();

  const isUsed: boolean = data.users.some((user, index) =>
    index !== userIndex && user.email === email
  );

  return !isUsed && isEmail(email);
}

/**
 * Given a name string, return true iif name only contains
 * [a-z], [A-Z], " ", "-", or "'", and name.length is [2, 20] inclusive;
 *
 * @param {string} name - nameFirst or nameLast of a user
 *
 * @return {boolean} true iif contains letters, spaces, hyphens, or apostrophes
 */
function isValidName(name: string): boolean {
  const pattern = new RegExp(`^[a-zA-Z\\s-']{${NAME_MIN_LEN},${NAME_MAX_LEN}}$`);
  return pattern.test(name);
}

/**
 * Given a password string, return false if its length is smaller than 8, or
 * not contain at least a letter and at least a number, otherwise return true
 * potential upgrade: return the strength of password, return -1 if invalid
 *
 * @param {string} password - nameFirst or nameLast of a user
 *
 * @return {boolean} true iif len > 8 && contains >= 1 (letter & integer)
 */
function isValidPassword(password: string): boolean {
  const stringPattern = /[a-zA-Z]/;
  const numberPattern = /[0-9]/;

  if (password.length < PASSWORD_MIN_LEN || !stringPattern.test(password) ||
    !numberPattern.test(password)) {
    return false;
  }

  return true;
}
