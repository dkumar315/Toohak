import {
  getData, setData, Data, Quiz, Question,
  EmptyObject, ErrorObject, INVALID
} from './dataStore';
import { findUserId } from './auth';

const MAX_DESCRIPTION_LENGTH: number = 100;
const MIN_NAME_LENGTH: number = 3;
const MAX_NAME_LENGTH: number = 30;

export type QuizList = { quizzes: { quizId: number, name: string }[]; };
export type QuizId = { quizId: number; };
export type QuizInfo = {
  quizId: number;
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[],
  duration: number,
  thumbnailUrl: string,
}

export const validateQuiz = (
  authUserId: number,
  quizId: number
):true | ErrorObject => {
  const data: Data = getData();

  const quiz: Quiz | undefined = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: `Invalid quiz: quizId ${quizId} does not exist.` };
  }

  if (quiz.creatorId !== authUserId) {
    return { error: `UserId ${authUserId} does not own quizId ${quizId}.` };
  }

  return true;
};

/**
 * This function provides a list of all quizzes that
 * are owned by the currently logged in user.
 *
 * @param {string} token - ID of the authorised user
 *
 * @return {object} - Returns the details of the quiz
 */
export const adminQuizList = (token: string): QuizList => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const data: Data = getData();

  const quizArray: { quizId: number; name: string }[] = [];
  for (const quiz of data.quizzes) {
    if (quiz.creatorId === authUserId) {
      quizArray.push({ quizId: quiz.quizId, name: quiz.name });
    }
  }

  return { quizzes: quizArray };
};

/**
 * This function if given basic details about a new quiz,
 * creates one for the logged in user.
 *
 * @param {string} token - ID of the authorised user
 * @param {string} name - The name of the quiz
 * @param {string} description - The description of the quiz
 *
 * @return {object} - Returns the details of the quiz
 */
export const adminQuizCreate = (
  token: string,
  name: string,
  description: string
): QuizId => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  if (!/^[a-zA-Z0-9 ]{3,30}$/.test(name)) {
    throw new Error(`Name ${name} contains invalid characters or length.`);
  }

  const data: Data = getData();

  if (data.quizzes.some(quiz => quiz.creatorId === authUserId && quiz.name === name)) {
    throw new Error(`Name ${name} is already used by the current logged-in user` +
      'for another quiz');
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error('Description is more than 100 characters in length.');
  }

  data.sessions.quizCounter += 1;

  const newQuiz: Quiz = {
    quizId: data.sessions.quizCounter,
    creatorId: authUserId,
    name,
    description,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    numQuestions: 0,
    questionCounter: 0,
    questions: [],
    duration: 0,
    sessionIds: [],
    thumbnailUrl: ''
  };

  data.quizzes.push(newQuiz);

  setData(data);
  return { quizId: newQuiz.quizId };
};

/**
 * This function permanently removes the quiz,
 * when it is given the quiz as the input
 *
 * @param {string} token - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 *
 * @return {object} - Returns an empty object
 */
export const adminQuizRemove = (
  token: string,
  quizId: number
): EmptyObject => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const ownershipValidation = validateQuiz(authUserId, quizId);
  if (ownershipValidation !== true) {
    throw new Error(ownershipValidation.error);
  }

  const data: Data = getData();

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const [deletedQuiz] = data.quizzes.splice(quizIndex, 1);
  data.trashedQuizzes.push(deletedQuiz);

  setData(data);
  return {};
};

/**
 * This function gets all of the relevant information,
 * about the current quiz
 *
 * @param {string} token - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 *
 * @return {object} - Returns an empty object
 *
 */
export const adminQuizInfo = (
  token: string,
  quizId: number
): QuizInfo => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const ownershipValidation = validateQuiz(authUserId, quizId);
  if (ownershipValidation !== true) {
    throw new Error(ownershipValidation.error);
  }

  const data: Data = getData();

  const quiz: Quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl,
  };
};

/**
 * This function updates the name of the relevant quiz.
 *
 * @param {string} token - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 * @param {string} name - Name of the quiz
 *
 * @return {object} - Returns an empty object
 */
export const adminQuizNameUpdate = (
  token: string,
  quizId: number,
  name: string
): EmptyObject => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const ownershipValidation = validateQuiz(authUserId, quizId);
  if (ownershipValidation !== true) {
    throw new Error(ownershipValidation.error);
  }

  if (!name) {
    throw new Error(`Name ${name} not found`);
  }

  name = name.trim();

  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw new Error(`Name ${name} contains invalid characters,` +
      'only alphanumeric and spaces allowed');
  }

  if (name.length < MIN_NAME_LENGTH) {
    throw new Error(`Name is less than ${MIN_NAME_LENGTH} characters long.`);
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`Name is more than ${MAX_NAME_LENGTH} characters long.`);
  }

  const data: Data = getData();

  if (data.quizzes.find(
    q => q.creatorId === authUserId &&
    q.quizId !== quizId && q.name === name
  )) {
    throw new Error(`Name ${name} is already used by the current logged-in user for another quiz.`);
  }

  const quiz: Quiz = data.quizzes.find(q => q.quizId === quizId);

  quiz.name = name;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  return {};
};

/**
 * This function updates the description of the relevant quiz.
 *
 * @param {string} token - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 * @param {string} description - Description of the quiz
 *
 * @return {object} - Returns an empty object
 */
