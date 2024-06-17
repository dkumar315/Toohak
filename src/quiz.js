import { getData } from "./dataStore";

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
  export function adminQuizRemove(authUserId, quizId) {
    // Validate user ID
    let data = getData();
    let userIndex = -1;
    for (let i = 0; i < data.users.length; i++) {
      if (data.users[i].id === authUserId) {
        userIndex = i;
        break;
      }
    }
    if (userIndex === -1) {
      return { error: 'User ID is not valid' };
    }
  
    // Validate quiz ID and ownership
    const quizExists = data.quizzes.some(q=> q.id === quizId);
    const quizIndex = data.quizzes.findIndex(q=> q.id === quizId);
   
    if (!quizExists) {
      return { error: 'Quiz ID does not refer to a valid quiz' };
    }
    if (data.quizzes[quizIndex].ownerId !== authUserId) {
      return { error: 'User does not own the quiz' };
    }
  
    // Remove the quiz from the quizzes array by creating a new array without the quiz to be removed
    data.quizzes.splice(quizIndex, 1);
  
    // Remove the quiz ID from the user's quizzes array by creating a new array without the quiz ID to be removed
    // const newUserQuizzes = [];
    // for (let i = 0; i < data.users[userIndex].quizzes.length(); i++) {
    //   if (data.users[userIndex].quizzes[i] !== quizId) {
    //     newUserQuizzes.push(data.users[userIndex].quizzes[i]);
    //   }
    // }
    // data.users[userIndex].quizzes = newUserQuizzes;
  
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
    return {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
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