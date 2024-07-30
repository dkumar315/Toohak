import { setData, getData, getKey } from './dataStore';
import isEmail from 'validator/lib/isEmail';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  Data, User, Session, INVALID, EmptyObject, ALGORITHM, SECURE_FILE
} from './dataStore';

enum UserLimits {
  NAME_MIN_LEN = 2,
  NAME_MAX_LEN = 20,
  PASSWORD_MIN_LEN = 8
}

enum Secret {
  RANDOM_BYTE_LEN = 8,
  RANDOM_STR_LEN = 16,
  SALT = 'SeCret'
}

const TOKEN_EXPIRY = '9999 years';

export interface UserDetail {
  userId: number;
  email: string;
  name: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}
export interface UserDetails { user: UserDetail }
export type Token = { token: string };

/**
 * Register a user with an email, password, and names.
 *
 * @param {string} email - user's email
 * @param {string} password - user's matching password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {string} token - unique identifier for a user
 * @throws {Error} error - if email, password, nameFirst, nameLast invalid
 */
export const adminAuthRegister = (
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): Token => {
  // Check if email is valid or already exists
  if (!isValidEmail(email, INVALID)) {
    throw new Error(`Email invalid format or already in use ${email}.`);
  }

  // Check nameFirst meets requirements
  if (!isValidName(nameFirst)) {
    throw new Error(`Firstname does not meet requirements ${nameFirst}.`);
  }

  // Check nameLast meets requirements
  if (!isValidName(nameLast)) {
    throw new Error(`Lastname does not meet requirements ${nameLast}.`);
  }

  // Check password meets requirements
  if (!isValidPassword(password)) {
    throw new Error(`Invalid password ${password}.`);
  }

  const data: Data = getData();
  const userId: number = data.users.length + 1;

  const newUser: User = {
    userId: userId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: storedHash(password),
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  data.users.push(newUser);
  setData(data);

  const token: string = generateToken(userId);
  addSession(userId, token);

  return { token: token };
};

/**
* Validates a user's login, given their email and password.
*
* @param {string} email - user's email
* @param {string} password - user's matching password
*
* @return {string} token - unique identifier for a user
* @throws {Error} error - if email or password invalid
*/
export const adminAuthLogin = (email: string, password: string): Token => {
  const data: Data = getData();
  const userIndex: number = data.users.findIndex(user => user.email === email);
  if (userIndex === INVALID) {
    throw new Error(`Invalid email ${email}.`);
  }

  const user: User = data.users[userIndex];
  if (hashPassword(password) !== vertifyPassword(user.password)) {
    user.numFailedPasswordsSinceLastLogin += 1;
    setData(data);
    throw new Error(`Invalid password ${password}.`);
  }

  // reset numFailedPasswordsSinceLastLogin
  user.numSuccessfulLogins += 1;
  user.numFailedPasswordsSinceLastLogin = 0;
  setData(data);

  const token: string = generateToken(user.userId);
  addSession(user.userId, token);

  return { token: token };
};

/**
 * Given an login user's token, remove its corresponding session.
 *
 * @param {string} token - unique identifier of a user
 *
 * @return {object} empty object - if valid
 * @throws {Error} error - if token is empty or invalid
 */
export const adminAuthLogout = (token: string): EmptyObject => {
  const data: Data = getData();
  const sessionIndex: number = data.sessions.sessionIds.findIndex(session =>
    session.token === token
  );

  if (sessionIndex === INVALID) throw new Error(`Invalid token ${token}.`);
  data.sessions.sessionIds.splice(sessionIndex, 1);

  setData(data);
  return {};
};

/**
 * Given an login user's token, return details about the user.
 *
 * @param {string} token - unique identifier for a login user
 *
 * @return {object} user - userDetails
 * @throws {Error} error - if token invalid
 */
export const adminUserDetails = (token: string): UserDetails => {
  const userId: number = findUserId(token);
  if (userId === INVALID) throw new Error(`Invalid token ${token}.`);

  const data: Data = getData();
  const userIndex: number = findUser(userId);
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
};

/**
 * Given an admin user's authUserId and a set of properties,
 * update the properties of this logged in admin user.
 *
 * @param {string} token - unique identifier for a login user
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {object} empty object - if valid
 * @throws {Error} error - if authUserId, email, or names are invalid
 */
export const adminUserDetailsUpdate = (
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): EmptyObject => {
  const data: Data = getData();
  const userId: number = findUserId(token);
  if (userId === INVALID) throw new Error(`Invalid token ${token}.`);

  const userIndex: number = findUser(userId);
  const user: User = data.users[userIndex];

  // check whether email, nameFirst, nameLast are valid
  if (!isValidEmail(email, userIndex)) throw new Error(`Invalid email ${email}.`);
  if (!isValidName(nameFirst)) throw new Error(`Invalid nameFirst ${nameFirst}.`);
  if (!isValidName(nameLast)) throw new Error(`Invalid nameLast ${nameLast}.`);

  // update userDetails
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);

  return {};
};

