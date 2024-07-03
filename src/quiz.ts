import {
  getData,
  setData
} from './dataStore';
import { findUserId } from './auth';

const MAX_DESCRIPTION_LENGTH = 100;
const FALSE_INDEX = -1; 
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 30;

export function validateUserId(authUserId) {
  const data = getData();

  const user = data.users.find(user => user.userId === authUserId);
  if (!user) {
    return { error: `AuthUserId ${authUserId} is not valid` };
  }

  return true;
}


export function validateQuizId(quizId) {
  const data = getData();

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: `QuizId ${quizId} is not valid` };
  }

  return true;
}


export function validateOwnership(authUserId, quizId) {
  const data = getData();

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: `QuizId ${quizId} does not exist` };
  }

  if (quiz.creatorId !== authUserId) {
    return { error: `UserId ${authUserId} does not own QuizId ${quizId}` };
  }

  return true;
}

/**
 * This function provides a list of all quizzes that 
 * are owned by the currently logged in user.
 * 
 * @param {number} authUserId - ID of the authorised user
 * 
 * @return {object} - Returns the details of the quiz
 */
export function adminQuizList(token) {
  const authUserId = findUserId(token);
  const userValidation = validateUserId(authUserId);
  if (userValidation !== true) {
    return userValidation;
  }

  const data = getData();
  const quizArray = [];
  for (const quiz of data.quizzes) {
    if (quiz.creatorId === authUserId) {
      quizArray.push({quizId: quiz.quizId, name: quiz.name})
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
export function adminQuizCreate(token, name, description) {
  const authUserId = findUserId(token);
  const userValidation = validateUserId(authUserId);

  if (userValidation !== true) {
    return userValidation;
  }

  if (!/^[a-zA-Z0-9 ]{3,30}$/.test(name)) {
    return { error: 'Name contains invalid characters or is not the correct length.' };
  }

  const data = getData();
  if (data.quizzes.some(quiz => quiz.creatorId === authUserId && quiz.name === name)) {
    return { error: `Name ${name} is already used by the current logged-in user for another quiz.` };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Description is more than 100 characters in length.' };
  }

  const newQuiz = {
    quizId: data.quizzes.length + 1,
    creatorId: authUserId,
    name,
    description,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    numQuestions: 0,
    questions: [],
    duration: 0,
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
export function adminQuizRemove(token, quizId) {
    const authUserId = findUserId(token);
  const userValidation = validateUserId(authUserId);
  

  if (userValidation !== true) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation !== true) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation !== true) {
    return ownershipValidation;
  }

  const data = getData();
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  if (quizIndex !== FALSE_INDEX) {
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
export function adminQuizInfo(token, quizId) {
  const authUserId = findUserId(token);
  const userValidation = validateUserId(authUserId);
  if (userValidation !== true) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation !== true) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation !== true) {
    return ownershipValidation;
  }

  const data = getData();

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: `Quiz with ID ${quizId} not found` };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
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
  

  if (userValidation !== true) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation !== true) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation !== true) {
    return ownershipValidation;
  }

  if (!name) {
    return { error: `Name ${name} not found` };
  }
  
  name = name.trim();

  for (const letter of name) {
    if (!((letter >= 'A' && letter <= 'Z') || 
      (letter >= 'a' && letter <= 'z') || 
      (letter >= '0' && letter <= '9') || 
      (letter === ' '))) {
      return { error: `Name ${name} contains invalid characters, only alphanumeric and spaces allowed` };
    }
  }
  
  if (name.length < MIN_NAME_LENGTH) {
    return { error: `Name is less than ${MIN_NAME_LENGTH} characters long.` };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name is more than ${MAX_NAME_LENGTH} characters long.` };
  }
  
  const data = getData();
  
  const nameInUse = data.quizzes.find(q => q.creatorId === authUserId && q.quizId !== quizId && q.name === name);
  if (nameInUse) {
    return { error: `Name ${name} is already used by the current logged-in user for another quiz.` };
  }

  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    return { error: `Quiz ${quizId} not found` };
  }

  if (quiz.creatorId !== authUserId) {
    return { error: `Quiz ID ${quizId} does not refer to a quiz that this user owns` };
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
  if (userValidation !== true) {
    return userValidation;
  }

  const quizValidation = validateQuizId(quizId);
  if (quizValidation !== true) {
    return quizValidation;
  }

  const ownershipValidation = validateOwnership(authUserId, quizId);
  if (ownershipValidation !== true) {
    return ownershipValidation;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description is more than ${MAX_DESCRIPTION_LENGTH} characters in length.` };
  }
  
  const data = getData();

  const quiz = data.quizzes.find(q => q.quizId === quizId);
  if (!quiz) {
    return { error: `Quiz ${quizId} not found in the datastore` };
  }

  quiz.description = description;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};
}
