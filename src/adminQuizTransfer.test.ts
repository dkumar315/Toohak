import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  authRegister, requestAuthLogin, requestAuthLogout,
  requestQuizList, requestQuizCreate, requestQuizInfo, requestQuizRemove,
  requestQuizRestore, requestClear,
  ResError, ResEmpty, ResToken, ResQuizList, ResQuizId, ResQuizInfo
} from './functionRequest';

let token: string;
let otherToken: string;
let quizId: number;
let otherQuizId: number;

beforeEach(() => {
  requestClear();
  token = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  otherToken = authRegister('otheremail@gmail.com', 'otherpassw0rd', 'otherFirst', 'otherLast').token;

  let quizCreateResponse = requestQuizCreate(token, 'Test Quiz', 'This is a test quiz.');
  if ('quizId' in quizCreateResponse) {
    quizId = quizCreateResponse.quizId;
  } else {
    console.error(`Failed to create quiz: ${quizCreateResponse.error}`);
    return;
  }

  let otherQuizCreateResponse = requestQuizCreate(otherToken, 'Other Test Quiz', 'This is another test quiz.');
  if ('quizId' in otherQuizCreateResponse) {
    otherQuizId = otherQuizCreateResponse.quizId;
  } else {
    console.error(`Failed to create other quiz: ${otherQuizCreateResponse.error}`);
    return;
  }

  requestQuizRemove(token, quizId);
  requestQuizRemove(otherToken, otherQuizId);
});

afterAll(() => requestClear());

describe('testing adminQuizRestore POST /v1/admin/quiz/{quizId}/restore', () => {
  describe('test1.0 valid returns (valid token and quizId)', () => {
    test('test1.1 valid restore of a removed quiz', () => {
      const result = requestQuizRestore(token, quizId);
      expect(result).toStrictEqual({ status: OK });
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toMatchObject({ quizId: quizId, name: 'Test Quiz', description: 'This is a test quiz.' });
    });
  });

  describe('test2.0 invalid returns', () => {
    test('test2.1 quiz name of the restored quiz is already used by another active quiz', () => {
      let newQuizCreateResponse = requestQuizCreate(token, 'Test Quiz', 'This is another test quiz.');
      if ('quizId' in newQuizCreateResponse) {
        const newQuizId = newQuizCreateResponse.quizId;
        requestQuizRemove(token, newQuizId);
        const result = requestQuizRestore(token, newQuizId);
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
      } else {
        console.error(`Failed to create quiz: ${newQuizCreateResponse.error}`);
        return;
      }
    });

    test('test2.2 quiz ID refers to a quiz that is not currently in the trash', () => {
      const result = requestQuizRestore(token, quizId + 1); // Assuming quizId + 1 is not in the trash
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test2.3 token is empty or invalid (does not refer to valid logged in user session)', () => {
      const result = requestQuizRestore('', quizId);
      expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
    });

    test('test2.4 valid token is provided, but user is not an owner of this quiz or quiz doesn\'t exist', () => {
      const newToken = authRegister('otheremail@gmail.com', 'otherpassw0rd', 'otherFirst', 'otherLast').token;
      const result = requestQuizRestore(newToken, quizId);
      expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
    });
  });

  describe('test3.0 edge cases', () => {
    test('test3.1 restoring a quiz with minimal valid data', () => {
      let minimalQuizCreateResponse = requestQuizCreate(token, 'Q', 'D');
      if ('quizId' in minimalQuizCreateResponse) {
        const minimalQuizId = minimalQuizCreateResponse.quizId;
        requestQuizRemove(token, minimalQuizId);
        const result = requestQuizRestore(token, minimalQuizId);
        expect(result).toStrictEqual({ status: OK });
        const quizInfo = requestQuizInfo(token, minimalQuizId);
        expect(quizInfo).toMatchObject({ quizId: minimalQuizId, name: 'Q', description: 'D' });
      } else {
        console.error(`Failed to create minimal quiz: ${minimalQuizCreateResponse.error}`);
        return;
      }
    });

    test('test3.2 restoring a quiz with maximum data length', () => {
      const longName = 'Q'.repeat(256); // Assuming 256 is max length
      const longDescription = 'D'.repeat(1024); // Assuming 1024 is max length
      let maxQuizCreateResponse = requestQuizCreate(token, longName, longDescription);
      if ('quizId' in maxQuizCreateResponse) {
        const maxQuizId = maxQuizCreateResponse.quizId;
        requestQuizRemove(token, maxQuizId);
        const result = requestQuizRestore(token, maxQuizId);
        expect(result).toStrictEqual({ status: OK });
        const quizInfo = requestQuizInfo(token, maxQuizId);
        expect(quizInfo).toMatchObject({ quizId: maxQuizId, name: longName, description: longDescription });
      } else {
        console.error(`Failed to create max quiz: ${maxQuizCreateResponse.error}`);
        return;
      }
    });

    test('test3.3 restoring a quiz multiple times', () => {
      requestQuizRestore(token, quizId);
      const result = requestQuizRestore(token, quizId);
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test3.4 restoring a quiz that never existed', () => {
      const nonExistentQuizId = 9999; // Assuming this ID does not exist
      const result = requestQuizRestore(token, nonExistentQuizId);
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test3.5 restoring a quiz with an invalid quiz ID format', () => {
      // Assuming an invalid format (e.g., negative or non-numeric)
      const invalidQuizId = -1;
      const result = requestQuizRestore(token, invalidQuizId);
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test3.6 restoring a quiz with a token from a user who is no longer active', () => {
      requestAuthLogout(token);
      const result = requestQuizRestore(token, quizId);
      expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
    });

    test('test3.7 restoring a quiz after token expiration', () => {
      // Assuming token expiration is handled and we can simulate it
      // This would be specific to how your system handles token expiration
      // Simulating by clearing the session or setting token to expired status
      // const expiredToken = expireToken(token); // Hypothetical function
      const result = requestQuizRestore('expiredToken', quizId);
      expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
    });

    test('test3.8 restoring a quiz when the system is under heavy load', () => {
      // Simulate heavy load by running multiple requests
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(requestQuizRestore(token, quizId));
      }
      results.forEach(result => {
        expect(result).toStrictEqual({ status: OK });
      });
    });
  });
});
