import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  ERROR, authRegister, requestAuthLogout,
  quizCreate, validQuizInfo, requestQuizRemove,
  restoreQuiz, requestClear,
  ResError, ResEmpty, ResToken, ResQuizId, ResQuizInfo
} from './functionRequest';

let token: string;
let otherToken: string;
let quizId: number;
let otherQuizId: number;

beforeEach(() => {
  requestClear();
  const tokenResponse = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast');
  if ('token' in tokenResponse) {
    token = tokenResponse.token;
  } else {
    console.error(`Failed to register user: ${(tokenResponse as ResError).error}`);
    return;
  }

  const otherTokenResponse = authRegister('otheremail@gmail.com', 'otherpassw0rd', 'otherFirst', 'otherLast') as ResToken;
  if ('token' in otherTokenResponse) {
    otherToken = otherTokenResponse.token;
  } else {
    console.error(`Failed to register other user: ${(otherTokenResponse as ResError).error}`);
    return;
  }

  const quizCreateResponse = quizCreate(token, 'Test Quiz', 'This is a test quiz.') as ResQuizId;
  if ('quizId' in quizCreateResponse) {
    quizId = quizCreateResponse.quizId;
  } else {
    console.error(`Failed to create quiz: ${(quizCreateResponse as ResError).error}`);
    return;
  }

  const otherQuizCreateResponse = quizCreate(otherToken, 'Other Test Quiz', 'This is another test quiz.') as ResQuizId;
  if ('quizId' in otherQuizCreateResponse) {
    otherQuizId = otherQuizCreateResponse.quizId;
  } else {
    console.error(`Failed to create other quiz: ${(otherQuizCreateResponse as ResError).error}`);
    return;
  }

  requestQuizRemove(token, quizId);
  requestQuizRemove(otherToken, otherQuizId);
});

afterAll(() => requestClear());

