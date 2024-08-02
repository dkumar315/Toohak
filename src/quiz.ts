import {
  getData, setData, Data, Quiz, Question,
  EmptyObject, ErrorObject, INVALID, States
} from './dataStore';
import {
  findUserId, isValidIds, IsValid, timeStamp, isValidImgUrl
} from './helperFunctions';

enum QuizLimits {
  MAX_DESCRIPTION_LENGTH = 100,
  MIN_NAME_LENGTH = 3,
  MAX_NAME_LENGTH = 30
}

export interface QuizList { quizzes: QuizInfoBrief[] }
interface QuizInfoBrief { quizId: number, name: string }
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
export type Helper = ErrorObject | EmptyObject;

const isValidQuizName = (name: string): Helper => {
  name = name.trim();
  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    return { error: `Name '${name}' contains invalid characters.` };
  }

  if (name.length < QuizLimits.MIN_NAME_LENGTH) {
    return { error: `Name length is less than ${QuizLimits.MIN_NAME_LENGTH}.` };
  } else if (name.length > QuizLimits.MAX_NAME_LENGTH) {
    return { error: `Name length is more than ${QuizLimits.MAX_NAME_LENGTH}.` };
  }

  return {};
};

const isValidDescription = (description: string): Helper => {
  if (description.length > QuizLimits.MAX_DESCRIPTION_LENGTH) {
    return {
      error: 'Description is more than' +
    `${QuizLimits.MAX_DESCRIPTION_LENGTH} characters in length.`
    };
  }

  return {};
};

const isUsedName = (userId: number, quizId: number, name: string): Helper => {
  const data: Data = getData();
  const nameExist: boolean = data.quizzes.some(quiz =>
    quiz.creatorId === userId && quiz.quizId !== quizId &&
    quiz.name === name);
  if (nameExist) {
    return {
      error: `Name '${name}' is already used by the current` +
    'logged-in user for another quiz.'
    };
  }
  return {};
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

  const quizzes: QuizInfoBrief[] = data.quizzes
    .filter(quiz => quiz.creatorId === authUserId)
    .map(({ quizId, name }) => ({ quizId, name }));

  return { quizzes };
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

  const errorMsg: string = isValidQuizName(name).error ||
  isValidDescription(description).error ||
  isUsedName(authUserId, INVALID, name).error;
  if (errorMsg) throw new Error(errorMsg);

  const data: Data = getData();
  const newQuiz: Quiz = {
    quizId: ++data.sessions.quizCounter,
    creatorId: authUserId,
    name,
    description,
    timeCreated: timeStamp(),
    timeLastEdited: timeStamp(),
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
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz = data.quizzes[isValidObj.quizIndex];
  const hasActiveSessions = quiz.sessionIds.some(sessionId => {
    const session = data.quizSessions.find(session => 
      session.metadata.quizId === quizId);
    return session && session.state !== States.END;
  });

  if (hasActiveSessions) {
    throw new Error(`Cannot remove quiz ${quizId} with active sessions.`);
  }

  const [deletedQuiz] = data.quizzes.splice(isValidObj.quizIndex, 1);
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
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];

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
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  const errorMsg: string = isValidQuizName(name).error ||
  isUsedName(quiz.creatorId, quizId, name).error;
  if (errorMsg) throw new Error(errorMsg);

  quiz.name = name;
  quiz.timeLastEdited = timeStamp();

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
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const descriptionCheck: Helper = isValidDescription(description);
  if ('error' in descriptionCheck) throw new Error(descriptionCheck.error);

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  quiz.description = description;
  quiz.timeLastEdited = timeStamp();

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
  const data: Data = getData();
  const quizIndexes: number[] = [];
  quizIds.forEach((quizId) => {
    const quizIndex: number = data.trashedQuizzes.findIndex((quiz: Quiz) =>
      quiz.quizId === quizId);
    if (quizIndex === INVALID) {
      throw new Error(`Quiz Id ${quizId} is not currently in the trash.`);
    }
    if (data.trashedQuizzes[quizIndex].creatorId !== authUserId) {
      throw new Error(`User Id ${authUserId} does not own quizId ${quizId}.`);
    }

    quizIndexes.push(quizIndex);
  });

  quizIndexes.forEach((quizIndex) => data.trashedQuizzes.splice(quizIndex, 1));

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
  const quizzes: QuizInfoBrief[] = data.trashedQuizzes
    .filter(quiz => quiz.creatorId === authUserId)
    .map(({ quizId, name }) => ({ quizId, name }));

  return { quizzes };
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
  const trashedQuizIndex: number = data.trashedQuizzes
    .findIndex(trashQuiz => trashQuiz.quizId === quizId);

  if (trashedQuizIndex === INVALID) {
    throw new Error(`Quiz ${quizId} is not in the trash.`);
  }

  const quiz = data.trashedQuizzes[trashedQuizIndex];
  if (quiz.creatorId !== authUserId) {
    throw new Error(`UserId ${authUserId} does not own quizId ${quizId}.`);
  }

  const nameCheck: Helper = isUsedName(authUserId, INVALID, quiz.name);
  if ('error' in nameCheck) throw new Error(nameCheck.error);

  // Restore the quiz by moving it back to the active quizzes
  quiz.timeLastEdited = timeStamp();
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
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();

  // Find the new owner's user ID by their email
  const newOwner = data.users.find(user => user.email === userEmail);
  if (!newOwner) {
    throw new Error(`User with email ${userEmail} does not exist.`);
  }

  const newOwnerId: number = newOwner.userId;
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];

  if (newOwnerId === quiz.creatorId) {
    throw new Error(`Cannot transfer quiz ${quizId} to the current owner.`);
  }

  const nameCheck: Helper = isUsedName(newOwnerId, INVALID, quiz.name);
  if ('error' in nameCheck) {
    throw new Error(`Quiz name '${quiz.name}' already exists for the new owner.`);
  }

  quiz.creatorId = newOwnerId;
  quiz.timeLastEdited = timeStamp();

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
  const isValidObj: IsValid = isValidIds(token, quizId);
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  if (!isValidImgUrl(imgUrl)) {
    throw new Error('The imgUrl does not begin with "http://" or "https://"' +
      'or does not end with one of the following jpg, jpeg, png');
  }

  const data = getData();
  const quiz = data.quizzes[isValidObj.quizIndex];
  quiz.thumbnailUrl = imgUrl;
  quiz.timeLastEdited = timeStamp();
  setData(data);

  return {};
};
