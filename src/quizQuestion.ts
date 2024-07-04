import {
  setData, getData,
  INVALID, Colours, Data, Quiz, Question, Answer, ErrorObject, EmptyObject
} from './dataStore';
import { findUserId } from './auth';

export enum QuestionLimit {
  MIN_LEN = 5,
  MAX_LEN = 50
}

export enum AnswersLimit {
  MIN_COUNT = 2,
  MAX_COUNT = 6,
  MIN_STRING_LEN = 1,
  MAX_STRING_LEN = 30
}

export enum DurationLimit {
  MIN_SINGLE = 1,
  MIN_SUM_MINS = 3,
  MINS_TO_SECS = 60,
}
export const MAX_DURATIONS_SECS =
  DurationLimit.MIN_SUM_MINS * DurationLimit.MINS_TO_SECS;

export enum PointsLimit {
  MIN = 1,
  MAX = 10,
}

interface IsValid {
  isValid: boolean;
  quizIndex?: number;
  questionIndex?: number;
  errorMsg?: string;
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
 * the timeLastEdited of quiz is set as the same as the question created time,
 * and the colours of all answers of that question are randomly generated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {string} questionBody - user's first name
 *
 * @return {object} quizId - unique identifier for a qiz of a user
 * @return {object} error - if token, quizId, questionBody invalid
 */
export function adminQuizQuestionCreate(token: string, quizId: number,
  questionBody: QuestionBody): QuestionIdReturn | ErrorObject {
  const isUpdate = false;
  // check token, quizId, no questionId, questionBody
  const isValidObj: IsValid = { isValid: false };
  isValidIds(token, quizId, INVALID, questionBody, isUpdate, isValidObj);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all valid
  const data: Data = getData();
  const position = data.quizzes[isValidObj.quizIndex].questions.length;
  const questionId: number = setQuestion(
    questionBody, isValidObj.quizIndex, position, isUpdate);
  return { questionId: questionId };
}

/**
 * Update the relevant details of a particular question within a quiz.
 * the last edited time of quiz is also updated,
 * and the colours of all answers of the question are randomly generated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {string} questionBody - user's first name
 *
 * @return {object} empty object - inputs valid, successfully update question
 * @return {object} error - if token, quizId, questionId, questionBody invalid
 */
export function adminQuizQuestionUpdate(token: string, quizId: number,
  questionId: number, questionBody: QuestionBody): EmptyObject | ErrorObject {
  const isUpdate = true;
  // check token, quizId, questionId, questionBody
  const isValidObj: IsValid = { isValid: false };
  isValidIds(token, quizId, questionId, questionBody, isUpdate, isValidObj);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all inputs valid, update the question
  setQuestion(questionBody, isValidObj.quizIndex, isValidObj.questionIndex, isUpdate);
  return {};
}

/**
 * Check if a given quizId is exist and own by the current authorized User
 *
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} authUserId - a unique identifier for a login user
 *
 * @return {object}
 * isValid: boolean - identify whether the quizId is found and own by the user
 * quizIndex: number - if quizId valid, set isValidObj.quizIndex
 * questionIndex: number - if questionId valid, set isValidObj.questionIndex
 * errorMsg: string - if quizId not found, or not own by current user
 */
function isValidIds(token: string, quizId: number, questionId: number,
  questionBody: QuestionBody, isUpdate: boolean, isValidObj: IsValid): IsValid {
  // check token
  const userId: number = findUserId(token);
  if (userId === INVALID) {
    isValidObj.errorMsg = `Invalid token string: ${token} not exists.`;
    return isValidObj;
  }

  // check quizId
  findQuizIndex(quizId, userId, isValidObj);
  if (!isValidObj.isValid) return isValidObj;

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];

  // check questionId
  if (isUpdate) {
    // notice here isValidObj.isValid = true;
    findQuestionIndex(quiz, questionId, isValidObj);
    if (!isValidObj.isValid) return isValidObj;
  }

  // check questionBody
  isValidObj.isValid = false;
  let duration: number = quiz.duration;
  if (isUpdate) duration -= quiz.questions[isValidObj.questionIndex].duration;
  isValidQuestionBody(questionBody, duration, isValidObj);
  if (!isValidObj.isValid) return isValidObj;

  return isValidObj;
}

/**
 * Check if a given quizId is exist and own by the current authorized User
 *
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} authUserId - a unique identifier for a login user
 *
 * @return {object}
 * isValid: boolean - identify whether the quizId is found and own by the user
 * quizIndex: number - if quizId valid, quizIndex, otherwise index === INVALID
 * errorMsg: string - if quizId not found, or not own by current user
 */
function findQuizIndex(quizId: number, authUserId: number,
  isValidObj: IsValid): IsValid {
  const data: Data = getData();
  const quizIndex: number = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  // userId not exist
  if (quizIndex === INVALID) {
    isValidObj.errorMsg = `Invalid quizId number: ${quizId} not exists.`;
    return isValidObj;
  }

  // user does not own the quiz
  if (data.quizzes[quizIndex].creatorId !== authUserId) {
    isValidObj.errorMsg = `Invalid quizId number: ${quizId} access denied.`;
    return isValidObj;
  }

  isValidObj.isValid = true;
  isValidObj.quizIndex = quizIndex;
  return isValidObj;
}

/**
 * Check if a given questionId is exist
 *
 * @param {object} quiz - where the question is located
 * @param {number} questionId - a unique identifier for an exist question
 *
 * @return {object} isValidQuestion - includes isValid and (index or errorMsg)
 * isValid: boolean - unique identifier for a quiz of a user
 * questionIndex: number - set isValidObj.questionId if questionId is valid
 * errorMsg: string - if questionId invalid, i.e. isValid is false
 */
