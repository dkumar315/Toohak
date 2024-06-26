import { setData, getData } from './dataStore';
import isEmail from 'validator/lib/isEmail';

const NAME_MIN_LEN = 2;
const NAME_MAX_LEN = 20;
const PASSWORD_MIN_LEN = 8;
const INVALID_USER_INDEX = -1;

/**
 * Register a user with an email, password, and names.
 *
 * @param {string} email - user's email
 * @param {string} password - user's matching password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {number} authUserId - unique identifier for a user
 * @return {error: string} if email, password, nameFirst, nameLast invalid
 */
export function adminAuthRegister(email, password, nameFirst, nameLast) {
  // Check if email is valid or already exists
  const emailValidResult = isValidEmail(email, INVALID_USER_INDEX);
  if (!emailValidResult) {
    return { error: 'Email invalid format or already in use' };
  }

  const data = getData();
  const authUserId = data.users.length + 1;

  // Check nameFirst meets requirements
  const nameFValidResult = isValidName(nameFirst);
  if (!nameFValidResult) {
    return { error: 'Firstname must: \n' +
            '- have lowercase or uppercase letters,' +
            'spaces, hyphens, or apostrophes\n' +
            '- be between 2 to 20 characters'
    };
  }

  // Check nameLast meets requirements
  const nameLValidResult = isValidName(nameLast);
  if (!nameLValidResult) {
    return { error: 'Lastname must: \n' +
            '- have lowercase, uppercase letters,' +
            'spaces, hyphens, or apostrophes\n' +
            '- be between 2 to 20 characters'
    };
  }

  // Check password meets requirements
  const passValidResult = isValidPassword(password);
  if (!passValidResult) {
    return { error: 'Password must contain: \n' +
            '- one letter \n' +
            '- one number \n' +
            '- more than 8 characters'
    };
  }

  const newUser = {
    userId: authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  }

  data.users.push(newUser);
  setData(data);

  return { authUserId: authUserId };
}


/**
* Validates a user's login, given their email and password.
*
* @param {string} email - user's email
* @param {string} password - user's matching password
*
* @return {number} authUserId - unique identifier for a user
* @return {error: string} if email or password invalid
*/
export function adminAuthLogin(email, password) {
  const data = getData();
  const userIndex = data.users.findIndex(user => user.email === email);
  if (userIndex === INVALID_USER_INDEX) {
    return { error: 'Invalid email.' };
  }

  let user = data.users[userIndex];
  if (password.localeCompare(user.password) !== 0) {
    user.numFailedPasswordsSinceLastLogin += 1;
    return { error: 'Incorrect Password.' };
  }

  // reset numFailedPasswordsSinceLastLogin
  user.numSuccessfulLogins += 1;
  user.numFailedPasswordsSinceLastLogin = 0;
  setData(data);
  return { authUserId: user.userId };
}


/**
 * Given an admin user's authUserId, return details about the user.
 *
 * @param {number} authUserId - unique identifier for a user
 *
 * @return {object} return user - userDetails
 * @return {error: string} if authUserId invalid
 */
export function adminUserDetails(authUserId) {
  const data = getData();

  const userIndex = isValidUser(authUserId);
  if (userIndex === INVALID_USER_INDEX) return { error: `Invalid authUserId ${authUserId}.` };
  const user = data.users[userIndex];

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
 * @param {number} authUserId - unique identifier for a user
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {object} empty object
 * @return {error: string} if authUserId, email, or names invalid
 */
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  let data = getData();

  // check whether authUserId is exist
  const userIndex = isValidUser(authUserId);
  if (userIndex === INVALID_USER_INDEX) return { error: `Invalid authUserId ${authUserId}.` };

  // check email, nameFirst, nameLast whether is valid
  if (!isValidEmail(email, authUserId)) return { error: `Invalid email ${email}.` };
  if (!isValidName(nameFirst)) return { error: `Invalid nameFirst ${nameFirst}.` };
  if (!isValidName(nameLast)) return { error: `Invalid nameLast ${nameLast}.` };

  // update userDetails
  data.users[userIndex].email = email;
  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;

  setData(data);

  return {};
}


/**
 * Updates the password of a logged in user.
 *
 * @param {number} authUserId - unique identifier for a user
 * @param {number} oldPassword - the current password stored requires update
 * @param {number} newPassword - the replacement password submitted by user
 *
 * @return {object} empty object
 * @return {error: string} if authUserId or passwords invalid
 */
export function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  let data = getData();

  // check the authUserId whether is valid and find its userDetails
  const userIndex = isValidUser(authUserId);
  if (userIndex === INVALID_USER_INDEX) return { error: `Invalid authUserId ${authUserId}.` };

  const user = data.users[userIndex];

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
 * Given an admin user's authUserId, return its corresponding userIndex
 *
 * @param {number} authUserId - unique identifier for a user
 *
 * @return {number} return corresonding index of a user with given authUserId
 */
export function isValidUser(authUserId) {
  const data = getData();
  return data.users.findIndex(user => user.userId === authUserId);
}


/**
 * Given an email, return true if it is not used by the other and it is email
 *
 * @param {number} authUserId - unique identifier for a user,
 * set to -1 if it is new user
 * @param {string} email - user's email, according to
 * https://www.npmjs.com/package/validator
 *
 * @return {boolean} return true if email is valid and not used by others
 */
function isValidEmail(email, authUserId) {
  const data = getData();

  const isUsed = data.users.some(user =>
  user.userId !== authUserId && user.email === email
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
function isValidName(name) {
  const pattern = new RegExp(`^[a-zA-Z\\s-\']{${NAME_MIN_LEN},${NAME_MAX_LEN}}$`);
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
function isValidPassword(password) {
  const stringPattern = new RegExp(/[a-zA-Z]/);
  const numberPattern = new RegExp(/[0-9]/);

  if (password.length < PASSWORD_MIN_LEN || !stringPattern.test(password) ||
    !numberPattern.test(password)) {
    return false;
  }

  return true;
}

