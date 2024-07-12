import request, { HttpVerb, Response } from 'sync-request-curl';
const config = require('./config.json');
const SERVER_URL: string = `${config.url}:${config.port}`;

// ============== interfaces ===================================================
import { StatusCodes } from 'http-status-codes';
import { EmptyObject, ErrorObject } from './dataStore';
import { TokenReturn, UserDetailReturn } from './auth';
import { QuizListReturn, QuizCreateReturn, QuizInfoReturn, QuizTransfer } from './quiz';
import { QuestionBody, QuestionIdReturn, NewQuestionIdReturn } from './quizQuestion';
export const VALID_EMPTY_RETURN: EmptyObject = {};
export const ERROR: ErrorObject = { error: expect.any(String) };
export type ResError = {
  status: StatusCodes;
} & ErrorObject;
type ResValid<T> = {
  status: StatusCodes;
} & T;
type ApiResponse<T> = ResValid<T> | ResError;

// ============== helper function ==============================================
function requestHelper<T>(method: HttpVerb, path: string, payload: object): ApiResponse<T> {
  let res: Response;
  if (['GET', 'DELETE'].includes(method)) {
    res = request(method, SERVER_URL + path, { qs: payload });
  } else { // ['PUT', 'POST']
    res = request(method, SERVER_URL + path, { json: payload });
  }

  const bodyObject = JSON.parse(res.body.toString());
  return { status: res.statusCode, ...bodyObject };
}

// ============== adminAuth ====================================================
export function requestAuthRegister(email: string, password: string,
  nameFirst: string, nameLast: string): ApiResponse<TokenReturn> {
  return requestHelper('POST', '/v1/admin/auth/register',
    { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(email: string,
  password: string): ApiResponse<TokenReturn> {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
}

export function requestAuthLogout(token: string): ApiResponse<EmptyObject> {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
}

// ============== adminUser ====================================================
export function requestUserDetails(token: string): ApiResponse<UserDetailReturn> {
  return requestHelper('GET', '/v1/admin/user/details', { token });
}

export function requestUserDetailsUpdate(token: string, email: string,
  nameFirst: string, nameLast: string): ApiResponse<EmptyObject> {
  return requestHelper('PUT', '/v1/admin/user/details',
    { token, email, nameFirst, nameLast });
}

export function requestUserPasswordUpdate(token: string,
  oldPassword: string, newPassword: string): ApiResponse<EmptyObject> {
  return requestHelper('PUT', '/v1/admin/user/password',
    { token, oldPassword, newPassword });
}

// ============== adminQuiz ====================================================
export function requestQuizList(token: string): ApiResponse<QuizListReturn> {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
}

export function requestQuizCreate(token: string, name: string,
  description: string): ApiResponse<QuizCreateReturn> {
  return requestHelper('POST', '/v1/admin/quiz',
    { token, name, description });
}

export function requestQuizRemove(token: string,
  quizId: number): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
}

export function requestQuizInfo(token: string, quizId: number):
ApiResponse<QuizInfoReturn> {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
}

export function requestQuizNameUpdate(token: string, quizId: number,
  name: string): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/name`, { token, name });
}

export function requestQuizDescriptionUpdate(token: string, quizId: number,
  description: string): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`,
    { token, description });
}

export function requestQuizViewTrash(token: string): ApiResponse<QuizListReturn> {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
}

export function requestQuizRestore(token: string, quizId: number): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
}

export function requestQuizTransfer(transferData: QuizTransfer): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v1/admin/quiz/${transferData.quizId}/transfer`, transferData);
}

// ============== adminQuizQuestion ============================================
export function requestQuizQuestionCreate(token: string, quizId: number,
  questionBody: QuestionBody): ApiResponse<QuestionIdReturn> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`,
    { token, questionBody });
}

export function requestQuizQuestionUpdate(token: string, quizId: number,
  questionId: number, questionBody: QuestionBody): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`,
    { token, questionBody });
}

export function requestQuizQuestionDelete(token: string, quizId: number,
  questionId: number): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });
}

export function requestQuizQuestionMove(token: string, quizId: number,
  questionId: number, newPosition: number): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    { token, newPosition });
}

export function requestQuizQuestionDuplicate(token: string, quizId: number,
  questionId: number): ApiResponse<NewQuestionIdReturn> {
  return requestHelper('POST',
    `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
}

// ============== other ========================================================
export function requestClear(): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', '/v1/clear', {});
}

export type ResEmpty = ResValid<EmptyObject>;
export type ResToken = ResValid<TokenReturn>;
export type ResUserDetail = ResValid<UserDetailReturn>;
export type ResQuizList = ResValid<QuizListReturn>;
export type ResQuizId = ResValid<QuizCreateReturn>;
export type ResQuizInfo = ResValid<QuizInfoReturn>;
export type ResQuestionId = ResValid<QuestionIdReturn>;
export type ResNewQuestionId = ResValid<NewQuestionIdReturn>;

export const authRegister = (email: string, password: string,
  nameFirst: string, nameLast: string): ResToken =>
  requestAuthRegister(email, password, nameFirst, nameLast) as ResToken;

export const quizCreate = (token: string, name: string, description: string): ResQuizId =>
  requestQuizCreate(token, name, description) as ResQuizId;

export const validQuizInfo = (token: string, quizId: number): ResQuizInfo =>
  requestQuizInfo(token, quizId) as ResQuizInfo;

export const questionCreate = (token: string, quizId: number,
  questionBody: QuestionBody): ResQuestionId =>
  requestQuizQuestionCreate(token, quizId, questionBody) as ResQuestionId;
