/**
 * Given an admin user's authUserId, return details about the user.
 * 
 * @param {number} authUserId - unique identifier for a user
 * 
 * @returns {user: {userId: number, name: string, email: string, numSuccessfulLogins: number, numFailedPasswordsSinceLastLogin: number, }} details about the user
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