function findQuestionIndex(quiz: Quiz, questionId: number,
  isValidObj: IsValid): IsValid {
  const questionIndex = quiz.questions.findIndex(quiz =>
    quiz.questionId === questionId
  );

  if (questionIndex === INVALID) {
    isValidObj.isValid = false;
    isValidObj.errorMsg = `Invalid questionId number: ${questionId} not exists.`;
    return isValidObj;
  }

  isValidObj.questionIndex = questionIndex;
  return isValidObj;
}

/**
 * Check if input questionBody meets the requirement
 *
 * @param {object} questionBody - include question, duration, points and answers
 *
 * @return {object} isValidQuestion - includes isValid or and errorMsg
 * isValid: boolean - true if requirements all satisfied
 * errorMsg: ErrorObject - isValid is false, an errorMsg will be set
 */
function isValidQuestionBody(questionBody: QuestionBody,
  quizDuration: number, isValidObj: IsValid): IsValid {
  isValidObj.isValid = false;
  // Question string invalid when has less than 5 or greater than 50 characters
  const questionLen = questionBody.question.length;
  if (questionLen < QuestionLimit.MIN_LEN || questionLen > QuestionLimit.MAX_LEN) {
    isValidObj.errorMsg = `Invalid question string Len: ${questionLen}.`;
    return isValidObj;
  }

  // question invalid when has more than 6 answers or less than 2 answers
  const answersLen = questionBody.answers.length;
  if (answersLen < AnswersLimit.MIN_COUNT || answersLen > AnswersLimit.MAX_COUNT) {
    isValidObj.errorMsg = `Invalid answers number: ${answersLen}.`;
    return isValidObj;
  }

  // question duration invalid when it is not a positive number (duration <== 0)
  // or the sum of the question durations in the quiz exceeds 3 minutes
  if (questionBody.duration < DurationLimit.MIN_SINGLE ||
    quizDuration + questionBody.duration > MAX_DURATIONS_SECS) {
    isValidObj.errorMsg = `Invalid duration number: ${questionBody.duration}.`;
    return isValidObj;
  }

  // points awarded invalid when points are less than 1 or greater than 10
  if (questionBody.points < PointsLimit.MIN ||
    questionBody.points > PointsLimit.MAX) {
    isValidObj.errorMsg = `Invalid points number: ${questionBody.points}.`;
    return isValidObj;
  }

  // answers invalid when answer len invalild, duplicate, or all answers false
  if (!isValidAnswer(questionBody.answers)) {
    isValidObj.errorMsg = `Invalid answers object: ${questionBody.answers}.`;
    return isValidObj;
  }

  isValidObj.isValid = true;
  return isValidObj;
}

/**
 * check if answers have correct answers, and !isDuplicateAnswer
 *
 * @param {array} answers - an array of answer string of questionBody
 *
 * @return {boolean} true - if no answer strings are duplicates of another
 */
function isValidAnswer(answers: AnswerInput[]): boolean {
  const invalidAnswerLen = answers.some(ans =>
    ans.answer.length < AnswersLimit.MIN_STRING_LEN ||
    ans.answer.length > AnswersLimit.MAX_STRING_LEN);

  const uniqueAnswers: Set<string> = new Set(answers.map(ans => ans.answer));
  const hasDuplicateAnswer: boolean = uniqueAnswers.size !== answers.length;

  const hasCorrectAnswer = answers.some(answer => answer.correct);

  return !invalidAnswerLen && !hasDuplicateAnswer && hasCorrectAnswer;
}

/**
 * Randomly generate a colour for an answer of a question
 * when a quiz question is created or updated
 *
 * @return {string} color - a name of a random color
 */
function generateRandomColor(): Colours {
  const colours = Object.values(Colours);
  const randomIndex: number = Math.floor(Math.random() * colours.length);
  return colours[randomIndex];
}

/**
 * generate a timeStamp for a quiz when a question is created or updated
 *
 * @return {string} questionId - a name of a random color
 */
const timeStamp = (): number => Math.floor(Date.now() / 1000);

/**
 * set data to corresponding location, if isCreateNew is true, a new question
 * wil be create, otherwise, it will replace the question in questionIndex
 *
 * @param {object} questionBody - an object contains all info, expect valid
 * @param {number} quizIndex - the index of quiz the question locate
 * @param {number} questionIndex - the index of question in the quiz,
 *                 if isCreate, questionIndex = quiz.questions.length
 * @param {number} isUpdate - FALSE if add a new question, otherwise update
 *
 * @return {string} questionId - a global unique identifier of question
 */
function setQuestion(questionBody: QuestionBody,
  quizIndex: number, questionIndex: number, isUpdate: boolean): number {
  const { answers: answerBody, ...question } = questionBody;
  const answers: Answer[] = answerBody.map(({ answer, correct }, index) =>
    ({ answerId: index + 1, answer, colour: generateRandomColor(), correct })
  );
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  let questionId: number;

  if (!isUpdate) {
    data.sessions.questionCounter += 1;
    questionId = data.sessions.questionCounter;
    quiz.numQuestions += 1;
  } else {
    questionId = quiz.questions[questionIndex].questionId;
    quiz.duration = quiz.duration - quiz.questions[questionIndex].duration;
  }

  const newQuestion: Question = { questionId, ...question, answers };
  quiz.questions.splice(questionIndex, isUpdate ? 1 : 0, newQuestion);
  quiz.duration += questionBody.duration;
  quiz.timeLastEdited = timeStamp();

  setData(data);
  return questionId;
}
