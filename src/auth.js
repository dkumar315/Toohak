/** 
* Validates a user's login, given their email and password. 
*  
* @param {string} email - user's email 
* @param {string} password - user's matching password 
*  
* @return {number} authUserId - unique identifier for a user 
*/ 
function adminAuthLogin(email, password) { 
  const user = data.users.find(user => user.email === email);
  if (!user) {
    return {error: 'Email address does not exist.'};
  } 

  if (user.password !== password) {
    return {error: 'Password is incorrect.'};
  } 

  return {authUserId: user.authUserId};
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