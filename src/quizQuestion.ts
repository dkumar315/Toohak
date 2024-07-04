import {
  setData, getData,
  INVALID, COLORS,
  Data, Quiz, Question, Answer, ErrorObject, EmptyObject
} from './dataStore';
import { findUserId } from './auth';

const MIN_QUESTION_LEN = 5;
const MAX_QUESTION_LEN = 50;

const MIN_ANSWERS_LEN = 2;
const MAX_ANSWERS_LEN = 6;

const MAX_DURATIONS_MINS = 3;
const MINS_TO_SECS = 60;
const MAX_DURATIONS_SECS = MAX_DURATIONS_MINS * MINS_TO_SECS;

const MIN_POINTS_AWARD = 1;
const MAX_POINTS_AWARD = 10;

const MIN_ANSWER_STRING_LEN = 1;
const MAX_ANSWER_STRING_LEN = 30;

const TRUE = 1;
const FALSE = 0;

export {
  MIN_QUESTION_LEN, MAX_QUESTION_LEN,
  MAX_DURATIONS_SECS,
  MIN_POINTS_AWARD, MAX_POINTS_AWARD,
  MAX_ANSWER_STRING_LEN
};

interface Validate {
  isValid: boolean;
  index?: number;
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
export function adminQuizQuestionCreate(token: string, quizId: number,
  questionBody: QuestionBody): QuestionIdReturn | ErrorObject {
  // check token
  const userId: number = findUserId(token);
  if (userId === INVALID) {
    return { error: `Invalid token string: ${token} not exists.` };
  }

  // check quizId
  const isValidQuizIdObj: Validate = findQuizIndex(quizId, userId);
  if (!isValidQuizIdObj.isValid) return isValidQuizIdObj.errorMsg;

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidQuizIdObj.index];

  // check questionBody
  const isValidQuestion: Validate = isValidQuestionBody(questionBody, quiz.duration);
  if (!isValidQuestion.isValid) return isValidQuestion.errorMsg;

  // if all valid
  const questionId: number = setQuestion(
    questionBody, isValidQuizIdObj.index, quiz.questions.length, FALSE);
  return { questionId: questionId };
}

export function adminQuizQuestionUpdate(token: string, quizId: number,
  questionId: number, questionBody: QuestionBody): EmptyObject | ErrorObject {
  // check token
  const userId: number = findUserId(token);
  if (userId === INVALID) {
    return { error: `Invalid token string: ${token} not exists.` };
  }

  // check quizId
  const isValidQuizIdObj: Validate = findQuizIndex(quizId, userId);
  if (!isValidQuizIdObj.isValid) return isValidQuizIdObj.errorMsg;

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidQuizIdObj.index];

  // check questionId
  const isValidQuestionIdObj: Validate = findQuestionIndex(quiz, questionId);
  if (!isValidQuestionIdObj.isValid) return isValidQuestionIdObj.errorMsg;
  const questionIndex = isValidQuestionIdObj.index;

  // check questionBody
  const duration = quiz.duration - quiz.questions[questionIndex].duration;
  const isValidQuestion: Validate = isValidQuestionBody(questionBody, duration);
  if (!isValidQuestion.isValid) return isValidQuestion.errorMsg;

  // if all inputs valid, update the question
  setQuestion(questionBody, isValidQuizIdObj.index, questionIndex, TRUE);
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
 * index: number - if quizId valid, quizIndex, otherwise index === INVALID
 * errorMsg: ErrorObject - if quizId not found, or not own by current user
 */
function findQuizIndex(quizId: number, authUserId: number): Validate {
  const data: Data = getData();
  const quizIndex: number = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const isValidId: Validate = { isValid: false, index: quizIndex };

  // userId not exist
  if (quizIndex === INVALID) {
    isValidId.errorMsg = {
      error: `Invalid quizId number: ${quizId} not exists.`
    };
    return isValidId;
  }

  // user does not own the quiz
  if (data.quizzes[quizIndex].creatorId !== authUserId) {
    isValidId.errorMsg = {
      error: `Invalid quizId number: ${quizId} access denied.`
    };
    return isValidId;
  }

  isValidId.isValid = true;
  return isValidId;
}

