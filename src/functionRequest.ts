import request, { HttpVerb, Response } from 'sync-request-curl';
const config = require('./config.json');
const SERVER_URL: string = `${config.url}:${config.port}`;

// ============== interfaces ===================================================
import { StatusCodes } from 'http-status-codes';
import { EmptyObject, ErrorObject } from './dataStore';
import { TokenReturn, UserDetailReturn } from './auth';
import { QuizListReturn, QuizCreateReturn, QuizInfoReturn } from './quiz';
import { QuestionBody, QuestionIdReturn, NewQuestionIdReturn } from './quizQuestion';
import { QuizSessionId } from './quizSession';
import { PlayerId } from './player';
export const VALID_EMPTY_RETURN: EmptyObject = {};
export const ERROR: ErrorObject = { error: expect.any(String) };
type Header = EmptyObject | { token: string };
export type ResError = {
  status: StatusCodes;
} & ErrorObject;
type ResValid<T> = {
  status: StatusCodes;
} & T;
type ApiResponse<T> = ResValid<T> | ResError;

// ============== helper function ==============================================
function requestHelper<T>(
  method: HttpVerb,
  path: string,
  payload: object
): ApiResponse<T> {
  let res: Response;
  let headers: Header = {};

  if (!isV1Path(path)) {
    if ('token' in payload) {
      headers = { token: payload.token as string };
      delete payload.token;
    }
  }

  if (['GET', 'DELETE'].includes(method)) {
    res = request(method, SERVER_URL + path, { qs: payload, headers });
  } else {
    // 'PUT' || 'POST'
    res = request(method, SERVER_URL + path, { json: payload, headers });
  }

  try {
    const bodyObject: ResValid<T> | ResError = JSON.parse(res.body.toString());
    return { status: res.statusCode, ...bodyObject };
  } catch (error: unknown) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: `error on parse JSON: '${error}'\n` +
      `status = ${res.statusCode}, payload = ${payload}`
    };
  }
}

const isV1Path = (path: string): boolean => {
  const iter3KeyWords = ['thumbnail', 'player', 'sessions', 'session'];
  return path.includes('/v1') &&
  iter3KeyWords.every(keyword => !path.includes(keyword));
};

// ============== adminAuth ====================================================
export function requestAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): ApiResponse<TokenReturn> {
  return requestHelper('POST', '/v1/admin/auth/register',
    { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(
  email: string,
  password: string
): ApiResponse<TokenReturn> {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
}

export function requestAuthLogoutV1(
  token: string
): ApiResponse<EmptyObject> {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
}

export function requestAuthLogout(
  token: string
): ApiResponse<EmptyObject> {
  return requestHelper('POST', '/v2/admin/auth/logout', { token });
}

// ============== adminUser ====================================================
export function requestUserDetailsV1(
  token: string
): ApiResponse<UserDetailReturn> {
  return requestHelper('GET', '/v1/admin/user/details', { token });
}

export function requestUserDetails(
  token: string
): ApiResponse<UserDetailReturn> {
  return requestHelper('GET', '/v2/admin/user/details', { token });
}

export function requestUserDetailsUpdateV1(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', '/v1/admin/user/details',
    { token, email, nameFirst, nameLast });
}

export function requestUserDetailsUpdate(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', '/v2/admin/user/details',
    { token, email, nameFirst, nameLast });
}

export function requestUserPasswordUpdateV1(
  token: string,
  oldPassword: string,
  newPassword: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', '/v1/admin/user/password',
    { token, oldPassword, newPassword });
}

export function requestUserPasswordUpdate(
  token: string,
  oldPassword: string,
  newPassword: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', '/v2/admin/user/password',
    { token, oldPassword, newPassword });
}

// ============== adminQuiz ====================================================
export function requestQuizListV1(
  token: string
): ApiResponse<QuizListReturn> {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
}

export function requestQuizList(
  token: string
): ApiResponse<QuizListReturn> {
  return requestHelper('GET', '/v2/admin/quiz/list', { token });
}

export function requestQuizCreateV1(
  token: string,
  name: string,
  description: string
): ApiResponse<QuizCreateReturn> {
  return requestHelper('POST', '/v1/admin/quiz',
    { token, name, description });
}

export function requestQuizCreate(
  token: string,
  name: string,
  description: string
): ApiResponse<QuizCreateReturn> {
  return requestHelper('POST', '/v2/admin/quiz',
    { token, name, description });
}

export function requestQuizRemoveV1(
  token: string,
  quizId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
}

export function requestQuizRemove(
  token: string,
  quizId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, { token });
}

export function requestQuizInfoV1(
  token: string,
  quizId: number
):
ApiResponse<QuizInfoReturn> {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
}

export function requestQuizInfo(
  token: string,
  quizId: number
):
ApiResponse<QuizInfoReturn> {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, { token });
}