describe('testing adminQuizRestore POST /v1/admin/quiz/{quizId}/restore', () => {
  describe('test1.0 valid returns (valid token and quizId)', () => {
    test('test1.1 valid restore of a removed quiz', () => {
      const result = restoreQuiz(token, quizId);
      expect(result).toMatchObject({});
      expect(result.status).toStrictEqual({ status: OK });
      const quizInfo = validQuizInfo(token, quizId) as ResQuizInfo;
      expect(quizInfo).toMatchObject({ quizId: quizId, name: 'Test Quiz', description: 'This is a test quiz.' });
    });
  });

  describe('test2.0 invalid returns', () => {
    test('test2.1 quiz name of the restored quiz is already used by another active quiz', () => {
      const newQuizCreateResponse = quizCreate(token, 'Test Quiz', 'This is another test quiz.') as ResQuizId;
      if ('quizId' in newQuizCreateResponse) {
        const newQuizId = newQuizCreateResponse.quizId;
        requestQuizRemove(token, newQuizId);
        const result = restoreQuiz(token, newQuizId) as ResError;
        if ('error' in result) {
          expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz name Test Quiz is already used by another active quiz.` });
        } else {
          expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz name Test Quiz is already used by another active quiz.` });
        }
      } else {
        console.error(`Failed to create quiz: ${(newQuizCreateResponse as ResError).error}`);
      }
    });

    test('test2.2 quiz ID refers to a quiz that is not currently in the trash', () => {
      const result = restoreQuiz(token, quizId + 1) as ResError; // Assuming quizId + 1 is not in the trash
      if ('error' in result) {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz ${quizId + 1} is not in the trash.` });
      } else {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz ${quizId + 1} is not in the trash.` });
      }
    });

    test('test2.3 token is empty or invalid (does not refer to valid logged in user session)', () => {
      const result = restoreQuiz('', quizId) as ResError;
      if ('error' in result) {
        expect(result).toStrictEqual({ status: UNAUTHORIZED, error: `Invalid token .` });
      } else {
        expect(result).toStrictEqual({ status: UNAUTHORIZED, error: `Invalid token .` });
      }
    });

    test('test2.4 valid token is provided, but user is not an owner of this quiz or quiz doesn\'t exist', () => {
      const newTokenResponse = authRegister('anotheremail@gmail.com', 'anotherpassw0rd', 'anotherFirst', 'anotherLast') as ResToken;
      let newToken: string;
      if ('token' in newTokenResponse) {
        newToken = newTokenResponse.token;
      } else {
        console.error(`Failed to register another user: ${(newTokenResponse as ResError).error}`);
        return;
      }
      const result = restoreQuiz(newToken, quizId) as ResError;
      if ('error' in result) {
        expect(result).toStrictEqual({ status: FORBIDDEN, error: `UserId ${newTokenResponse.token} does not own QuizId ${quizId}.` });
      } else {
        expect(result).toStrictEqual({ status: FORBIDDEN, error: `UserId ${newTokenResponse.token} does not own QuizId ${quizId}.` });
      }
    });
  });

  describe('test3.0 edge cases', () => {
    test('test3.1 restoring a quiz with minimal valid data', () => {
      const minimalQuizCreateResponse = quizCreate(token, 'Q', 'D') as ResQuizId;
      if ('quizId' in minimalQuizCreateResponse) {
        const minimalQuizId = minimalQuizCreateResponse.quizId;
        requestQuizRemove(token, minimalQuizId);
        const result = restoreQuiz(token, minimalQuizId) as ResError | ResEmpty;
        if ('error' in result) {
          expect(result).toStrictEqual({ status: OK });
          const quizInfo = validQuizInfo(token, minimalQuizId) as ResQuizInfo;
          expect(quizInfo).toMatchObject({ quizId: minimalQuizId, name: 'Q', description: 'D' });
        } else {
          expect(result).toStrictEqual({ status: OK });
          const quizInfo = validQuizInfo(token, minimalQuizId) as ResQuizInfo;
          expect(quizInfo).toMatchObject({ quizId: minimalQuizId, name: 'Q', description: 'D' });
        }
      } else {
        console.error(`Failed to create minimal quiz: ${(minimalQuizCreateResponse as ResError).error}`);
      }
    });

    test('test3.2 restoring a quiz with maximum data length', () => {
      const longName = 'Q'.repeat(30); // Assuming 30 is max length
      const longDescription = 'D'.repeat(100); // Assuming 100 is max length
      const maxQuizCreateResponse = quizCreate(token, longName, longDescription) as ResQuizId;
      if ('quizId' in maxQuizCreateResponse) {
        const maxQuizId = maxQuizCreateResponse.quizId;
        requestQuizRemove(token, maxQuizId);
        const result = restoreQuiz(token, maxQuizId) as ResError | ResEmpty;
        if ('error' in result) {
          expect(result).toStrictEqual({ status: OK });
          const quizInfo = validQuizInfo(token, maxQuizId) as ResQuizInfo;
          expect(quizInfo).toMatchObject({ quizId: maxQuizId, name: longName, description: longDescription });
        } else {
          expect(result).toStrictEqual({ status: OK });
          const quizInfo = validQuizInfo(token, maxQuizId) as ResQuizInfo;
          expect(quizInfo).toMatchObject({ quizId: maxQuizId, name: longName, description: longDescription });
        }
      } else {
        console.error(`Failed to create max quiz: ${(maxQuizCreateResponse as ResError).error}`);
      }
    });

    test('test3.3 restoring a quiz multiple times', () => {
      restoreQuiz(token, quizId);
      const result = restoreQuiz(token, quizId) as ResError;
      if ('error' in result) {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz ${quizId} is not in the trash.` });
      } else {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz ${quizId} is not in the trash.` });
      }
    });

    test('test3.4 restoring a quiz that never existed', () => {
      const nonExistentQuizId = 9999; // Assuming this ID does not exist
      const result = restoreQuiz(token, nonExistentQuizId) as ResError;
      if ('error' in result) {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz ${nonExistentQuizId} is not in the trash.` });
      } else {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `Quiz ${nonExistentQuizId} is not in the trash.` });
      }
    });

    test('test3.5 restoring a quiz with an invalid quiz ID format', () => {
      const invalidQuizId = -1; // Assuming an invalid format (e.g., negative or non-numeric)
      const result = restoreQuiz(token, invalidQuizId) as ResError;
      if ('error' in result) {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `QuizId ${invalidQuizId} is not a valid format.` });
      } else {
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: `QuizId ${invalidQuizId} is not a valid format.` });
      }
    });

    test('test3.6 restoring a quiz with a token from a user who is no longer active', () => {
      requestAuthLogout(token);
      const result = restoreQuiz(token, quizId) as ResError;
      if ('error' in result) {
        expect(result).toStrictEqual({ status: UNAUTHORIZED, error: `Invalid token ${token}.` });
      } else {
        expect(result).toStrictEqual({ status: UNAUTHORIZED, error: `Invalid token ${token}.` });
      }
    });

    test('test3.7 restoring a quiz after token expiration', () => {
      const result = restoreQuiz('expiredToken', quizId) as ResError;
      if ('error' in result) {
        expect(result).toStrictEqual({ status: UNAUTHORIZED, error: `Invalid token expiredToken.` });
      } else {
        expect(result).toStrictEqual({ status: UNAUTHORIZED, error: `Invalid token expiredToken.` });
      }
    });
  });
});
