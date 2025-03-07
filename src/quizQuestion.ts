import {
  setData, getData, INVALID, Colours,
  Data, Colour, Quiz, Question, Answer, EmptyObject
} from './dataStore';
import {
  timeStamp, isvalidErrorObj, isValidIds, isValidImgUrl
} from './helperFunctions';

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

export interface IsValid {
  isValid: boolean;
  quizIndex?: number;
  questionIndex?: number;
  errorMsg?: string;
  status?: number;
}
export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerInput[];
  thumbnailUrl: string;
}
export interface AnswerInput {
  answer: string;
  correct: boolean;
}
export type QuestionId = { questionId: number };
export type NewQuestionId = { newQuestionId: number };

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
 * @throws {Error} error - token, quizId, or questionBody invalid
 */
export const adminQuizQuestionCreate = (
  token: string,
  quizId: number,
  questionBody: QuestionBody
): QuestionId => {
  const isValidObj: IsValid = isValidIdsAdv({ token, quizId, questionBody });
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
  const questionId: number = quiz.questionCounter + 1;
  const newQuestion: Question = SetQuestionBody(questionBody, questionId);

  quiz.numQuestions += 1;
  quiz.questionCounter += 1;
  quiz.duration += newQuestion.duration;
  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = timeStamp();
  setData(data);

  return { questionId };
};

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
 * @throws {Error} error - token, quizId, questionId, or questionBody invalid
 */
export const adminQuizQuestionUpdate = (
  token: string,
  quizId: number,
  questionId: number,
  questionBody: QuestionBody
): EmptyObject => {
  const isValidObj: IsValid =
  isValidIdsAdv({ token, quizId, questionId, questionBody });
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
};

/**
 * Delete a particular question from a quiz.
 * When this route is called, the timeLastEdited is updated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} questionId - a unique identifier for a valid question
 *
 * @return {object} empty object - inputs valid, successfully delete question
 * @throws {Error} error - token, quizId, or questionId invalid
 */
export const adminQuizQuestionDelete = (
  token: string,
  quizId: number,
  questionId: number
): EmptyObject => {
  const isValidObj: IsValid = isValidIdsAdv({ token, quizId, questionId });
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz = data.quizzes[isValidObj.quizIndex];

  quiz.questions.splice(isValidObj.questionIndex, 1);
  quiz.numQuestions -= 1;

  quiz.duration = quiz.questions.reduce((total, question) => total + question.duration, 0);
  quiz.timeLastEdited = timeStamp();

  setData(data);
  return {};
};

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
 * @throws {Error} error - token, quizId, questionId, or newPosition invalid
 */
export const adminQuizQuestionMove = (
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
): EmptyObject => {
  const isValidObj: IsValid = isValidIdsAdv({ token, quizId, questionId });
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
};

/**
 * Duplicate a question after where the source question is
 * if current quiz duration exceeds 3 mins, return error (BAD_REQUEST)
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {number} questionId - a unique identifier for a valid question
 *
 * @return {object} empty object - inputs valid, successfully update question
 * @throws {Error} error - token, quizId, or questionId invalid
 */
export const adminQuizQuestionDuplicate = (
  token: string,
  quizId: number,
  questionId: number
): NewQuestionId => {
  const isValidObj: IsValid = isValidIdsAdv({ token, quizId, questionId });
  if (!isValidObj.isValid) throw new Error(isValidObj.errorMsg);

  const data: Data = getData();
  const quiz: Quiz = data.quizzes[isValidObj.quizIndex];

  if (quiz.duration > MAX_DURATIONS_SECS) {
    throw new Error(`Invalid current quiz durations number: ${quiz.duration} ` +
      `exceeds ${DurationLimit.MIN_QUIZ_SUM_MINS} minutes.`);
  }

  const newQuestionId: number = quiz.questionCounter + 1;
  const newQuestion: Question =
  { ...quiz.questions[isValidObj.questionIndex], questionId: newQuestionId };

  quiz.numQuestions += 1;
  quiz.questionCounter += 1;
  quiz.duration += newQuestion.duration;
  quiz.questions.splice(isValidObj.questionIndex + 1, 0, newQuestion);
  quiz.timeLastEdited = timeStamp();
  setData(data);

  return { newQuestionId };
};

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
const isValidIdsAdv = (
  params: {
    token: string,
    quizId: number,
    questionId?: number,
    questionBody?: QuestionBody
  }
): IsValid => {
  const { token, quizId, questionId, questionBody } = params;
  const isValidObj: IsValid = isValidIds(token, quizId, false);
  if (!isValidObj.isValid) return isValidObj;

  // check questionId
  if ('questionId' in params) {
    const isValidQuestionId: IsValid =
    findQuestionIndex(isValidObj.quizIndex, questionId);
    if (!isValidQuestionId.isValid) return isValidQuestionId;
    isValidObj.questionIndex = isValidQuestionId.questionIndex;
  }

  if (questionBody) {
    const data: Data = getData();
    const quiz: Quiz = data.quizzes[isValidObj.quizIndex];
    let duration: number = quiz.duration;
    if ('questionId' in params) {
      duration -= quiz.questions[isValidObj.questionIndex].duration;
    }
    const isValidQuestion: IsValid =
    isValidQuestionBody(questionBody, duration);
    if (!isValidQuestion.isValid) return isValidQuestion;
  }

  return isValidObj;
};

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
const findQuestionIndex = (quizIndex: number, questionId: number): IsValid => {
  const data: Data = getData();
  const quiz: Quiz = data.quizzes[quizIndex];
  const questionIndex: number = quiz.questions.findIndex(quiz =>
    quiz.questionId === questionId);

  return questionIndex !== INVALID
    ? { isValid: true, questionIndex }
    : { isValid: false, errorMsg: `Invalid questionId number: ${questionId}.` };
};