/**
 * Check if a given questionId is exist
 *
 * @param {object} quiz - where the question is located
 * @param {number} questionId - a unique identifier for an exist question
 *
 * @return {object} isValidQuestion - includes isValid and (index or errorMsg)
 * isValid: boolean - unique identifier for a quiz of a user
 * index: number - the questionIndex, if questionId is valid
 * errorMsg: ErrorObject - if questionId invalid, i.e. isValid is false
 */
function findQuestionIndex(quiz: Quiz, questionId: number): Validate {
  const questionIndex = quiz.questions.findIndex(quiz =>
    quiz.questionId === questionId
  );

  if (questionIndex === INVALID) {
    return {
      isValid: false,
      errorMsg: { error: `Invalid questionId number: ${questionId} not exists.` }
    };
  }

  return { isValid: true, index: questionIndex };
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
  quizDuration: number): Validate {
  const isValidQuestion: Validate = { isValid: false };

  // Question string invalid when has less than 5 or greater than 50 characters
  const questionsLen = questionBody.question.length;
  if (questionsLen < MIN_QUESTION_LEN || questionsLen > MAX_QUESTION_LEN) {
    isValidQuestion.errorMsg = {
      error: `Invalid question string: ${questionBody.question}, len invalid.`
    };
    return isValidQuestion;
  }

  // question invalid when has more than 6 answers or less than 2 answers
  const answersLen = questionBody.answers.length;
  if (answersLen < MIN_ANSWERS_LEN || answersLen > MAX_ANSWERS_LEN) {
    isValidQuestion.errorMsg = {
      error: `Invalid answers number: ${questionBody.answers.length}.`
    };
    return isValidQuestion;
  }

  // question duration invalid when it is not a positive number
  // or the sum of the question durations in the quiz exceeds 3 minutes
  if (questionBody.duration <= 0 ||
    quizDuration + questionBody.duration > MAX_DURATIONS_SECS) {
    isValidQuestion.errorMsg = {
      error: `Invalid duration(s) number: ${questionBody.duration}.`
    };
    return isValidQuestion;
  }

  // points awarded invalid when points are less than 1 or greater than 10
  if (questionBody.points < MIN_POINTS_AWARD ||
    questionBody.points > MAX_POINTS_AWARD) {
    isValidQuestion.errorMsg = {
      error: `Invalid points number: ${questionBody.points}.`
    };
    return isValidQuestion;
  }

  // answers invalid when answer len invalild, duplicate, or all answers false
  if (!isValidAnswer(questionBody.answers)) {
    isValidQuestion.errorMsg = {
      error: `Invalid answers object: ${questionBody.answers}.`
    };
    return isValidQuestion;
  }

  isValidQuestion.isValid = true;
  return isValidQuestion;
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
    ans.answer.length < MIN_ANSWER_STRING_LEN ||
    ans.answer.length > MAX_ANSWER_STRING_LEN);

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
function generateRandomColor(): string {
  const index: number = Math.floor(Math.random() * COLORS.length);
  return COLORS[index];
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
  quizIndex: number, questionIndex: number, isUpdate: number): number {
  const { answers, ...question } = questionBody;
  const answersArray: Answer[] = questionBody.answers.map(
    ({ answer, correct }, index) =>
      ({ answerId: index + 1, answer, colour: generateRandomColor(), correct })
  );
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  let questionId: number;

  if (isUpdate === FALSE) {
    data.sessions.questionCounter += 1;
    questionId = data.sessions.questionCounter;
    quiz.numQuestions += 1;
  } else {
    questionId = quiz.questions[questionIndex].questionId;
    quiz.duration = quiz.duration - quiz.questions[questionIndex].duration;
  }

  const newQuestion: Question = { questionId, ...question, answers: answersArray };
  quiz.questions.splice(questionIndex, isUpdate, newQuestion);
  quiz.duration += questionBody.duration;
  quiz.timeLastEdited = timeStamp();

  setData(data); console.log('after setData:' + data.quizzes[quizIndex].questions);
  return questionId;
}
