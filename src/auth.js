import isEmail from 'validator/lib/isEmail';
import { getData } from './dataStore';

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


  const authUserId = data.users.length + 1;

  // Check if email is valid
  if (!isEmail(email)) {
    return {error: 'Invalid email.'};
  }

  // check nameFirst meets requirements
  if (!/^[a-zA-Z\s\-']{2,20}$/.test(nameFirst)) {
    return { 
      error: 'NameFirst must only contain letters, spaces, hyphens, or apostrophes.'
    };
  }

  // Check nameLast meets requirements
  if (!/^[a-zA-Z\s\-']{2,20}$/.test(nameLast)) {
    return { 
      error: 'NameLast must only contain letters, spaces, hyphens, or apostrophes.' 
    };
  }

  // Check if password doesn't meet requirements
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
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
function adminAuthLogin(email, password) {

  return {authUserId: 1};
}

/**
 * Given an admin user's authUserId, return details about the user.
 * 
 * @param {number} authUserId - unique identifier for a user
 * 
 * @return {object} return userDetails
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