/**
 * Check if input questionBody meets the requirement
 *
 * @param {object} questionBody - include question, duration, points and answers
 *
 * @return {object} isValidQuestion - includes isValid or and errorMsg
 * isValid: boolean - true if requirements all satisfied
 * errorMsg: ErrorObject - isValid is false, an errorMsg will be set
 */
const isValidQuestionBody = (
  questionBody: QuestionBody,
  quizDuration: number
): IsValid => {
  const { question, duration, points, answers, thumbnailUrl } = questionBody;

  if (question.length < QuestionLimit.MIN_LEN ||
    question.length > QuestionLimit.MAX_LEN) {
    return isvalidErrorObj(`Invalid question length: ${question.length}.`);
  }

  if (answers.length < AnswersLimit.MIN_COUNT ||
    answers.length > AnswersLimit.MAX_COUNT) {
    return isvalidErrorObj(`Invalid answers number: ${answers.length}.`);
  }

  if (duration < DurationLimit.MIN_QUESTION_SECS ||
    quizDuration + duration > MAX_DURATIONS_SECS) {
    return isvalidErrorObj(`Invalid duration number: ${duration}.`);
  }

  if (points < PointsLimit.MIN_NUM || points > PointsLimit.MAX_NUM) {
    return isvalidErrorObj(`Invalid points number: ${points}.`);
  }

  if (!isValidImgUrl(thumbnailUrl)) {
    return isvalidErrorObj(`Invalid thumbnailUrl string: ${thumbnailUrl}.`);
  }

  return isValidAnswer(answers);
};

/**
 * check if answers have correct answers, and !isDuplicateAnswer
 * isDuplicateAnswer is case sentivite
 *
 * @param {array} answers - an array of answer string of questionBody
 *
 * @return {boolean} true - if no answer strings are duplicates of another
 */
const isValidAnswer = (answers: AnswerInput[]): IsValid => {
  const invalidAnswerLen: boolean = answers.some((answerBody: AnswerInput) =>
    answerBody.answer.length < AnswersLimit.MIN_STR_LEN ||
    answerBody.answer.length > AnswersLimit.MAX_STR_LEN);
  if (invalidAnswerLen) {
    return isvalidErrorObj(
      'Invalid answers object, answer string length number(s) invalid.');
  }

  const uniqueAnswers: Set<string> = new Set(answers
    .map((answerBody: AnswerInput) => answerBody.answer));
  const hasDuplicateAnswer: boolean = uniqueAnswers.size !== answers.length;
  if (hasDuplicateAnswer) {
    return isvalidErrorObj(
      'Invalid answers object, answer string(s) not unique.');
  }

  const hasCorrectAnswer = answers.some((answerBody: AnswerInput) =>
    answerBody.correct);
  if (!hasCorrectAnswer) {
    return isvalidErrorObj(
      'Invalid answers object, answers has no correct answer.');
  }

  return { isValid: true };
};

/**
 * Covert a questionBody to question
 *
 * @param {object} questionBody - input of a question
 * @param {number} questionId - corresponding questionId
 *
 * @return {string} question - a new question
 */
const SetQuestionBody = (questionBody: QuestionBody, questionId: number):
Question => {
  const { answers: answerBody, ...question } = questionBody;
  const answers: Answer[] = answerBody.map(({ answer, correct }, index) =>
    ({ answerId: index + 1, answer, colour: generateRandomColor(), correct }));
  return { questionId, ...question, answers };
};

/**
 * Randomly generate a colour for an answer of a question
 * when a quiz question is created or updated
 *
 * @return {string} color - a name of a random color
 */
const generateRandomColor = (): Colour => {
  const colours: Colour[] = Object.values(Colours);
  const randomIndex: number = Math.floor(Math.random() * colours.length);
  return colours[randomIndex];
};
