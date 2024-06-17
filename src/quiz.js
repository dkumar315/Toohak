import {
  getData,
  setData,
} from './dataStore';

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
export function adminQuizNameUpdate(authUserId, quizId, name) {
  const data = getData();
  
  const user = data.users.find(u => u.userId === authUserId);
  if (!user) {
    return { error: 'AuthUserId is not a valid user' };
  }
  
  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }
  
  if (quiz.creatorId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }
  
  for (const letter of name) {
    if (!((letter >= 'A' && letter <= 'Z') || (letter >= 'a' && letter <= 'z') || (letter >= '0' && letter <= '9') || (letter === ' '))) {
      return { error: 'Name contains invalid characters, valid characters are alphanumeric and spaces' };
    }
  }
  
  if (name.length < 3) {
    return { error: 'Name is less than 3 characters long' };
  }

  if (name.length > 30) {
    return { error: 'Name is more than 30 characters long.' };
  }
  
  const nameInUse = data.quizzes.find(q => q.creatorId === authUserId && q.quizId !== quizId && q.name === name);
  if (nameInUse) {
    return { error: 'Name is already used by the current logged in user for another quiz' };
  }
  
  quiz.name = name;
  setData(data);

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
export function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {};
}