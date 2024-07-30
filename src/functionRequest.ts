import request, { HttpVerb, Response } from 'sync-request-curl';
const config = require('./config.json');
const SERVER_URL: string = `${config.url}:${config.port}`;

// ============== interfaces ===================================================
import { StatusCodes } from 'http-status-codes';
import {
  EmptyObject, ErrorObject, QuizSessionResult, QuestionResult, QuestionResults
} from './dataStore';
import { Token, UserDetails } from './auth';
import { QuizList, QuizId, QuizInfo } from './quiz';
import { QuestionBody, QuestionId, NewQuestionId } from './quizQuestion';
import {
  QuizSessions, QuizSessionId, QuizSessionStatus, QuizSessionResults
} from './quizSession';
import { PlayerId, PlayerStatus } from './player';
import { MessageBody, Messages } from './playerChat';
export const VALID_EMPTY_RETURN: EmptyObject = {};
type Header = EmptyObject | { token: string };
export type ResError = {
  status: StatusCodes;
} & ErrorObject;
type ResValid<T> = {
  status: StatusCodes;
} & T;
type ApiResponse<T> = ResValid<T> | ResError;

// ============== helper const =================================================
function requestHelper<T> (
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
): ApiResponse<Token> {
  return requestHelper('POST', '/v1/admin/auth/register',
    { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(
  email: string,
  password: string
): ApiResponse<Token> {
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
): ApiResponse<UserDetails> {
  return requestHelper('GET', '/v1/admin/user/details', { token });
}

export function requestUserDetails(
  token: string
): ApiResponse<UserDetails> {
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
): ApiResponse<QuizList> {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
}

export function requestQuizList(
  token: string
): ApiResponse<QuizList> {
  return requestHelper('GET', '/v2/admin/quiz/list', { token });
}

export function requestQuizCreateV1(
  token: string,
  name: string,
  description: string
): ApiResponse<QuizId> {
  return requestHelper('POST', '/v1/admin/quiz',
    { token, name, description });
}

export function requestQuizCreate(
  token: string,
  name: string,
  description: string
): ApiResponse<QuizId> {
  return requestHelper('POST', '/v2/admin/quiz',
    { token, name, description });
}

export function requestQuizRemoveV1(
  token: string, quizId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
}

export function requestQuizRemove(
  token: string, quizId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, { token });
}

export function requestQuizInfoV1(
  token: string,
  quizId: number
): ApiResponse<QuizInfo> {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
}

export function requestQuizInfo(
  token: string,
  quizId: number
): ApiResponse<QuizInfo> {
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
): ApiResponse<QuizList> {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
}

export function requestQuizViewTrash(
  token: string
): ApiResponse<QuizList> {
  return requestHelper('GET', '/v2/admin/quiz/trash', { token });
}

export function requestQuizRestoreV1(
  token: string,
  quizId: number
): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
}

export function requestQuizRestore(
  token: string,
  quizId: number
): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, { token });
}

export function requestQuizEmptyTrashV1(
  token: string,
  quizIds: number[]
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty',
    { token, quizIds });
}

export function requestQuizEmptyTrash(
  token: string,
  quizIds: number[]
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty',
    { token, quizIds });
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
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`,
    { token, imgUrl });
}

// ============== adminQuizQuestion ============================================
export function requestQuizQuestionCreateV1(
  token: string,
  quizId: number,
  questionBody: QuestionBody
): ApiResponse<QuestionId> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`,
    { token, questionBody });
}

export function requestQuizQuestionCreate(
  token: string,
  quizId: number,
  questionBody: QuestionBody
): ApiResponse<QuestionId> {
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
  token: string,
  quizId: number,
  questionId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE',
    `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });
}

export function requestQuizQuestionDelete(
  token: string,
  quizId: number,
  questionId: number
): ApiResponse<EmptyObject> {
  return requestHelper('DELETE',
    `/v2/admin/quiz/${quizId}/question/${questionId}`, { token });
}

export function requestQuizQuestionMoveV1(
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
): ApiResponse<EmptyObject> {
  return requestHelper('PUT',
    `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    { token, newPosition });
}

export function requestQuizQuestionMove(
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
): ApiResponse<EmptyObject> {
  return requestHelper('PUT',
    `/v2/admin/quiz/${quizId}/question/${questionId}/move`,
    { token, newPosition });
}

