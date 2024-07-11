import {
  setData, getData, INVALID, Colours,
  Data, Colour, Quiz, Question, Answer, ErrorObject, EmptyObject
} from './dataStore';
import { findUserId } from './auth';

export enum QuestionLimit {
  MinLen = 5,
  MaxLen = 50
}

export enum AnswersLimit {
  MinCount = 2,
  MaxCount = 6,
  MinStrLen = 1,
  MaxStrLen = 30
}

export enum DurationLimit {
  MinQuestionSecs = 1,
  MinQuizSumMins = 3,
  MinsToSecs = 60,
}
export const MAX_DURATIONS_SECS =
  DurationLimit.MinQuizSumMins * DurationLimit.MinsToSecs;

export enum PointsLimit {
  MinNum = 1,
  MaxNum = 10,
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

enum QuestionOperation {
  Create,
  Update,
  Duplicate,
  Move,
  Delete
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
  // check token, quizId, no questionId, questionBody
  const isValidObj: IsValid = isValidIds({ token, quizId, questionBody });
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all valid
  const data: Data = getData();
  const quizIndex : number = isValidObj.quizIndex;
  const questionId: number = setQuestion(questionBody, quizIndex,
    data.quizzes[quizIndex].questions.length, QuestionOperation.Create);
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
  const isValidObj: IsValid = isValidIds({ token, quizId, questionId, questionBody });
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // if all inputs valid, update the question
  setQuestion(questionBody, isValidObj.quizIndex, isValidObj.questionIndex,
    QuestionOperation.Update);
  return {};
}

/**
 * Duplicate a question after where the source question is
 * if current quiz duration exceeds 3 mins, return error (BAD_REQUEST)
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
  const isValidObj: IsValid = isValidIds({ token, quizId, questionId });
  if (!isValidObj.isValid) return { error: isValidObj.errorMsg };

  // new question is add after the source question
  const data: Data = getData();
  const { quizIndex, questionIndex } = isValidObj;

  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  if (quiz.duration > MAX_DURATIONS_SECS) {
    return { error: `Invalid current quiz durations number: ${quiz.duration}` };
  }

  const newQuestionId: number = setQuestion(quiz.questions[questionIndex],
    quizIndex, questionIndex + 1, QuestionOperation.Duplicate);
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
function isValidIds(params: { token: string, quizId: number, questionId?: number,
  questionBody?: QuestionBody }): IsValid {
  const { token, quizId, questionId, questionBody } = params;
  // check token
  const userId: number = findUserId(token);
  if (userId === INVALID) {
    return isValidErrorReturn(`Invalid token string: ${token} not exists.`);
  }

  // check quizId
  const isValidObj: IsValid = findQuizIndex(quizId, userId);
  if (!isValidObj.isValid) return isValidObj;

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];

  // check questionId
  if (questionId !== undefined) {
    const isValidQuestionId: IsValid = findQuestionIndex(isValidObj.quizIndex, questionId);
    if (!isValidQuestionId.isValid) return isValidQuestionId;
    isValidObj.questionIndex = isValidQuestionId.questionIndex;
  }

  if (questionBody !== undefined) {
    let duration: number = quiz.duration;
    if (questionId !== undefined) duration -= quiz.questions[isValidObj.questionIndex].duration;
    const isValidQuestion: IsValid = isValidQuestionBody(questionBody, duration);
    if (!isValidQuestion.isValid) return isValidQuestion;
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
    return isValidErrorReturn(`Invalid quizId number: ${quizId} not exists.`);
  }

  // user does not own the quiz
  if (data.quizzes[quizIndex].creatorId !== authUserId) {
    return isValidErrorReturn(`Invalid quizId number: ${quizId} access denied.`);
  }

  return { isValid: true, quizIndex };
}

/**
 * Check if a given questionId is exist
 *
 * @param {number} quizIndex - where the quiz is located
 * @param {number} questionId - a unique identifier for an exist question
 *
 * @return {object} isValidQuestion - includes isValid and (index or errorMsg)
 * isValid: boolean - unique identifier for a quiz of a user
 * questionIndex: number - set isValidObj.questionId if questionId is valid
 * errorMsg: string - if questionId invalid or null, i.e. isValid is false
 */
function findQuestionIndex(quizIndex: number, questionId: number): IsValid {
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  const questionIndex: number = quiz.questions.findIndex(quiz =>
    quiz.questionId === questionId);

  return questionIndex !== INVALID
    ? { isValid: true, questionIndex }
    : { isValid: false, errorMsg: `Invalid questionId number: ${questionId}.` };
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
  quizDuration: number): IsValid {
  if (questionBody === null) {
    return isValidErrorReturn('Invalid questionBody object: null.');
  }
  const { question, duration, points, answers } = questionBody;

  if (question.length < QuestionLimit.MinLen ||
    question.length > QuestionLimit.MaxLen) {
    return isValidErrorReturn(`Invalid question length: ${question.length}.`);
  }

  if (answers.length < AnswersLimit.MinCount ||
    answers.length > AnswersLimit.MaxCount) {
    return isValidErrorReturn(`Invalid answers number: ${answers.length}.`);
  }

  if (duration < DurationLimit.MinQuestionSecs ||
    quizDuration + duration > MAX_DURATIONS_SECS) {
    return isValidErrorReturn(`Invalid duration number: ${duration}.`);
  }

  if (points < PointsLimit.MinNum || points > PointsLimit.MaxNum) {
    return isValidErrorReturn(`Invalid points number: ${points}.`);
  }

  if (points < PointsLimit.MinNum || points > PointsLimit.MaxNum) {
    return isValidErrorReturn(`Invalid points number: ${points}.`);
  }

  return isValidAnswer(answers);
}

/**
 * check if answers have correct answers, and !isDuplicateAnswer
 * isDuplicateAnswer is CASE SENSITIVE
 *
 * @param {array} answers - an array of answer string of questionBody
 *
 * @return {boolean} true - if no answer strings are duplicates of another
 */
function isValidAnswer(answers: AnswerInput[]): IsValid {
  const invalidAnswerLen: boolean = answers.some((answerBody: AnswerInput) =>
    answerBody.answer.length < AnswersLimit.MinStrLen ||
    answerBody.answer.length > AnswersLimit.MaxStrLen);
  if (invalidAnswerLen) {
    return isValidErrorReturn(
      'Invalid answers object, answer string length number(s) invalid.');
  }

  const uniqueAnswers: Set<string> = new Set(answers
    .map((answerBody: AnswerInput) => answerBody.answer));
  const hasDuplicateAnswer: boolean = uniqueAnswers.size !== answers.length;
  if (hasDuplicateAnswer) {
    return isValidErrorReturn(
      'Invalid answers object, answer string(s) not unique.');
  }

  const hasCorrectAnswer = answers.some((answerBody: AnswerInput) =>
    answerBody.correct);
  if (!hasCorrectAnswer) {
    return isValidErrorReturn(
      'Invalid answers object, answers has no correct answer.');
  }

  return { isValid: true };
}

/**
 * Return an object of { isValid, errorMsg } for isValid function when invalid
 *
 * @return {object} isValidObj - an object contains errorMsg
 */
function isValidErrorReturn (errorMsg: string): IsValid {
  return { isValid: false, errorMsg };
}

/**
 * Randomly generate a colour for an answer of a question
 * when a quiz question is created or updated
 *
 * @return {string} color - a name of a random color
 */
function generateRandomColor(): Colour {
  const colours: Colour[] = Object.values(Colours);
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
function setQuestion(questionBody: QuestionBody | Question, quizIndex: number,
  questionIndex: number, operation: QuestionOperation): number {
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  const isCreate: boolean = (operation === QuestionOperation.Create ||
    operation === QuestionOperation.Duplicate);

  let questionId: number;
  if (isCreate) {
    data.sessions.questionCounter += 1;
    questionId = data.sessions.questionCounter;
    quiz.numQuestions += 1;
  } else {
    questionId = quiz.questions[questionIndex].questionId;
    quiz.duration -= quiz.questions[questionIndex].duration;
  }

  // set new question
  let newQuestion: Question;
  if (operation === QuestionOperation.Duplicate) {
    newQuestion = { ...quiz.questions[questionIndex - 1], questionId };
  } else {
    const { answers: answerBody, ...question } = questionBody;
    const answers: Answer[] = answerBody.map(({ answer, correct }, index) =>
      ({ answerId: index + 1, answer, colour: generateRandomColor(), correct }));
    newQuestion = { questionId, ...question, answers };
  }

  quiz.questions.splice(questionIndex, isCreate ? 0 : 1, newQuestion);
  quiz.duration += newQuestion.duration;
  quiz.timeLastEdited = timeStamp();

  setData(data);
  return questionId;
}