/**
 * Updates the password of a logged in user.
 *
 * @param {string} token - unique identifier for a login user
 * @param {string} oldPassword - the current password stored requires update
 * @param {string} newPassword - the replacement password submitted by user
 *
 * @return {object} empty object - if valid
 * @throws {Error} error - if token or passwords invalid
 */
export const adminUserPasswordUpdate = (
  token: string,
  oldPassword: string,
  newPassword: string
) : EmptyObject => {
  // check whether token valid
  const userId: number = findUserId(token);
  if (userId === INVALID) throw new Error(`Invalid token ${token}.`);

  const data: Data = getData();
  const userIndex: number = findUser(userId);
  const user: User = data.users[userIndex];

  // check whether oldPassword matches the user's password
  if (vertifyPassword(user.password) !== hashPassword(oldPassword)) {
    throw new Error(`Invalid oldPassword ${oldPassword}.`);
  }

  // check newPassword meets requirements or not used before
  user.passwordHistory = user.passwordHistory || [];
  if (oldPassword === newPassword || !isValidPassword(newPassword) ||
    user.passwordHistory.some(oldPassword =>
      vertifyPassword(oldPassword) === hashPassword(newPassword))) {
    throw new Error(`Invalid newPassword ${newPassword}.`);
  }

  user.passwordHistory.push(user.password);
  user.password = storedHash(newPassword);
  setData(data);

  return {};
};

/**
 * Generate a token that is globally unique, assume token never expire
 *
 * @param {string} email - user email, globally unique
 * @param {string} password - user password
 *
 * @return {string} token - unique identifier of a login user
 */
const generateToken = (userId: number): string => {
  const header = { alg: ALGORITHM, typ: 'JWT' };
  const data: Data = getData();
  const payload = {
    jti: uuidv4(),
    userId: userId,
    tokenId: ++data.sessions.tokenCounter
  };

  const token: string = jwt.sign(payload, getKey().privateKey, {
    algorithm: ALGORITHM,
    header,
    expiresIn: TOKEN_EXPIRY
  });

  return token;
};

/**
 * Save the session into data
 *
 * @param {number} authUserId - a unique identifier of a user
 * @param {string} token - a unique identifier of user activitives
 */
const addSession = (userId: number, token: string): void => {
  const data: Data = getData();
  data.sessions.sessionIds.push({ userId, token });
  setData(data);
};

/**
 * Process a hash for storing
 *
 * @param {string} plaintext - the text to be hash
 *
 * @return {string} hash - the hash of the text
 */
const getHashOf = (plaintext: string): string => {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
};

/**
 * Return for processing a password
 *
 * @param {string} plaintext - a unique identifier of a user
 *
 * @return {string} processedHash - the storing part of hash
 */
const hashPassword = (plaintext: string): string => {
  return getHashOf(Secret.SALT + getHashOf(plaintext));
};

