import {
  setData, getData, INVALID, Colours,
  Data, Colour, Quiz, Question, Answer, ErrorObject, EmptyObject
} from './dataStore';
import { findUserId } from './auth';

export enum QuestionLimit {
  MIN_LEN = 5,
  MAX_LEN = 50
}

export enum AnswersLimit {
  MIN_COUNT = 2,
  MAX_COUNT = 6,
  MIN_STR_LEN = 1,
  MAX_STR_LEN = 30
}

export enum DurationLimit {
  MIN_QUESTION_SECS = 1,
  MIN_QUIZ_SUM_MINS = 3,
  MINS_TO_SECS = 60,
}
export const MAX_DURATIONS_SECS =
  DurationLimit.MIN_QUIZ_SUM_MINS * DurationLimit.MINS_TO_SECS;

export enum PointsLimit {
  MIN_NUM = 1,
  MAX_NUM = 10,
}

interface IsValid {
  isValid: boolean;
  quizIndex?: number;
  questionIndex?: number;
  errorMsg?: string;
}
export type QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
}
export type AnswerInput {
  answer: string;
  correct: boolean;
}
export type QuestionIdReturn { questionId: number };
export type NewQuestionIdReturn { newQuestionId: number };

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
  const isValidObj: IsValid = isValidIds({ token, quizId, questionBody });
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  const questionId: number = SetNewQuestionId(data, quiz);
  const newQuestion: Question = SetQuestionBody(questionBody, questionId);

  quiz.duration += newQuestion.duration;
  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = timeStamp();
  setData(data);

  return { questionId };
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
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const { quizIndex, questionIndex } = isValidObj;
  const quiz: Quiz = data.quizzes[quizIndex];
  const oldQuestion: Question = quiz.questions[questionIndex];
  const newQuestion: Question = SetQuestionBody(questionBody, oldQuestion.questionId);

  quiz.duration += newQuestion.duration - oldQuestion.duration;
  quiz.questions.splice(questionIndex, 1, newQuestion);
  quiz.timeLastEdited = timeStamp();
  setData(data);

  return {};
}

/**
 * Delete a particular question from a quiz.
 * When this route is called, the timeLastEdited is updated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} questionId - a unique identifier for a valid question
 *
 * @return {object} empty object - inputs valid, successfully delete question
 * @return {object} error - token, quizId, or questionId invalid
 */
export function adminQuizQuestionDelete(token: string, quizId: number,
  questionId: number): EmptyObject | ErrorObject {
  const isValidObj: IsValid = isValidIds({ token, quizId, questionId });
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz = data.quizzes[isValidObj.quizIndex];

  quiz.questions.splice(isValidObj.questionIndex, 1);
  quiz.numQuestions -= 1;

  quiz.duration = quiz.questions.reduce((total, question) => total + question.duration, 0);
  quiz.timeLastEdited = timeStamp();

  setData(data);
  return {};
}

/**
 * Move a question from one particular position in the quiz to another.
 * When this route is called, the timeLastEdited is updated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} questionId - a unique identifier for a valid question
 * @param {number} newPosition - new position for the question
 *
 * @return {object} empty object - inputs valid, successfully move question
 * @return {object} error - token, quizId, questionId, or newPosition invalid
 */
