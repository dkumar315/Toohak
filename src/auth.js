<<<<<<< src/auth.js

/**
 * Register a user with an email, password, and names.
 * 
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 * @returns {authUserId}
 */
function adminAuthRegister(email, password, nameFirst, nameLast) {


    return {authUserId: 1};
=======
/**
 * Given an admin user's authUserId, return details about the user.
 * 
 * @param {number} authUserId - unique identifier for a user
 * 
 * @returns {user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number, }} 
 * details about the user
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
 * @returns {} empty object
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
	return {};
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 * 
 * @param {number} authUserId - unique identifier for a user
 * @param {number} oldPassword - the current password stored requires update by the user
 * @param {number} newPassword - the replacement password submitted by user
 * 
 * @returns {} empty object
 */
function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {
	return {};
>>>>>>> src/auth.js
}