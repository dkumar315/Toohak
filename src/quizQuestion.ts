import {
  setData, getData,
  INVALID, Colours,
  Data, Quiz, Question, Answer, ErrorObject, EmptyObject
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

export interface NewQuestionIdReturn {
  newQuestionId: number;
}

/**
 * Create a new stub question for a particular quiz,
 * the timeLastEdited of quiz is set as the same as the question created time,
 * and the colours of all answers of that question are randomly generated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {string} questionBody - all user input inforamtion of a question
 *
 * @return {object} quizId - unique identifier for a qiz of a user
 * @return {object} error - token, quizId, or questionBody invalid
 */
export function adminQuizQuestionCreate(token: string, quizId: number,
  questionBody: QuestionBody): QuestionIdReturn | ErrorObject {
  // check token, quizId
  const isValidObj: IsValid = isValidIds(token, quizId, INVALID, true);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // check questionBody
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  isValidQuestionBody(questionBody, quiz.duration, isValidObj);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all valid
  const questionId: number = setQuestion(questionBody, isValidObj.quizIndex,
    quiz.questions.length, true, false);
  return { questionId: questionId };
}

/**
 * Update the relevant details of a particular question within a quiz.
 * the last edited time of quiz is also updated,
 * and the colours of all answers of the question are randomly generated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} questionId - a unique identifier for a valid question
 * @param {string} questionBody - all user input inforamtion of a question
 *
 * @return {object} empty object - inputs valid, successfully update question
 * @return {object} error - token, quizId, questionId, or questionBody invalid
 */
export function adminQuizQuestionUpdate(token: string, quizId: number,
  questionId: number, questionBody: QuestionBody): EmptyObject | ErrorObject {
  const isValidObj: IsValid = isValidIds(token, quizId, questionId, false);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };
  const { quizIndex, questionIndex } = isValidObj;

  const data: Data = getData();
  let quiz: Quiz = data.quizzes[quizIndex];

  const duration: number = quiz.duration - quiz.questions[questionIndex].duration;
  isValidQuestionBody(questionBody, duration, isValidObj);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all inputs valid, update the question
  setQuestion(questionBody, quizIndex, questionIndex, false, false);
  return {};
}

/**
 * A particular question gets duplicated to immediately 
 * after where the source question is
 * the last edited time of quiz is also updated,
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} questionId - a unique identifier for a valid question
 *
 * @return {object} empty object - inputs valid, successfully update question
 * @return {object} error - token, quizId, or questionId invalid
 */
export function adminQuizQuestionDuplicate(token: string, quizId: number,
  questionId: number): NewQuestionIdReturn | ErrorObject {
  // console.log(JSON.stringify(getData().quizzes, null, 2));
  const isValidObj: IsValid = isValidIds(token, quizId, questionId, false);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  const data: Data = getData();
  const { quizIndex, questionIndex } = isValidObj;
  const question: Question = data.quizzes[quizIndex].questions[questionIndex];

  const questionCopy: Question = JSON.parse(JSON.stringify(question));

  const newQuestionId: number = setQuestion(questionCopy, quizIndex, 
    questionIndex + 1, true, true);
  return { newQuestionId };
}

/**
 * Check if a given quizId is exist and own by the current authorized User
 *
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} authUserId - a unique identifier for a login user
 *
 * @return {object} isValidObj - check inputs and strore indexes when all valid
 * isValid: boolean - whether the token, quizId and questionId is valid
 * quizIndex: number - when isValid is true, corresponding index in the quizzes
 * questionIndex: number - when isValid is true, corresponding index in the quiz
 * errorMsg: string - if token, questionId or quizId invalid
 */
function isValidIds(token: string, quizId: number, questionId: number,
  isUpdate: boolean): IsValid {
  // check token
  const userId: number = findUserId(token);
  if (userId === INVALID) {
    const errorMsg: string = `Invalid token string: ${token} not exists.`;
    return { isValid: false, errorMsg };
  }

  // check quizId
  const isValidObj: IsValid = findQuizIndex(quizId, userId);
  if (!isValidObj.isValid) return isValidObj;

  // check questionId
  if (!isUpdate) {
    const isValidQuestion: IsValid = findQuestionIndex(isValidObj.quizIndex, questionId);
    if (!isValidQuestion.isValid) return isValidQuestion;
    isValidObj.questionIndex = isValidQuestion.questionIndex;
  }
  
  return isValidObj;
}