export function adminQuizQuestionMove(token: string, quizId: number,
  questionId: number, newPosition: number): EmptyObject | ErrorObject {
  const isValidObj: IsValid = isValidIds({ token, quizId, questionId });
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz = data.quizzes[isValidObj.quizIndex];

  if (newPosition < 0 || newPosition >= quiz.questions.length) {
    throw new Error(`Invalid newPosition number: ${newPosition}. 
      It must be between 0 and ${quiz.questions.length - 1}.`);
  }

  if (isValidObj.questionIndex === newPosition) {
    throw new Error(`The question is already at position ${newPosition}.`);
  }

  const [movedQuestion] = quiz.questions.splice(isValidObj.questionIndex, 1);
  quiz.questions.splice(newPosition, 0, movedQuestion);
  quiz.timeLastEdited = timeStamp();

  setData(data);
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
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];

  if (quiz.duration > MAX_DURATIONS_SECS) {
    throw new Error(`Invalid current quiz durations number: ${quiz.duration} ` +
      `exceeds ${DurationLimit.MIN_QUIZ_SUM_MINS} minutes.`);
  }

  const newQuestionId: number = SetNewQuestionId(data, quiz);
  const newQuestion: Question =
  { ...quiz.questions[isValidObj.questionIndex], questionId: newQuestionId };

  quiz.duration += newQuestion.duration;
  quiz.questions.splice(isValidObj.questionIndex + 1, 0, newQuestion);
  quiz.timeLastEdited = timeStamp();
  setData(data);

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

  if (question.length < QuestionLimit.MIN_LEN ||
    question.length > QuestionLimit.MAX_LEN) {
    return isValidErrorReturn(`Invalid question length: ${question.length}.`);
  }

  if (answers.length < AnswersLimit.MIN_COUNT ||
    answers.length > AnswersLimit.MAX_COUNT) {
    return isValidErrorReturn(`Invalid answers number: ${answers.length}.`);
  }

  if (duration < DurationLimit.MIN_QUESTION_SECS ||
    quizDuration + duration > MAX_DURATIONS_SECS) {
    return isValidErrorReturn(`Invalid duration number: ${duration}.`);
  }

  if (points < PointsLimit.MIN_NUM || points > PointsLimit.MAX_NUM) {
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
    answerBody.answer.length < AnswersLimit.MIN_STR_LEN ||
    answerBody.answer.length > AnswersLimit.MAX_STR_LEN);
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
const isValidErrorReturn = (errorMsg: string): IsValid => {
  return { isValid: false, errorMsg };
};

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
// type SetCreateQuestion = { questionBody: QuestionBody, quizIndex: number,
// operation: QuestionOperation.CREATE };
// type SetUpdateQuestion = { questionBody: Question, quizIndex: number,
// questionIndex: number, operation: QuestionOperation.UPDATE };
// type SetDuplicateQuestion = { questionBody: Question, quizIndex: number,
// questionIndex: number, operation: QuestionOperation.DUPLICATE };
// type SetQuestionParams = SetCreateQuestion | SetUpdateQuestion | SetDuplicateQuestion;
// function setQuestion(questionOrBody: QuestionBody | Question, quizIndex: number,
//   questionIndex: number, operation: QuestionOperation): number {
//   const data: Data = getData();
//   const quiz: Quiz = data.quizzes[quizIndex];

//   let duration: number = 0;
//   let questionId: number = 0;
//   let newQuestion: Question;

//   switch (operation) {
//     case QuestionOperation.CREATE:
//       questionId = SetNewQuestionId(data, quiz);
//       newQuestion = SetQuestionBody(questionId);
//       quiz.duration += newQuestion.duration;
//       quiz.questions.splice(questionIndex, 0, newQuestion);

//     case QuestionOperation.UPDATE:
//       questionId = quiz.questions[questionIndex].questionId;
//       newQuestion = SetQuestionBody(questionId);
//       duration += newQuestion.duration - quiz.questions[questionIndex].duration;
//       quiz.questions.splice(questionIndex, 1, newQuestion);

//     case QuestionOperation.MOVE:
//       [newQuestion] = quiz.questions.splice(isValidObj.questionIndex, 1);
//       quiz.questions.splice(questionIndex, 0, newQuestion);

//     case QuestionOperation.DUPLICATE:
//       questionId = SetNewQuestionId(data, quiz);
//       newQuestion = { ...quiz.questions[questionIndex - 1], questionId };
//       quiz.duration += newQuestion.duration;
//       quiz.questions.splice(questionIndex, 0, newQuestion);

//     case QuestionOperation.DELETE:
//       quiz.numQuestions -= 1;
//       quiz.duration -= quiz.questions[questionIndex].duration;
//       quiz.questions.splice(questionIndex, 1);
//   }

//   quiz.timeLastEdited = timeStamp();

//   setData(data);
//   return questionId;
// }

function SetNewQuestionId(data: Data, quiz: Quiz): number {
  data.sessions.questionCounter += 1;
  quiz.numQuestions += 1;
  setData(data);
  return data.sessions.questionCounter;
}

function SetQuestionBody(questionBody: QuestionBody, questionId: number): Question {
  const { answers: answerBody, ...question } = questionBody;
  const answers: Answer[] = answerBody.map(({ answer, correct }, index) =>
    ({ answerId: index + 1, answer, colour: generateRandomColor(), correct }));
  return { questionId, ...question, answers };
}
