import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  ERROR, authRegister, requestAuthLogout,
  quizCreate, requestQuizRemove, requestQuizEmptyTrash,
  requestClear, ResError, ResEmpty, ResQuizId,
} from './functionRequest';

let token: string;
let otherToken: string;
let quizId: number;
let otherQuizId: number;
let deleteQuizIds: number[];

beforeEach(() => {
  requestClear();
  const tokenResponse = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast');
  token = tokenResponse.token;

  const otherTokenResponse = authRegister('otheremail@gmail.com', 'otherpassw0rd', 'otherFirst', 'otherLast');
  otherToken = otherTokenResponse.token;

  const quizCreateResponse = quizCreate(token, 'Test Quiz', 'This is a test quiz.') as ResQuizId;
  quizId = quizCreateResponse.quizId;

  const otherQuizCreateResponse = quizCreate(otherToken, 'Other Test Quiz', 'This is another test quiz.') as ResQuizId;
  otherQuizId = otherQuizCreateResponse.quizId;

  requestQuizRemove(token, quizId);
  requestQuizRemove(otherToken, otherQuizId);

  deleteQuizIds = [quizId];
});

afterAll(requestClear);

describe('testing adminQuizTrashEmpty DELETE /v1/admin/quiz/trash/empty', () => {
  describe('test1.0 valid returns (valid token and quizIds)', () => {
    test('test1 valid empty trash for removed quizzes', () => {
      const result = requestQuizEmptyTrash(token, deleteQuizIds) as ResEmpty;
      expect(result).toMatchObject({});
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test2.0 invalid returns', () => {
    test('test2.1 one or more of the Quiz IDs is not currently in the trash', () => {
      deleteQuizIds.push(999);
      const result = requestQuizEmptyTrash(token, deleteQuizIds) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test2.2 token is empty', () => {
      const result = requestQuizEmptyTrash('', deleteQuizIds) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test2.3 valid token is provided, but user is not an owner of one or more quizzes', () => {
      const quizIds = [otherQuizId];
      const result = requestQuizEmptyTrash(token, quizIds) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });
  });

  describe('test3.0 edge cases', () => {
    test('test3.1 emptying the trash multiple times', () => {
      requestQuizEmptyTrash(token, deleteQuizIds);
      const result = requestQuizEmptyTrash(token, deleteQuizIds) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.2 emptying the trash with a token from a user who is no longer active', () => {
      requestAuthLogout(token);
      const result = requestQuizEmptyTrash(token, deleteQuizIds) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });
});
