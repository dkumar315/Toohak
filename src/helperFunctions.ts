import { getData, INVALID, Quiz, Data, ErrorObject, Player, QuizSession } from './dataStore';
import { findUserId } from './auth';
export interface IsValid {
  isValid: boolean;
  quizIndex?: number;
  errorMsg?: string;
}

/**
 * Given an admin user's token, return userId if valid
 *
 * @param {string} token - unique identifier for a user
 *
 * @return {number} userId - corresponding userId of a token
 */
export { findUserId } from './auth';

/**
 * Check if a given quizId is exist and own by the current authorized User
 *
 * @param {number} quiz - a valid quiz
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} authUserId - a unique identifier for a login user
 *
 * @return {object} isValidQuizIdObj - includes:
 * isValid: boolean - identify whether the quizId is found and own by the user
 * quizIndex: number - if quizId valid, quizIndex, otherwise index === INVALID
 * errorMsg: string - if quizId not found, or not own by current user
 */
export const findQuizIndex = (
  quizzes: Quiz[],
  quizId: number,
  authUserId: number
): IsValid => {
  const quizIndex: number = quizzes.findIndex((quiz: Quiz) => quiz.quizId === quizId);
  // userId not exist
  if (quizIndex === INVALID) {
    return isvalidErrorObj(`Invalid quizId number: ${quizId} not exists.`);
  }

  // user does not own the quiz
  if (quizzes[quizIndex].creatorId !== authUserId) {
    return isvalidErrorObj(`Invalid quizId number: ${quizId} access denied.`);
  }

  return { isValid: true, quizIndex };
};

/**
 * Return an object of { isValid, errorMsg } for isValid function when invalid
 *
 * @param {string} errorMsg - specific error meaasge
 *
 * @return {object} isValidObj - an object contains errorMsg
 */
export const isvalidErrorObj = (errorMsg: string): IsValid => {
  return { isValid: false, errorMsg };
};

/**
 * generate a timeStamp for a quiz when a question is changed
 *
 * @return {string} timeStamp - unix time in seconds, rounded with Math.floor
 */
export const timeStamp = (): number => Math.floor(Date.now() / 1000);

/**
 * check token, quizId, or and quiz in trash
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {boolean} checkTrashQuiz - whether check quizId in trash
 *
 * @return {object} isValidObj - isValid, errorMsg if invalid
 */
export const isValidIds = (
  token: string,
  quizId: number
): IsValid => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    return isvalidErrorObj(`Invalid token string: ${token}`);
  }

  const data: Data = getData();
  const isValidQuiz: IsValid = findQuizIndex(data.quizzes, quizId, authUserId);
  if (isValidQuiz.isValid) return isValidQuiz;

  return isvalidErrorObj(`Invalid quizId number: ${quizId}`);
};

export const isValidIdSession = (
  token: string,
  quizId: number,
  notAllowTrashQuiz: boolean
): IsValid => {
  const authUserId: number = findUserId(token);
  if (authUserId === INVALID) {
    return isvalidErrorObj(`Invalid token string: ${token}`);
  }

  const data: Data = getData();
  let isValidQuiz: IsValid = findQuizIndex(data.quizzes, quizId, authUserId);
  if (isValidQuiz.isValid) return isValidQuiz;

  isValidQuiz = findQuizIndex(data.trashedQuizzes, quizId, authUserId);
  if (notAllowTrashQuiz) {
    if (isValidQuiz.isValid) {
      return isvalidErrorObj(`Invalid quiz in trash: ${quizId}`);
    }
  } else if (isValidQuiz.isValid) {
    return isValidQuiz;
  }

  return isValidQuiz;
};

/**
 * check if a imgUrl is valid
 *
 * @param {string} imgUrl - thumbnail
 *
 * @return {boolean} true - if extension and protocol valid
 * extension is end with .jpg, .jpeg or .png (case insensitive), and
 * protocol http or https
 */
export const isValidImgUrl = (thumbnailUrl: string): boolean => {
  const validExtension = /\.(jpe?g|png)$/i.test(thumbnailUrl);
  const validProtocol = /^(http:\/\/|https:\/\/)/.test(thumbnailUrl);
  return validExtension && validProtocol;
};

export type PlayerIndices = {
  sessionIndex: number;
  playerIndex: number;
};

export const findSessionPlayer = (playerId: number): PlayerIndices | ErrorObject => {
  const data: Data = getData();
  const sessionIndex: number = data.quizSessions
    .findIndex((session: QuizSession) => session
      .players.some((player: Player) => player.playerId === playerId));

  if (sessionIndex === INVALID) {
    return { error: `Invalid playerId number: ${playerId} not exist.` };
  }

  const playerIndex: number = data.quizSessions[sessionIndex]
    .players.findIndex(player => player.playerId === playerId);

  return { sessionIndex, playerIndex };
};
