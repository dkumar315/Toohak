import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  authRegister, requestAuthLogout, requestQuizCreate,
  requestQuizInfo, requestQuizTransfer, requestClear,
  requestQuizCreateV1, requestQuizTransferV1, requestQuizInfoV1, requestQuizSessionCreate, requestQuizSessionUpdate
} from './functionRequest';

let token: string;
let otherToken: string;
let quizId: number;

beforeEach(() => {
  requestClear();
  token = authRegister('krishpatel@gmail.com', 'KrishPatel0123', 'Krish', 'Patel').token;
  otherToken = authRegister('johnsmith@gmail.com', 'Johnsmith012345', 'John', 'Smith').token;

  const quizCreateResponse = requestQuizCreate(token, 'Test Quiz', 'This is a test quiz.');
  if ('quizId' in quizCreateResponse) {
    quizId = quizCreateResponse.quizId;
  } else {
    console.error(`Failed to create quiz: ${quizCreateResponse.error}`);
  }
});

afterAll(requestClear);

describe('testing adminQuizTransfer POST /v1/admin/quiz/{quizId}/transfer', () => {
  describe('test1.0 valid returns (valid token and quizId)', () => {
    test('test1.1 valid transfer of a quiz to another user', () => {
      const result = requestQuizTransfer(token, quizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: OK });
      const quizInfo = requestQuizInfo(otherToken, quizId);
      expect(quizInfo).toMatchObject({ quizId: quizId, name: 'Test Quiz', description: 'This is a test quiz.' });
    });
  });

  describe('test2.0 invalid returns', () => {
    test('test2.1 userEmail is not a real user', () => {
      const result = requestQuizTransfer(token, quizId, 'nonexistentemail@gmail.com');
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test2.2 userEmail is the current logged in user', () => {
      const result = requestQuizTransfer(token, quizId, 'krishpatel@gmail.com');
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test2.3 quiz ID refers to a quiz that has a name that is already used by the target user', () => {
      requestQuizCreate(otherToken, 'Test Quiz', 'This is another test quiz.');
      const result = requestQuizTransfer(token, quizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test2.4 token is empty or invalid (does not refer to valid logged in user session)', () => {
      const result = requestQuizTransfer('', quizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
    });

    test('test2.5 valid token is provided, but user is not an owner of this quiz or quiz doesn\'t exist', () => {
      const newToken = authRegister('marleyjhonson@gmail.com', 'Marleyjhonson0123', 'Marley', 'Jhonson').token;
      const result = requestQuizTransfer(newToken, quizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
    });

    test('test2.6 quiz cannot be transferred if any session is not in END state', () => {
      const sessionResponse = requestQuizSessionCreate(token, quizId, 1);
      if ('sessionId' in sessionResponse) {
        const sessionId = sessionResponse.sessionId;
        requestQuizSessionUpdate(token, quizId, sessionId, 'START');
        const result = requestQuizTransfer(token, quizId, 'johnsmith@gmail.com');
        expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
      }
    });
  });

  describe('test3.0 edge cases', () => {
    test('test3.1 transferring a quiz to a user with minimal valid data', () => {
      const minimalQuizCreateResponse = requestQuizCreate(token, 'Min', 'D');
      if ('quizId' in minimalQuizCreateResponse) {
        const minimalQuizId = minimalQuizCreateResponse.quizId;
        const result = requestQuizTransfer(token, minimalQuizId, 'johnsmith@gmail.com');
        expect(result).toStrictEqual({ status: OK });
        const quizInfo = requestQuizInfo(otherToken, minimalQuizId);
        expect(quizInfo).toMatchObject({ quizId: minimalQuizId, name: 'Min', description: 'D' });
      } else {
        console.error(`Failed to create minimal quiz: ${minimalQuizCreateResponse.error}`);
      }
    });

    test('test3.2 transferring a quiz with maximum data length', () => {
      const longName = 'Q'.repeat(30);
      const longDescription = 'D'.repeat(100);
      const maxQuizCreateResponse = requestQuizCreate(token, longName, longDescription);
      if ('quizId' in maxQuizCreateResponse) {
        const maxQuizId = maxQuizCreateResponse.quizId;
        const result = requestQuizTransfer(token, maxQuizId, 'johnsmith@gmail.com');
        expect(result).toStrictEqual({ status: OK });
        const quizInfo = requestQuizInfo(otherToken, maxQuizId);
        expect(quizInfo).toMatchObject({ quizId: maxQuizId, name: longName, description: longDescription });
      } else {
        console.error(`Failed to create max quiz: ${maxQuizCreateResponse.error}`);
      }
    });

    test('test3.3 transferring a quiz multiple times', () => {
      requestQuizTransfer(token, quizId, 'johnsmith@gmail.com');
      const result = requestQuizTransfer(otherToken, quizId, 'marleyjhonson@gmail.com');
      expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
    });

    test('test3.4 transferring a quiz that never existed', () => {
      const nonExistentQuizId = 9999;
      const result = requestQuizTransfer(token, nonExistentQuizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
    });

    test('test3.5 transferring a quiz with an invalid quiz ID format', () => {
      const invalidQuizId = -1;
      const result = requestQuizTransfer(token, invalidQuizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
    });

    test('test3.6 transferring a quiz with a token from a user who is no longer active', () => {
      requestAuthLogout(token);
      const result = requestQuizTransfer(token, quizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
    });

    test('test3.7 transferring a quiz after token expiration', () => {
  
      const result = requestQuizTransfer('expiredToken', quizId, 'johnsmith@gmail.com');
      expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
    });

    test('test3.8 transferring a quiz when the system is under heavy load', () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(requestQuizTransfer(token, quizId, 'johnsmith@gmail.com'));
      }
      results.forEach(result => {
        if (result.status === OK) {
          expect(result).toStrictEqual({ status: OK });
        } else {
          expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
        }
      });
    });
  });
});

describe('V1 routes for adminQuiz', () => {
  test('quizTransfer and quizInfo', () => {
    expect(requestQuizCreateV1(token, 'quiz2', '').status).toStrictEqual(OK);
    const token2: string = authRegister('e2@mail.com', 'passw0rd', 'na', 'me').token;
    expect(requestQuizTransferV1(token, quizId, 'e2@mail.com').status).toStrictEqual(OK);
    expect(requestQuizInfoV1(token2, quizId).status).toStrictEqual(OK);
  });
});
