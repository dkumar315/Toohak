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
  const isUpdate = false;
  // check token, quizId, no questionId, questionBody
  const isValidObj: IsValid = isValidIds(token, quizId, INVALID,
    questionBody, isUpdate);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all valid
  const data: Data = getData();
  const position = data.quizzes[isValidObj.quizIndex].questions.length;
  const questionId: number = setQuestion(questionBody, isValidObj.quizIndex,
    position, isUpdate);
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
  const isUpdate = true;

  const isValidObj: IsValid = isValidIds(token, quizId, questionId,
    questionBody, isUpdate);
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all inputs valid, update the question
  setQuestion(questionBody, isValidObj.quizIndex, isValidObj.questionIndex,
    isUpdate);
  return {};
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
  questionBody: QuestionBody, isUpdate: boolean): IsValid {
  // check token
  const userId: number = findUserId(token);
  if (userId === INVALID) {
    const errorMsg: string = `Invalid token string: ${token} not exists.`;
    return { isValid: false, errorMsg };
  }

  // check quizId
  const isValidObj: IsValid = findQuizIndex(quizId, userId);
  if (!isValidObj.isValid) return isValidObj;

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  let duration: number = quiz.duration;

  // check questionId
  if (isUpdate) {
    const isValidQuestion: IsValid = findQuestionIndex(quiz, questionId);
    if (!isValidQuestion.isValid) return isValidQuestion;
    duration -= quiz.questions[isValidQuestion.questionIndex].duration;
    isValidObj.questionIndex = isValidQuestion.questionIndex;
  }

  // check questionBody
  return isValidQuestionBody(questionBody, duration, isValidObj);
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
 * @param {object} quiz - where the question is located
 * @param {number} questionId - a unique identifier for an exist question
 *
 * @return {object} isValidQuestion - includes isValid and (index or errorMsg)
 * isValid: boolean - unique identifier for a quiz of a user
 * questionIndex: number - set isValidObj.questionId if questionId is valid
 * errorMsg: string - if questionId invalid, i.e. isValid is false
 */
function findQuestionIndex(quiz: Quiz, questionId: number): IsValid {
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
 * @param {number} isUpdate - FALSE if add a new question, otherwise update
 *
 * @return {string} questionId - a global unique identifier of question
 */
function setQuestion(questionBody: QuestionBody,
  quizIndex: number, questionIndex: number, isUpdate: boolean): number {
  const { answers: answerBody, ...question } = questionBody;
  const answers: Answer[] = answerBody.map(({ answer, correct }, index) =>
    ({ answerId: index + 1, answer, colour: generateRandomColor(), correct }));

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