export function requestQuizQuestionDuplicateV1(
  token: string,
  quizId: number,
  questionId: number
): ApiResponse<NewQuestionId> {
  return requestHelper('POST',
    `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
}

export function requestQuizQuestionDuplicate(
  token: string,
  quizId: number,
  questionId: number
): ApiResponse<NewQuestionId> {
  return requestHelper('POST',
    `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
}

export function requestQuestionResults(
  playerId: number,
  sessionId: number,
  questionId: number
): ApiResponse<QuestionResult> {
  return requestHelper('GET', `/v1/player/${playerId}/session/${sessionId}/question/${questionId}/results`, {});
}

// ============== adminQuizSession ============================================
export function requestAdminQuizSessions(
  token: string,
  quizId: number
): ApiResponse<QuizSessions> {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, { token });
}

export function requestQuizSessionCreate(
  token: string,
  quizId: number,
  autoStartNum: number
): ApiResponse<QuizSessionId> {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`,
    { token, autoStartNum });
}

export function requestQuizSessionList(
  token: string,
  quizId: number
): ApiResponse<QuizSessions> {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, { token });
}

export function requestQuizSessionUpdate(
  token: string,
  quizId: number,
  sessionId: number,
  action: string
): ApiResponse<EmptyObject> {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    { token, action });
}
export function requestAdminQuizSessionStatus(
  token: string,
  quizId: number,
  sessionId: number
): ApiResponse<QuizSessionStatus> {
  return requestHelper('GET',
    `/v1/admin/quiz/${quizId}/session/${sessionId}`, { token });
}

export function requestQuizSessionResults(
  token: string,
  quizId: number,
  sessionId: number
): ApiResponse<QuizSessionResults> {
  return requestHelper('GET',
    `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { token });
}

// ============== player =======================================================
export function requestPlayerJoin(
  sessionId: number,
  name: string
): ApiResponse<PlayerId> {
  return requestHelper('POST', '/v1/player/join', { sessionId, name });
}

export function requestPlayerStatus(
  playerId: number
): ApiResponse<PlayerStatus> {
  return requestHelper('GET', `/v1/player/${playerId}`, {});
}

export function requestPlayerResults(
  playerId: number
): ApiResponse<QuizSessionResult> {
  return requestHelper('GET', `/v1/player/${playerId}/results`, {});
}

// ============== player  Question =============================================
export function requestPlayerQuestionResults(
  playerId: number,
  questionPosition: number
): ApiResponse<QuestionResults> {
  return requestHelper('GET',
    `/v1/player/${playerId}/question/${questionPosition}/results`, {});
}

// ============== playerChat ===================================================
export function requestPlayerChatMessages(
  playerId: number
): ApiResponse<Messages> {
  return requestHelper('GET', `/v1/player/${playerId}/chat`, {});
}

export function requestPlayerChatCreate(
  playerId: number,
  message: MessageBody
): ApiResponse<EmptyObject> {
  return requestHelper('POST', `/v1/player/${playerId}/chat`, { message });
}

// ============== other ========================================================
export function requestClear(): ApiResponse<EmptyObject> {
  return requestHelper('DELETE', '/v1/clear', {});
}

export type ResEmpty = ResValid<EmptyObject>;
export type ResToken = ResValid<Token>;
export type ResUserDetails = ResValid<UserDetails>;
export type ResQuizList = ResValid<QuizList>;
export type ResQuizId = ResValid<QuizId>;
export type ResQuizInfo = ResValid<QuizInfo>;
export type ResQuestionId = ResValid<QuestionId>;
export type ResNewQuestionId = ResValid<NewQuestionId>;
export type ResQuizSessions = ResValid<QuizSessions>;
export type ResSessionId = ResValid<QuizSessionId>;
export type ResQuizSessionStatus = ResValid<QuizSessionStatus>;
export type ResQuizSessionResults = ResValid<QuizSessionResults>;
export type ResPlayerId = ResValid<PlayerId>;
export type ResPlayerStatus = ResValid<PlayerStatus>;
export type ResPlayerChatMessages = ResValid<Messages>;
export type ResQuizSessionResult = ApiResponse<QuizSessionResult>;

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

export const quizSessionUpdate = (token: string, quizId: number,
  sessionId: number, action: string): ResEmpty =>
  requestQuizSessionUpdate(token, quizId, sessionId, action) as ResEmpty;

export const playerJoin = (sessionId: number, name: string): ResPlayerId =>
  requestPlayerJoin(sessionId, name) as ResPlayerId;

export const quizSessionStatus = (token: string, quizId: number,
  sessionId: number): ResQuizSessionStatus =>
  requestAdminQuizSessionStatus(token, quizId, sessionId) as ResQuizSessionStatus;

export const playerStatus = (playerId: number): ResPlayerStatus =>
  requestPlayerStatus(playerId) as ResPlayerStatus;

export const playerChatMessages = (playerId: number): ResPlayerChatMessages =>
  requestPlayerChatMessages(playerId) as ResPlayerChatMessages;
