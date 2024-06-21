import {
  getData,
  setData
} from './dataStore.js';



export function validateUserId(authUserId) {
  const data = getData();
  const user = data.users.find(user => user.userId === authUserId);
  if (user === undefined) {
    return { error: 'AuthUserId is not valid' };
  }
  return null;
}

export function validateQuizId(quizId) {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz === undefined) {
    return { error: 'User does not own the quiz' };
  }
  return null;
}

export function validateOwnership(authUserId, quizId) {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz === undefined || quiz.creatorId !== authUserId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }
  return null;
}


/**
 * This function provides a list of all quizzes that 
 * are owned by the currently logged in user.
 * 
 * @param {number} authUserId - ID of the authorised user
 * 
 * @return {object} - Returns the details of the quiz
 */
export function adminQuizList(authUserId) {
  const userValidation = validateUserId(authUserId);
  if (userValidation) {
    return userValidation;
  }

  const data = getData();
  const quizArray = [];
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].creatorId === authUserId) {
      quizArray.push({ quizId: data.quizzes[i].quizId, name: data.quizzes[i].name });
    }
  }

  return { quizzes: quizArray };
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
  const userValidation = validateUserId(authUserId);
  if (userValidation) {
    return userValidation;
  }

  if (!/^[a-zA-Z0-9 ]{3,30}$/.test(name)) {
    return { error: 'Name contains invalid characters or is not the correct length.' };
  }

  const data = getData();
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].creatorId === authUserId && data.quizzes[i].name === name) {
      return { error: 'Name is already used by the current logged-in user for another quiz.' };
    }
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
  const userValidation = validateUserId(authUserId);
  if (userValidation) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation) {
    return ownershipValidation;
  }

  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (quizIndex !== -1) {
    data.quizzes.splice(quizIndex, 1);
  }
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
 * 
 */
export function adminQuizInfo(authUserId, quizId) {
  const userValidation = validateUserId(authUserId);
  if (userValidation) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation) {
    return ownershipValidation;
  }

  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  if (!quiz) {
    return { error: 'Quiz not found' };
  }

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
export function adminQuizNameUpdate(authUserId, quizId, name) {
  const userValidation = validateUserId(authUserId);
  if (userValidation) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation) {
    return ownershipValidation;
  }

  if (!/^[a-zA-Z0-9 ]{3,30}$/.test(name)) {
    return { error: 'Name contains invalid characters or is not the correct length.' };
  }

  const data = getData();
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].creatorId === authUserId && data.quizzes[i].quizId !== quizId && data.quizzes[i].name === name) {
      return { error: 'Name is already used by the current logged-in user for another quiz.' };
    }
  }

  let quiz = null;
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].quizId === quizId) {
      quiz = data.quizzes[i];
      break;
    }
  }

  if (quiz === null) {
    return { error: 'Quiz not found' };
  }

  quiz.name = name;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
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
  const userValidation = validateUserId(authUserId);
  if (userValidation) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation) {
    return ownershipValidation;
  }

  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length.' };
  }

  let quiz = null;
  const data = getData();
  for (let i = 0; i < data.quizzes.length; i++) {
    if (data.quizzes[i].quizId === quizId) {
      quiz = data.quizzes[i];
      break;
    }
  }

  if (quiz === null) {
    return { error: 'Quiz not found' };
  }

  quiz.description = description;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};
}