/**
 * Check if a given quizId is exist and own by the current authorized User
 *
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} authUserId - a unique identifier for a login user
 *
 * @return {object} isValidQuizIdObj - includes:
 * isValid: boolean - identify whether the quizId is found and own by the user
 * quizIndex: number - if quizId valid, quizIndex, otherwise index === INVALID
 * errorMsg: string - if quizId not found, or not own by current user
 */
function findQuizIndex(quizId: number, authUserId: number): IsValid {
  const data: Data = getData();
  const quizIndex: number = data.quizzes.findIndex(quiz =>
    quiz.quizId === quizId);

  // userId not exist
  if (quizIndex === INVALID) {
    const errorMsg: string = `Invalid quizId number: ${quizId} not exists.`;
    return { isValid: false, errorMsg };
  }

  // user does not own the quiz
  if (data.quizzes[quizIndex].creatorId !== authUserId) {
    const errorMsg: string = `Invalid quizId number: ${quizId} access denied.`;
    return { isValid: false, errorMsg };
  }

  return { isValid: true, quizIndex };
}

/**
 * Check if a given questionId is exist
 *
 * @param {object} quizIndex - where the quiz is located
 * @param {number} questionId - a unique identifier for an exist question
 *
 * @return {object} isValidQuestion - includes isValid and (index or errorMsg)
 * isValid: boolean - unique identifier for a quiz of a user
 * questionIndex: number - set isValidObj.questionId if questionId is valid
 * errorMsg: string - if questionId invalid, i.e. isValid is false
 */
function findQuestionIndex(quizIndex: Quiz, questionId: number): IsValid {
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  const questionIndex: number = quiz.questions.findIndex(quiz =>
    quiz.questionId === questionId);

  return questionIndex === INVALID
    ? { isValid: false, errorMsg: `Invalid questionId number: ${questionId}.` }
    : { isValid: true, questionIndex };
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
  const { question, duration, points, answers } = questionBody;
  const isValid: boolean = false;
  let errorMsg: string;

  if (question.length < QuestionLimit.MIN_LEN ||
    question.length > QuestionLimit.MAX_LEN) {
    // Question string has less than 5 or greater than 50 characters
    errorMsg = `Invalid question string Len: ${question.length}.`;
    return { isValid, errorMsg };
  }

  if (answers.length < AnswersLimit.MIN_COUNT ||
    answers.length > AnswersLimit.MAX_COUNT) {
    // question has more than 6 answers or less than 2 answers
    errorMsg = `Invalid answers number: ${answers.length}.`;
    return { isValid, errorMsg };
  }

  if (duration < DurationLimit.MIN_SINGLE ||
    quizDuration + duration > MAX_DURATIONS_SECS) {
    // question duration <== 0 or the sum of question durations in quiz > 3 mins
    errorMsg = `Invalid duration number: ${duration}.`;
    return { isValid, errorMsg };
  }

  if (points < PointsLimit.MIN || points > PointsLimit.MAX) {
    // points awarded are less than 1 or greater than 10
    errorMsg = `Invalid points number: ${points}.`;
    return { isValid, errorMsg };
  }

  if (!isValidAnswer(answers)) {
    // any answer len invalild, duplicate, or all answer is false
    errorMsg = `Invalid answers object: ${answers}.`;
    return { isValid, errorMsg };
  }

  return { isValid: true, ...isValidObj };
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
 * @param {number} isCreate - FALSE if add a new question, otherwise update
 *
 * @return {string} questionId - a global unique identifier of question
 */
function setQuestion(questionBody: QuestionBody, quizIndex: number, 
  questionIndex: number, isCreate: boolean, isDuplicate: boolean): number {
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  let questionId: number;

  if (isCreate) { // duplicate is also create question
    data.sessions.questionCounter += 1;
    questionId = data.sessions.questionCounter;
    quiz.numQuestions += 1;
  } else {
    questionId = quiz.questions[questionIndex].questionId;
    quiz.duration = quiz.duration - quiz.questions[questionIndex].duration;
  }

  let newQuestion: Question = {};
  if (isDuplicate) {
    newQuestion = questionBody as Question;
    newQuestion.questionId = questionId;
  } else {
    const { answers: answerBody, ...question } = questionBody;
    const answers: Answer[] = answerBody.map(({ answer, correct }, index) =>
    ({ answerId: index + 1, answer, colour: generateRandomColor(), correct }));
    newQuestion = { questionId, ...question, answers };
  }

  quiz.questions.splice(questionIndex, isCreate ? 0 : 1, newQuestion);
  quiz.duration += questionBody.duration;
  quiz.timeLastEdited = timeStamp();

  setData(data);
  return questionId;
}
