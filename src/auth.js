import { setData, getData } from './dataStore';
import isEmail from 'validator/lib/isEmail';

/**
 * Register a user with an email, password, and names.
 * 
 * @param {string} email - user's email
 * @param {string} password - user's matching password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 * 
 * @return {number} authUserId - unique identifier for a user
 * @return {{error: string}} if authUserId invalid
 */
export function adminAuthRegister(email, password, nameFirst, nameLast) {
  // Check if email is valid or already exists
  const emailValidResult = isValidEmail(email, -1);
  if (!emailValidResult) {
    return {error: 'Invalid email.'};
  }

  const data = getData();
  const authUserId = data.users.length + 1;

  // Check nameFirst meets requirements
  const nameFValidResult = isValidName(nameFirst);
  if (!nameFValidResult) {
    return {error: 'Firstname does not meet requirements.'};
  }

  // Check nameLast meets requirements
  const nameLValidResult = isValidName(nameLast);
  if (!nameLValidResult) {
    return {error: 'Lastname does not meet requirements.'};
  }
 
  // Check password meets requirements
  const passValidResult = isValidPassword(password);
  if (!passValidResult) {
    return {error: 'Password does not meet requirements.'};
  }

  const newUser = {
    userID: authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
  }

  data.users.push(newUser);
  setData(data);

  return {authUserId: authUserId};
}

/**
 * Validates a user's login, given their email and password.
 * 
 * @param {string} email - user's email
 * @param {string} password - user's matching password
 * 
 * @return {number} authUserId - unique identifier for a user
 */
export function adminAuthLogin(email, password) {

  return {authUserId: 1};
}

/**
 * Given an admin user's authUserId, return details about the user.
 * 
 * @param {number} authUserId - unique identifier for a user
 * 
 * @return {object} return userDetails
 */
export function adminUserDetails(authUserId) {
  const userDetails = {
    userId: 1,
    name: 'Hayden Smith',
    email: 'hayden.smith@unsw.edu.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1,
  }
  
  return {
    user: userDetails
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
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {

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
 */
export function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {

  return {};
}


/**
 * Given an email, return true if it is not used by the other and it is email
 * 
 * @param {number} authUserId - unique identifier for a user, 
 * set to -1 if it is new user
 * @param {string} email - user's email, according to 
 * https://www.npmjs.com/package/validator
 * 
 * @return {object} return true if email is valid and not used by others
 */
function isValidEmail(email, authUserId) {
  const data = getData();
  let isUsed = true;
  const isRegistered = data.users.filter((user) => user.email === email);

  if (isRegistered.length === 0 || 
    (isRegistered.length === 1 && isRegistered[0].userId === authUserId)) {
    isUsed = false;
  }

  return !isUsed && isEmail(email);
}

/**
 * Given a name string, return true iif contains [a-z], [A-Z], " ", "-", or "'"
 * 
 * @param {string} name - nameFirst or nameLast of a user 
 * 
 * @return {boolean} true iif contains letters, spaces, hyphens, or apostrophes
 */
function isValidName(name) {
  const pattern = new RegExp(/[^a-zA-Z\s-\']/);
  if (name.length < 2 || name.length > 20 || pattern.test(name)) {
    return false;
  }
  return true;
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

  if (password.length < 8 || !stringPattern.test(password) || 
    !numberPattern.test(password)) {
    return false;
  }

  return true;
}