/**
 * Return the hash string for storing
 *
 * @param {string} plaintext - a unique identifier of a user
 *
 * @return {string} storeData - the storing part of hash + random
 */
const storedHash = (hash: string): string => {
  const random: string = crypto
    .randomBytes(Secret.RANDOM_BYTE_LEN).toString('hex');
  return `${hashPassword(hash)}${random}`;
};

/**
 * Return the hash string before processing
 *
 * @param {string} storeData - the storing hash
 *
 * @return {string} processedHash - the storing part of hash
 */
const vertifyPassword = (storedHash: string): string => {
  return storedHash.slice(0, -Secret.RANDOM_STR_LEN);
};

/**
 * Given an authUserId, return its index in data.users
 *
 * @param {number} authUserId - unique identifier for a user
 *
 * @return {number} userIndex - corresponding index of user given authUserId
 */
const findUser = (authUserId: number): number => {
  const data: Data = getData();
  return data.users.findIndex(user => user.userId === authUserId);
};

/**
 * Given an email, return true if it is not used by the other and it is email
 *
 * @param {string} email - user's email, according to
 * https://www.npmjs.com/package/validator
 * @param {number} userIndex - unique identifier for a user,
 * set to -1 if it is new user
 *
 * @return {boolean} true - if email is valid and not used by others
 */
const isValidEmail = (email: string, userIndex: number): boolean => {
  const data: Data = getData();

  const isUsed: boolean = data.users.some((user, index) =>
    index !== userIndex && user.email === email
  );

  return !isUsed && isEmail(email);
};

/**
 * Given a name string, return true iif name only contains
 * [a-z], [A-Z], " ", "-", or "'", and name.length is [2, 20] inclusive;
 *
 * @param {string} name - nameFirst or nameLast of a user
 *
 * @return {boolean} true - if contains letters, spaces, hyphens, or apostrophes
 */
const isValidName = (name: string): boolean => {
  const pattern: RegExp = new RegExp(
    `^[a-zA-Z\\s-']{${UserLimits.NAME_MIN_LEN},${UserLimits.NAME_MAX_LEN}}$`
  );
  return pattern.test(name);
};

/**
 * Given a password string, return false if its length is smaller than 8, or
 * not contain at least a letter and at least a number, otherwise return true
 *
 * @param {string} password - nameFirst or nameLast of a user
 *
 * @return {boolean} true - if len > 8 && contains >= 1 (letter & integer)
 */
const isValidPassword = (password: string): boolean => {
  const stringPattern: RegExp = /[a-zA-Z]/;
  const numberPattern: RegExp = /[0-9]/;

  if (password.length < UserLimits.PASSWORD_MIN_LEN ||
    !stringPattern.test(password) || !numberPattern.test(password)) {
    return false;
  }

  return true;
};

/**
 * Given an admin user's token, return userId if valid
 *
 * @param {string} token - unique identifier for a user
 *
 * @return {number} userId - corresponding userId of a token
 */
export const findUserId = (token: string): number => {
  const data: Data = getData();
  if (token === '' || !fs.existsSync(SECURE_FILE)) return INVALID;
  try {
    const decoded = jwt.decode(token);
    const isValid = jwt.verify(token, getKey().publicKey,
      { algorithms: [ALGORITHM] }) as { userId: number };

    const session: Session = data.sessions.sessionIds.find(session =>
      session.token === token
    );

    console.log('\n\n\n========== TOKEN CHECK ==============');

    if (!session) {
      console.log('Session not found');
      console.log('All sessions:');
      console.log(data.sessions.sessionIds);
    } else if (session.userId !== isValid.userId) {
      console.log("User IDs don't match");
      console.log('Session = ', session);
      console.log('Is valid = ', isValid);
    }

    if (!decoded || !isValid ||
      !session || session.userId !== isValid.userId) return INVALID;

    return session.userId;
  } catch (error) {
    return INVALID;
  }
};
