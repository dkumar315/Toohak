
/**
 * This function gets all of the relevant information,
 * about the current quiz 
 *
 * @param {number} authUserId - ID of the authorized user
 * @param {number} quizId - ID of the quiz
 * @returns {object}
 */
function adminQuizInfo(authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
      };
}