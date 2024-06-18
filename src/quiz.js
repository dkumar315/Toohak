import {
  getData,
  setData
} from './dataStore'

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