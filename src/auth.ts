import { setData, getData } from './dataStore';
import isEmail from 'validator/lib/isEmail';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  Data, User, Session, INVALID, ErrorObject, EmptyObject
} from './dataStore';

enum UserLimits {
  NAME_MIN_LEN = 2,
  NAME_MAX_LEN = 20,
  PASSWORD_MIN_LEN = 8
}
type Algorithms = 'HS256' | 'RS256' | 'ES256' | 'PS256';
const ALGORITHM: Algorithms = 'RS256';
const TOKEN_EXPIRY = '9999 years';

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

export interface TokenReturn {
  token: string;
}

/**
 * Register a user with an email, password, and names.
 *
 * @param {string} email - user's email
 * @param {string} password - user's matching password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {string} token - unique identifier for a user
 * @return {object} error - if email, password, nameFirst, nameLast invalid
 */
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): TokenReturn | ErrorObject {
  // Check if email is valid or already exists
  if (!isValidEmail(email, INVALID)) {
    return { error: `Email invalid format or already in use ${email}.` };
  }

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

  const data: Data = getData();
  const authUserId: number = data.users.length + 1;

  const newUser: User = {
    userId: authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  data.users.push(newUser);
  setData(data);

  const token: string = generateToken(authUserId);
  addSession(authUserId, token);

  return { token: token };
}

/**
* Validates a user's login, given their email and password.
*
* @param {string} email - user's email
* @param {string} password - user's matching password
*
* @return {string} token - unique identifier for a user
* @return {object} error - if email or password invalid
*/
export function adminAuthLogin(email: string, password: string): TokenReturn | ErrorObject {
  const data: Data = getData();
  const userIndex: number = data.users.findIndex(user => user.email === email);
  if (userIndex === INVALID) {
    return { error: `Invalid email ${email}.` };
  }

  const user: User = data.users[userIndex];
  if (password.localeCompare(user.password) !== 0) {
    user.numFailedPasswordsSinceLastLogin += 1;
    setData(data);
    return { error: `Invalid password ${password}.` };
  }

  // reset numFailedPasswordsSinceLastLogin
  user.numSuccessfulLogins += 1;
  user.numFailedPasswordsSinceLastLogin = 0;
  setData(data);

  const token: string = generateToken(user.userId);
  addSession(user.userId, token);

  return { token: token };
}

/**
 * Given an login user's token, remove its corresponding session.
 *
 * @param {string} email - unique email for a login user
 * @param {string} password - password for a login user
 *
 * @return {object} empty object - if valid
 * @return {object} error - if token is empty or invalid
 */
export function adminAuthLogout(token: string): EmptyObject | ErrorObject {
  const data: Data = getData();
  const sessionIndex: number = data.sessions.sessionIds.findIndex(session =>
    session.token === token
  );

  if (sessionIndex === INVALID) return { error: `Invalid token ${token}.` };
  data.sessions.sessionIds.splice(sessionIndex, 1);

  setData(data);
  return {};
}

/**
 * Given an login user's token, return details about the user.
 *
 * @param {string} token - unique identifier for a login user
 *
 * @return {object} user - userDetails
 * @return {object} error - if token invalid
 */
export function adminUserDetails(token: string): UserDetailReturn | ErrorObject {
  const userId: number = findUserId(token);
  if (userId === INVALID) return { error: `Invalid token ${token}.` };

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
 * @return {object} empty object - if valid
 * @return {object} error - if authUserId, email, or names are invalid
 */
export function adminUserDetailsUpdate(token: string, email: string,
  nameFirst: string, nameLast: string): EmptyObject | ErrorObject {
  const data: Data = getData();
  const userId: number = findUserId(token);
  if (userId === INVALID) return { error: `Invalid token ${token}.` };

  const userIndex: number = findUser(userId);
  const user: User = data.users[userIndex];

  // check whether email, nameFirst, nameLast are valid
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
 * @return {object} empty object - if valid
 * @return {object} error - if token or passwords invalid
 */
export function adminUserPasswordUpdate(token: string, oldPassword: string,
  newPassword: string) : EmptyObject | ErrorObject {
  // check whether token valid
  const userId: number = findUserId(token);
  if (userId === INVALID) return { error: `Invalid token ${token}.` };

  const data: Data = getData();
  const userIndex: number = findUser(userId);
  const user: User = data.users[userIndex];

  // check whether oldPassword matches the user's password
  if (user.password !== oldPassword) {
    return { error: `Invalid oldPassword ${oldPassword}.` };
  }

  // check newPassword meets requirements or not used before
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
 * Generate a token that is globally unique, assume token never expire
 *
 * @param {string} email - user email, globally unique
 * @param {string} password - user password
 *
 * @return {string} token - unique identifier of a login user
 */
function generateToken(userId: number): string {
  const data: Data = getData();
  data.sessions.globalCounter += 1;

  if (!data.sessions.keyPair) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    data.sessions.keyPair = { privateKey, publicKey };
  }
  setData(data);

  const header = { alg: ALGORITHM, typ: 'JWT' };
  const payload = {
    jti: uuidv4(),
    tokenId: data.sessions.globalCounter,
    userId: userId,
    iat: Math.floor(Date.now() / 1000)
  };

  const token: string = jwt.sign(payload, data.sessions.keyPair.privateKey, {
    algorithm: ALGORITHM,
    header,
    expiresIn: TOKEN_EXPIRY
  });

  return token;
}

/**
 * Return the hash of a string
 */
export function getHashOf(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

/**
 * Generate and push a session
 */
function addSession(authUserId: number, token: string): void {
  const data: Data = getData();
  const newSession: Session = {
    userId: authUserId,
    token: token
  };
  data.sessions.sessionIds.push(newSession);
  setData(data);
}

/**
 * Given an admin user's token, return userId if valid
 *
 * @param {string} token - unique identifier for a user
 *
 * @return {number} userId - corresponding userId of a token
 */
export function findUserId(token: string): number {
  const data: Data = getData();
  if (!data.sessions.keyPair) return INVALID;
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string' || !decoded.userId) return INVALID;

  const isValid = jwt.verify(token, data.sessions.keyPair.publicKey,
    { algorithms: [ALGORITHM] }) as { userId: number };
  if (!isValid) return INVALID;

  const session: Session = data.sessions.sessionIds.find(session =>
    getHashOf(session.token) === getHashOf(token)
  );
  if (!session || session.userId !== isValid.userId) return INVALID;

  return session.userId;
}

/**
 * Given an authUserId, return its index in data.users
 *
 * @param {number} authUserId - unique identifier for a user
 *
 * @return {number} userIndex - corresponding index of user given authUserId
 */
function findUser(authUserId: number): number {
  const data: Data = getData();
  return data.users.findIndex(user => user.userId === authUserId);
}

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
 * @return {boolean} true - if contains letters, spaces, hyphens, or apostrophes
 */
function isValidName(name: string): boolean {
  const pattern: RegExp = new RegExp(
    `^[a-zA-Z\\s-']{${UserLimits.NAME_MIN_LEN},${UserLimits.NAME_MAX_LEN}}$`
  );
  return pattern.test(name);
}

/**
 * Given a password string, return false if its length is smaller than 8, or
 * not contain at least a letter and at least a number, otherwise return true
 *
 * @param {string} password - nameFirst or nameLast of a user
 *
 * @return {boolean} true - if len > 8 && contains >= 1 (letter & integer)
 */
function isValidPassword(password: string): boolean {
  const stringPattern: RegExp = /[a-zA-Z]/;
  const numberPattern: RegExp = /[0-9]/;

  if (password.length < UserLimits.PASSWORD_MIN_LEN || !stringPattern.test(password) ||
    !numberPattern.test(password)) {
    return false;
  }

  return true;
}
