/**
 * This function provides a list of all quizzes that 
 * are owned by the currently logged in user.
 * 
 * @param {number} authUserId - ID of the authorised user
 * 
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
 * This function if given basic details about a new quiz, 
 * creates one for the logged in user.
 * 
 * @param {number} authUserId - ID of the authorised user
 * @param {string} name - The name of the quiz
 * @param {string} description - The description of the quiz
 * 
 * @return {object} - Returns the details of the quiz
 */
function adminQuizCreate(authUserId, name, description) {
  return {
    quizId: 2
  };
}

/**
 * This function permanently removes the quiz,
 * when it is given the quiz as the input 
 *
 * @param {number} authUserId - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 * 
 * @return {object} - Returns an empty object
 */
function adminQuizRemove(authUserId, quizId) {
  return {};
}

/**
 * This function gets all of the relevant information,
 * about the current quiz 
 *
 * @param {number} authUserId - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 * 
 * @return {object} - Returns an empty object
 */

function adminQuizInfo(authUserId, quizId) {
    // Validate user ID
    let user = null;
    for (let i = 0; i < data.users.length; i++) {
      if (data.users[i].uId === authUserId) {
        user = data.users[i];
        break;
      }
    }
    if (!user) {
      return { error: 'User ID is not valid' };
    }
  
    // Validate quiz ID
    let quiz = null;
    for (let i = 0; i < data.quizzes.length; i++) {
      if (data.quizzes[i].quizId === quizId) {
        quiz = data.quizzes[i];
        break;
      }
    }
    if (!quiz) {
      return { error: 'Quiz ID does not refer to a valid quiz' };
    }
  
    // Check ownership
    if (quiz.ownerId !== authUserId) {
      return { error: 'Quiz ID does not refer to a quiz that this user owns' };
    }
  
    // Return quiz details
    return {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
    };
  }

/**
 * This function updates the name of the relevant quiz.
 * 
 * @param {number} authUserId - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 * @param {string} name - Name of the quiz
 * 
 * @return {object} - Returns an empty object
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
 * 
 * @return {object} - Returns an empty object
 */
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {};
}