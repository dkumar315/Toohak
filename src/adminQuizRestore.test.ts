import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, getData } from './dataStore';
import {
  ERROR, authRegister, requestAuthLogout,
  quizCreate, validQuizInfo, requestQuizRemove,
  restoreQuiz, requestClear,
  ResError, ResEmpty, ResQuizId, ResQuizInfo,
} from './functionRequest';

let token: string;
let otherToken: string;
let quizId: number;
let otherQuizId: number;

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
  let data = getData();
  requestQuizRemove(otherToken, otherQuizId);
});

afterAll(() => requestClear());

describe('testing adminQuizRestore POST /v1/admin/quiz/{quizId}/restore', () => {
  describe('test1.0 valid returns (valid token and quizId)', () => {
    test('test1.1 valid restore of a removed quiz', () => {
      const result = restoreQuiz(token, quizId) as ResEmpty;
      expect(result).toMatchObject({});
      expect(result.status).toStrictEqual(OK);
      const quizInfo = validQuizInfo(token, quizId) as ResQuizInfo;
      expect(quizInfo).toMatchObject({ quizId: quizId, name: 'Test Quiz', description: 'This is a test quiz.' });
    });
  });

  describe('test2.0 invalid returns', () => {
    test('test2.1 quiz name of the restored quiz is already used by another active quiz', () => {
      quizCreate(token, 'Test Quiz', 'This is another test quiz.') as ResQuizId;
      const result = restoreQuiz(token, quizId) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test2.2 quiz ID refers to a quiz that is not currently in the trash', () => {
      const newQuizCreateResponse = quizCreate(token, 'Test Quiz', 'This is another test quiz.') as ResQuizId;
      const newQuizId = newQuizCreateResponse.quizId;

      const result = restoreQuiz(token, newQuizId) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test2.3 token is empty', () => {
      const result = restoreQuiz('', quizId) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test2.4 valid token is provided, but user is not an owner of this quiz or quiz doesn\'t exist', () => {
      const newTokenResponse = authRegister('anotheremail@gmail.com', 'anotherpassw0rd', 'anotherFirst', 'anotherLast');
      let newToken: string = newTokenResponse.token;
      const result = restoreQuiz(newToken, quizId) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });
  });

  describe('test3.0 edge cases', () => {
    test('test3.1 restoring a quiz multiple times', () => {
      restoreQuiz(token, quizId);
      const result = restoreQuiz(token, quizId) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.2 restoring a quiz that never existed', () => {
      const result = restoreQuiz(token, quizId + otherQuizId) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.3 restoring a quiz with a token from a user who is no longer active', () => {
      requestAuthLogout(token);
      const result = restoreQuiz(token, quizId) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });
});
