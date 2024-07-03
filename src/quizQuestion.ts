import { 
  setData, getData,
  INVALID, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, COLORS,
  Data, Quiz, Question, Answer, ErrorObject, EmptyObject
} from './dataStore';
import { findUserId } from './auth';

const MAX_DURATIONS_MINS = 3;
const MINS_TO_SECS = 60;
export const MAX_DURATIONS_SECS = MAX_DURATIONS_MINS * MINS_TO_SECS;
export const MIN_POINT_AWARD = 1;
export const MAX_POINT_AWARD = 10;
export const MAX_ANSWER_STRING_LEN = 30;
const NO_PERMISSION = -2;

interface validateQuizId {
  isValid: boolean;
  quizIndex?: number;
  errorMsg?: ErrorObject;
}

export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
}

export interface AnswerInput {
  answer: string;
  correct: boolean;
}

export interface QuestionIdReturn {
  questionId: number;
}

/**
 * Create a new stub question for a particular quiz,
 * the timeLastEdited is set as the same as the created time, 
 * and the colours of all answers of that question are randomly generated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {string} questionBody - user's first name
 *
 * @return {object} quizId - unique identifier for a qiz of a user
 * @return {object} error - if email, password, nameFirst, nameLast invalid
 */
export function adminQuizQuestionCreate(token: string, quizId: number, questionBody: QuestionBody): QuestionIdReturn | ErrorObject {
  const userId: number = findUserId(token);
  if (userId === INVALID) return { error: `Invalid string - token: ${token} not exist.` };
  
  const validate: validateQuizId = isValidQuizId(quizId, userId);
  console.log(quizId);
  console.log(validate);
  if (!validate.isValid) return validate.errorMsg;

  // 400: !isValidQuestionBody
  // 200: create question (+ generateRandomColor), timeLastEdited
  return { questionId: 5546 }
}

/**
 * Check if a given quizId is exist and own by the current authorized User
 * 
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} authUserId - a unique identifier for a login user
 *
 * @return {object} quizId - unique identifier for a qiz of a user
 * @return {object} error - if quizId not found, or not own by current user
 */
function isValidQuizId(quizId: number, authUserId: number): validateQuizId {
  const data: Data = getData();
  const quizIndex: number = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  
  let validateQuiz: validateQuizId = { isValid: true, quizIndex: quizIndex};

  if (quizIndex === INVALID) {
    validateQuiz.isValid = false;
    validateQuiz.errorMsg = { error: `Invalid number - quizId: ${quizId} not exists.` };
    return validateQuiz;
  } 

  if (data.quizzes[quizIndex].creatorId !== authUserId) {
    validateQuiz.isValid = false;
    validateQuiz.errorMsg = { error: `Invalid number - quizId: ${quizId} not exists.` };
    return validateQuiz;
  }

  return validateQuiz;
}

/**
 * Check if input questionBody meets the requirement
 * 
 * @param {object} questionBody - include question, duration, points and answers
 *
 * @return {boolean} true - if all requirements below are satisfied:
 *  question string length > 5 characters && question string length < 50 characters,
 *  sum of the question durations <= 3 minutes (input duration of question in seconds),
 *  points awarded >= 1 && points awarded <= 10,
 *  answers length > 2 && answer length < 6,
 *  answer strings are not duplicates of one another,
 *  there are at least one correct answer
 */
function isValidQuestionBody(questionBody: QuestionBody): boolean {
  return false;
}

/**
 * check if answers have correct answers, and !isDuplicateAnswer
 * 
 * @param {array} answer - an array of answer string of questionBody
 *
 * @return {boolean} true - if no answer strings are duplicates of another
 */
function isValidAnswer(answer: string[]): boolean {
  return false;
}

/**
 * check any answer strings are duplicates of one another (within the same question)
 * 
 * @param {array} answer - an array of answer string of questionBody
 *
 * @return {boolean} true - if no answer strings are duplicates of another
 */
function isDuplicateAnswer(answer: string[]): boolean {
  return false;
}

/**
 * Randomly generate a colour for an answer of a question
 * when a quiz question is created or updated
 * 
 * @return {string} color - a name of a random color
 */
function generateRandomColor(): string {
  // index = Math.floor(Math.random() * colorRange.length);
  // return COLORS[index];
  return COLORS[0];
}

/**
 * generate a timeStamp for a quiz when a question is created or updated
 * 
 * @return {string} timeStamp - a name of a random color
 */
const timeStamp = (): number => Math.floor(Date.now() / 1000);
