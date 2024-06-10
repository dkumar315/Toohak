import { getData, setData } from './dataStore';

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
export function adminUserDetails(authUserId) {
  const data = getData();
  const userIndex = isValidUser(authUserId);

  if (userIndex === -1) return {error:'invalid authUserId'};
  const userDetails = data.users[userIndex];
  // assigning it to resolve over long line
  const {userId, nameFirst, nameLast, email} = userDetails;
  const {numSuccessfulLogins, numFailedPasswordsSinceLastLogin} = userDetails;

  return {
    user: {
      userId: userId,
      name: nameFirst + ' ' + nameLast,
      email: email,
      numSuccessfulLogins: numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: numFailedPasswordsSinceLastLogin
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
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
  return {};
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
