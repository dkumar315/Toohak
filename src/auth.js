import { getData, setData } from './dataStore';
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
 */
export function adminAuthRegister(email, password, nameFirst, nameLast) {

  return {authUserId: 1};
}

/**
 * Validates a user's login, given their email and password.
 * 
 * @param {string} email - user's email
 * @param {string} password - user's matching password
 * 
 * @return {number} authUserId - unique identifier for a user
 */
function adminAuthLogin(email, password) {

  return {authUserId: 1};
}

/**
 * Given an admin user's authUserId, return details about the user.
 * 
 * @param {number} authUserId - unique identifier for a user
 * 
 * @return {object} return userDetails
 * @return {{error: string}} if authUserId invalid
 */
function adminUserDetails(authUserId) {
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
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  let data = getData();
  const userIndex = isValidUser(authUserId);
  if (userIndex === -1) return {error:'invalid authUserId'};

  if (!isValidEmail(email, authUserId)) return {error:'invalid email'};
  if (!isValidname(nameFirst)) return {error:'invalid nameFirst'};
  if (!isValidname(nameLast)) return {error:'invalid nameLast'};

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
 */
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  return {};
}

/**
 * Given an admin user's authUserId, return its corresponding userIndex
 * 
 * @param {number} authUserId - unique identifier for a user
 * 
 * @return {object} return corresonding index of data.users
 */
function isValidUser(authUserId) {
  const data = getData();

  return data.users.findIndex((array) => array.userId === authUserId);
}

/**
 * Given an email, return true if it is not used by the other and it is email
 * 
 * @param {number} authUserId - unique identifier for a user, 
 * set to -1 if it is new user
 * @param {strung} email - user's email, according to 
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
 * @return {boolean} true iif contains lettes, spaces, hyphens, or apostrophes
 */
function isValidname(name) {
  const reg = new RegExp(/[^a-zA-Z\s-\']/);

  if (name.length <= 2 || name.length >= 20 || reg.test(name)) return false;

  return true;
}
