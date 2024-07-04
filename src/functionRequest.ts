import request, { HttpVerb } from 'sync-request-curl';
const config = require('./config.json');
const SERVER_URL = `${config.url}:${config.port}`;

// ============== interfaces ===================================================
import { UNAUTHORIZED, BAD_REQUEST, FORBIDDEN, EmptyObject, ErrorObject } from './dataStore';
import { QuestionBody } from './quizQuestion';
export const VALID_EMPTY_RETURN: EmptyObject = {};
export const ERROR: ErrorObject = { error: expect.any(String) };
export interface ResError {
  status: typeof UNAUTHORIZED | typeof FORBIDDEN | typeof BAD_REQUEST;
  error: string;
}

// ============== helper function ==============================================
function requestHelper(method: HttpVerb, path: string, payload: object) {
  let res;
  if (['GET', 'DELETE'].includes(method)) {
    res = request(method, SERVER_URL + path, { qs: payload });
  } else { // ['PUT', 'POST']
    res = request(method, SERVER_URL + path, { json: payload });
  }

  const bodyObject = JSON.parse(res.body.toString());
  return { status: res.statusCode, ...bodyObject };
}

// ============== adminAuth ====================================================
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
}

export function requestAuthLogout(token: string) {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
}

// ============== adminUser ====================================================
export function requestUserDetails(token: string) {
  return requestHelper('GET', '/v1/admin/user/details', { token });
}

export function requestUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });
}

export function requestUserPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  return requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });
}

// ============== adminQuiz ============================================
export function requestQuizList(token: string) {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
}

export function requestQuizCreate(token: string, name: string, description: string) {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
}

export function requestQuizRemove(token: string, quizId: number) {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
}

export function requestQuizInfo(token: string, quizId: number) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
}

// ============== adminQuizQuestion ============================================
export function requestQuizQuestionCreate(token: string, quizId: number, questionBody: QuestionBody) {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { token, questionBody });
}

export function requestQuizQuestionUpdate(token: string, quizId: number, questionId: number, questionBody: QuestionBody) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, questionBody });
}

export function requestQuizQuestionDuplicate(token: string, quizId: number, questionId: number) {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
}

// ============== other ========================================================
export function requestClear() {
  return requestHelper('DELETE', '/v1/clear', {});
}