export const adminQuizDescriptionUpdate = (
  token: string,
  quizId: number,
  description: string
): EmptyObject => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const ownershipValidation = validateQuiz(authUserId, quizId);
  if (ownershipValidation !== true) {
    throw new Error(ownershipValidation.error);
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Description is more than ${MAX_DESCRIPTION_LENGTH} characters in length.`);
  }

  const data: Data = getData();

  const quiz: Quiz = data.quizzes.find(q => q.quizId === quizId);

  quiz.description = description;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  return {};
};

/**
 * This function permanently deletes specific quizzes currently sitting in the trash.
 *
 * @param {string} token - Token representing the user session
 * @param {number[]} quizIds - A JSONified array of quiz ID numbers
 *
 * @return {EmptyObject | ErrorObject} - Returns an empty object if successful,
 * or an error object if unsuccessful
 */
export const adminQuizTrashEmpty = (
  token: string,
  quizIds: number[]
): EmptyObject => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  // Parse quizIds into an array of numbers
  // const parsedQuizIds: number[] = JSON.parse(quizIds);
  const data: Data = getData();

  for (const quizId of quizIds) {
    const quizIndex = data.trashedQuizzes.findIndex(quiz => quiz.quizId === quizId);

    if (quizIndex === INVALID) {
      throw new Error(`Quiz Id ${quizId} is not currently in the trash.`);
    }

    const quiz = data.trashedQuizzes[quizIndex];

    if (quiz.creatorId !== authUserId) {
      throw new Error(`User Id ${authUserId} does not own quizId ${quizId}` +
       'or quiz does not exist.');
    }

    data.trashedQuizzes.splice(quizIndex, 1);
  }

  setData(data);
  return {};
};

/**
 * This function restores a quiz from the trash back to active quizzes.
 *
 * @param {string} token - ID of the authorised user
 *
 * @return {QuizListReturn | ErrorObject} - Returns the info of trashed quiz,
 * or an error object if unsuccessful
 */
export const adminQuizTrashList = (token: string): QuizList => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const data = getData();
  const trashedquizArray: { quizId: number; name: string }[] = data.trashedQuizzes
    .filter(quiz => quiz.creatorId === authUserId)
    .map(({ quizId, name }) => ({ quizId, name }));

  return { quizzes: trashedquizArray };
};

/**
 * This function restores a quiz from the trash back to active quizzes.
 *
 * @param {string} token - ID of the authorised user
 * @param {number} quizId - ID of the quiz
 *
 * @return {EmptyObject | ErrorObject} - Returns the entire dataset if successful,
 * or an error object if unsuccessful
 */
export const adminQuizRestore = (
  token: string,
  quizId: number
): EmptyObject => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const data: Data = getData();

  const trashedQuizIndex = data.trashedQuizzes
    .findIndex(trashQuiz => trashQuiz.quizId === quizId);
  if (trashedQuizIndex === INVALID) {
    throw new Error(`Quiz ${quizId} is not in the trash.`);
  }

  const quiz = data.trashedQuizzes[trashedQuizIndex];
  if (quiz.creatorId !== authUserId) {
    throw new Error(`UserId ${authUserId} does not own quizId ${quizId}.`);
  }

  if (data.quizzes.some(existingQuiz => existingQuiz.name === quiz.name)) {
    throw new Error(`Quiz name ${quiz.name} is already used by another active quiz.`);
  }

  // Restore the quiz by moving it back to the active quizzes
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes.push(quiz);
  data.trashedQuizzes.splice(trashedQuizIndex, 1);

  setData(data);
  return {};
};

/**
 * This function transfers the ownership of a quiz to another user.
 *
 * @param {string} token - Id of the authorised user
 * @param {number} quizId - Id of the quiz
 * @param {string} userEmail - email of the authorised user
 *
 * @return {object} - Returns an empty object
 */
export const adminQuizTransfer = (
  token: string,
  quizId: number,
  userEmail: string
): EmptyObject => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    throw new Error(`Invalid token ${token}.`);
  }

  const ownershipValidation = validateQuiz(authUserId, quizId);
  if (ownershipValidation !== true) {
    throw new Error(ownershipValidation.error);
  }

  const data: Data = getData();

  // Find the new owner's user ID by their email
  const newOwner = data.users.find(user => user.email === userEmail);
  if (!newOwner) {
    throw new Error(`User with email ${userEmail} does not exist.`);
  }

  const newOwnerId = newOwner.userId;

  if (newOwnerId === authUserId) {
    throw new Error(`Cannot transfer quiz ${quizId} to the current owner.`);
  }

  if (data.quizzes.some(quiz => quiz.creatorId === newOwnerId &&
    quiz.name === data.quizzes[quizId - 1].name)) {
    throw new Error(`Quiz with name ${data.quizzes[quizId - 1].name}` +
      'already exists for the new owner.');
  }

  const quiz: Quiz = data.quizzes.find(q => q.quizId === quizId);

  quiz.creatorId = newOwnerId;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);
  return {};
};

/**
 * This function update the imgUrl of a quiz
 *
 * @param {string} token - Id of the authorised user
 * @param {number} quizId - Id of the quiz
 * @param {string} imgUrl - imgUrl to update
 *
 * @return {object} - Returns an empty object
 */

export const adminQuizThumbnailUpdate = (
  quizId: number,
  imgUrl: string,
  token: string
): EmptyObject => {
  const authUserId = findUserId(token);

  if (authUserId === INVALID) {
    throw new Error('Invalid token');
  }

  const validation = validateQuiz(authUserId, quizId);
  if (validation !== true) {
    throw new Error(validation.error);
  }

  if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
    throw new Error('The imgUrl does not begin with "http://" or "https://"');
  }

  if (!/\.(jpg|jpeg|png)$/i.test(imgUrl)) {
    throw new Error('The imgUrl does not end with one of the following' +
      'filetypes: jpg, jpeg, png');
  }

  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  quiz.thumbnailUrl = imgUrl;
  quiz.timeLastEdited = Date.now();
  setData(data);

  return {};
};