export function requestQuizNameUpdateV1(
  token: string,
  quizId: number,
  name: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/name`, { token, name });
}

export function requestQuizNameUpdate(
  token: string,
  quizId: number,
  name: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/name`, { token, name });
}

export function requestQuizDescriptionUpdateV1(
  token: string,
  quizId: number,
  description: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`,
    { token, description });
}

export function requestQuizDescriptionUpdate(
  token: string,
  quizId: number,
  description: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/description`,
    { token, description });
}

export function requestQuizViewTrashV1(
  token: string
): ApiResponse<QuizListReturn> {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
}

export function requestQuizViewTrash(
  token: string
): ApiResponse<QuizListReturn> {
  return requestHelper('GET', '/v2/admin/quiz/trash', { token });
}

export function requestQuizRestoreV1(
  token: string,
  quizId: number): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
}

export function requestQuizRestore(
  token: string,
  quizId: number): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, { token });
}

export function requestQuizEmptyTrashV1(
  token: string,
  quizIds: number[]): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds });
}

export function requestQuizEmptyTrash(
  token: string,
  quizIds: number[]): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { token, quizIds });
}

export function requestQuizTransferV1(
  token: string,
  quizId: number,
  email: string
): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/transfer`,
    { token, quizId, email });
}

export function requestQuizTransfer(
  token: string,
  quizId: number,
  email: string
): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/transfer`,
    { token, quizId, email });
}

export function requestUpdateQuizThumbnail(
  token: string,
  quizId: number,
  imgUrl: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { token, imgUrl });
}

// ============== adminQuizQuestion ============================================
export function requestQuizQuestionCreateV1(
  token: string,
  quizId: number,
  questionBody: QuestionBody
): ApiResponse<QuestionIdReturn> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`,
    { token, questionBody });
}

export function requestQuizQuestionCreate(
  token: string,
  quizId: number,
  questionBody: QuestionBody
): ApiResponse<QuestionIdReturn> {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`,
    { token, questionBody });
}

export function requestQuizQuestionUpdateV1(
  token: string,
  quizId: number,
  questionId: number,
  questionBody: QuestionBody
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`,
    { token, questionBody });
}

export function requestQuizQuestionUpdate(
  token: string,
  quizId: number,
  questionId: number,
  questionBody: QuestionBody
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`,
    { token, questionBody });
}

export function requestQuizQuestionDeleteV1(
  token: string, quizId: number,
  questionId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });
}

export function requestQuizQuestionDelete(
  token: string, quizId: number,
  questionId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}/question/${questionId}`, { token });
}

export function requestQuizQuestionMoveV1(
  token: string, quizId: number,
  questionId: number, newPosition: number
): ApiResponse<EmptyObject> {
  return requestHelper('PUT',
    `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    { token, newPosition });
}

export function requestQuizQuestionMove(
  token: string, quizId: number,
  questionId: number, newPosition: number
): ApiResponse<EmptyObject> {
  return requestHelper('PUT',
    `/v2/admin/quiz/${quizId}/question/${questionId}/move`,
    { token, newPosition });
}

export function requestQuizQuestionDuplicateV1(
  token: string,
  quizId: number,
  questionId: number
): ApiResponse<NewQuestionIdReturn> {
  return requestHelper('POST',
    `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
}

export function requestQuizQuestionDuplicate(
  token: string,
  quizId: number,
  questionId: number
): ApiResponse<NewQuestionIdReturn> {
  return requestHelper('POST',
    `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
}

// ============== adminQuizSession ============================================
export function requestQuizSessionCreate(
  token: string,
  quizId: number,
  autoStartNum: number
): ApiResponse<QuizSessionId> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`,
    { token, autoStartNum });
}

// ============== player =======================================================
export function requestPlayerJoin(
  sessionId: number, name: string
): ApiResponse<PlayerId> {
  return requestHelper('POST', '/v1/player/join', { sessionId, name });
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
export type ResSessionId = ResValid<QuizSessionId>;
export type ResPlayerId = ResValid<PlayerId>;

export const authRegister = (email: string, password: string,
  nameFirst: string, nameLast: string): ResToken =>
  requestAuthRegister(email, password, nameFirst, nameLast) as ResToken;

export const quizCreate = (token: string, name: string,
  description: string): ResQuizId =>
  requestQuizCreate(token, name, description) as ResQuizId;

export const validQuizInfo = (token: string, quizId: number): ResQuizInfo =>
  requestQuizInfo(token, quizId) as ResQuizInfo;

export const questionCreate = (token: string, quizId: number,
  questionBody: QuestionBody): ResQuestionId =>
  requestQuizQuestionCreate(token, quizId, questionBody) as ResQuestionId;

export const quizSessionCreate = (token: string, quizId: number,
  autoStartNum: number): ResSessionId =>
  requestQuizSessionCreate(token, quizId, autoStartNum) as ResSessionId;
