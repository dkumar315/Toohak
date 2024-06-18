import {
  getData,
  setData
} from './dataStore.js';

/**
 * This function provides a list of all quizzes that 
 * are owned by the currently logged in user.
 * 
 * @param {number} authUserId - ID of the authorised user
 * 
 * @return {object} - Returns the details of the quiz
 */
export function adminQuizList(authUserId) {
  const data = getData();
  const user = data.users.some(user => user.userId === authUserId);
  if (!user) {    
    return { error: 'AuthUserId is not valid' };
  }

  const quizarray = [];
  for (const quiz of data.quizzes) {
    if (quiz.creatorId === authUserId) {
      quizarray.push({quizId: quiz.quizId, name: quiz.name})
    }
  }
  return {
    quizzes: quizarray,
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
export function adminQuizCreate(authUserId, name, description) {
  const data = getData();
  const user = data.users.find(user => user.userId === authUserId);
  
  if (!user) {
    return { error: 'AuthUserId is not a valid user.' };
  }
  
  if (!/^[a-zA-Z0-9 ]{3,30}$/.test(name)) {
    return { error: 'Name contains invalid characters or is not the correct length.' };
  }
  
  if (data.quizzes.some(quiz => quiz.creatorId === authUserId && quiz.name === name)) {
    return { error: 'Name is already used by the current logged-in user for another quiz.' };
  }
  
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length.' };
  }
  
  const newQuiz = {
    quizId: data.quizzes.length + 1,
    creatorId: authUserId,
    name,
    description,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
  };

  data.quizzes.push(newQuiz);
  setData(data);

  return { quizId: newQuiz.quizId };
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
  let data = getData();

  // Validate user ID
  let userIndex = -1;
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].userId === authUserId) {
      userIndex = i;
      break;
    }
  }

  if (userIndex === -1) {
    return { error: 'User ID is not valid' };
  }

  // Validate quiz ID and ownership
  const quizExists = data.quizzes.some(q=> q.quizId === quizId);
  const quizIndex = data.quizzes.findIndex(q=> q.quizId === quizId);
  
  if (!quizExists) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  if (data.quizzes[quizIndex].creatorId !== authUserId) {
    return { error: 'User does not own the quiz' };
  }

  // Remove the quiz from the quizzes array by creating a new array without the quiz to be removed
  data.quizzes.splice(quizIndex, 1);

  setData(data);

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
export function adminQuizInfo(authUserId, quizId) {
  let data = getData();

  // Validate user ID
  let user = null;
  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].userId === authUserId) {
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
  if (quiz.creatorId !== authUserId) {
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