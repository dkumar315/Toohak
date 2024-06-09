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
function adminAuthRegister(email, password, nameFirst, nameLast) {
  const data = getData();
  const authUserId = data.users[data.users.length].userId + 1;
  
  const newUser = {
    userId: authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
  }

  setData(data);

  return {
    authUserId: authUserId
  };
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
export function adminUserDetails(authUserId) {
  const data = getData();
  const userIndex = isValidUser(authUserId);

  if (userIndex === -1) return {error:'invalid authUserId'};
  const userDetails = data.users[userIndex];
  const {userId, nameFirst, nameLast, password, ...rest} = userDetails;

  return {
    user: {
      userId: userDetails.userId,
      name: userDetails.nameFirst + ' ' + userDetails.nameLast,
      ...rest
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
 */
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  let data = getData();
  
  const userIndex = isValidUser(authUserId);
  if (userIndex === -1) return {error:'invalid authUserId'};

  if (!isValidEmail(email)) return {error:'invalid email'};
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
export function isValidUser(authUserId) {
  return data.users.findIndex((array) => array.userId === authUserId);
}

/**
 * Given an email, return true if it is not used by the other and it is email
 * 
 * @param {number} authUserId - unique identifier for a user, 
 * set to -1 if it is new user
 * @param {strung} email - user's email
 * 
 * @return {object} return corresonding index of data.users
 */
export function isValidEmail(email, authUserId) {
  let isUsed = true;
  const isRegistered = data.users.filter((user) => user.email === email);
  
  // todo: make it more readable
  if (isRegistered.length === 0 || 
    (isRegistered.length === 1 && 
      data.users.includes((user) => user.userId === authUserId))) {
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
export function isValidname(name) {
  const reg = new RegExp(/^[a-zA-Z\s-\']+$/);

  if (name.length <== 2 || name.length >== 20 || reg.test(name)) return false;

  return true;
}
