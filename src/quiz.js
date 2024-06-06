/**
 * This function provides a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId - ID of the authorised user
 * @return {object} - Returns the details of the quiz
 */
function adminQuizList(authUserId) {
  return {
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  };
}

/**
 * This function if given basic details about a new quiz, creates one for the logged in user.
 * 
 * @param {number} authUserId - ID of the authorised user
 * @param {string} name - The name of the quiz
 * @param {string} description - The description of the quiz
 * @return {object} - Returns the details of the quiz
 */
function adminQuizCreate(authUserId, name, description) {
  return {
    quizId: 2
  };
}

/**
 * This function updates the name of the relevant quiz.
 * 
 * @param {number} authUserId - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 * @param {string} name - Name of the quiz
 * @returns {object} - Returns an empty object
 */
function adminQuizNameUpdate(authUserId, quizId, name) {
    return {};
}

/**
 * This function updates the description of the relevant quiz.
 * 
 * @param {number} authUserId - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 * @param {string} description - Description of the quiz
 * @returns {object} - Returns an empty object
 */
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return {};
}