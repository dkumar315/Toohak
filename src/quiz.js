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