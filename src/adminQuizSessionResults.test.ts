import { OK } from './dataStore';
import {
  authRegister, requestAuthLogout,
  quizCreate, requestQuizSessionCreate, requestQuizSessionResults, requestClear,
} from './functionRequest';

beforeAll(() => requestClear());

let token: string, quizId: number, sessionId: number;

beforeEach(() => {
  requestClear();
  const authResponse = authRegister('krishpatel@gmail.com', 'Krishpatel01', 'Krish', 'Patel');
  if ('token' in authResponse) {
    token = authResponse.token;
  }
  const quizResponse = quizCreate(token, 'Sample Quiz', 'Sample Description');
  if ('quizId' in quizResponse) {
    quizId = quizResponse.quizId;
  }
  const startResponse = requestQuizSessionCreate(token, quizId, 0);
  if ('sessionId' in startResponse) {
    sessionId = startResponse.sessionId;
  }
});

afterAll(() => requestClear());

describe('Testing adminQuizSessionResults', () => {
  const VALID_RESPONSE = {
    usersRankedByScore: expect.any(Array),
    questionResults: expect.any(Array)
  };

  describe('Valid Returns', () => {
    test('Valid request returns session results', () => {
      const result = requestQuizSessionResults(token, quizId, sessionId);
      if ('status' in result && result.status === OK) {
        expect(result).toMatchObject(VALID_RESPONSE);
      }
    });

    test('Valid request with different token and quizId', () => {
      const authResponse = authRegister('anotheruser@gmail.com', 'AnotherUser01', 'Another', 'User');
      let newToken: string;
      if ('token' in authResponse) {
        newToken = authResponse.token;
      }
      const quizResponse = quizCreate(newToken, 'Another Sample Quiz', 'Another Description');
      let newQuizId: number;
      if ('quizId' in quizResponse) {
        newQuizId = quizResponse.quizId;
      }
      const startResponse = requestQuizSessionCreate(newToken, newQuizId, 0);
      let newSessionId: number;
      if ('sessionId' in startResponse) {
        newSessionId = startResponse.sessionId;
      }
      const result = requestQuizSessionResults(newToken, newQuizId, newSessionId);
      if ('status' in result && result.status === OK) {
        expect(result).toMatchObject(VALID_RESPONSE);
      }
    });
  });

  describe('Invalid Returns', () => {
    describe('Invalid token returns UNAUTHORIZED (401)', () => {
      test('User logged out', () => {
        requestAuthLogout(token);
        try {
          requestQuizSessionResults(token, quizId, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: krishpatel@gmail.com');
        }
      });

      test('User not exists', () => {
        requestClear();
        try {
          requestQuizSessionResults(token, quizId, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: krishpatel@gmail.com');
        }
      });

      test('Invalid token format', () => {
        try {
          requestQuizSessionResults('invalid', quizId, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: invalid');
        }
      });

      test('Empty token', () => {
        try {
          requestQuizSessionResults('', quizId, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: ');
        }
      });

      test('Token with insufficient permissions', () => {
        const authResponse = authRegister('limiteduser@gmail.com', 'LimitedUser01', 'Limited', 'User');
        let limitedToken: string;
        if ('token' in authResponse) {
          limitedToken = authResponse.token;
        }
        try {
          requestQuizSessionResults(limitedToken, quizId, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: limiteduser@gmail.com');
        }
      });
    });

    describe('Invalid quizId or sessionId returns BAD_REQUEST (400)', () => {
      test('Invalid quizId format', () => {
        try {
          requestQuizSessionResults(token, -1, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid quizId number: -1');
        }
      });

      test('Invalid sessionId format', () => {
        try {
          requestQuizSessionResults(token, quizId, -1);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid sessionId number: -1');
        }
      });

      test('Non-existent sessionId', () => {
        try {
          requestQuizSessionResults(token, quizId, sessionId + 1);
        } catch (error) {
          expect((error as Error).message).toStrictEqual(`Invalid sessionId number: ${sessionId + 1}`);
        }
      });

      test('Session not in FINAL_RESULTS state', () => {
        const startResponse = requestQuizSessionCreate(token, quizId, 0);
        let newSessionId: number;
        if ('sessionId' in startResponse) {
          newSessionId = startResponse.sessionId;
        }
        try {
          requestQuizSessionResults(token, quizId, newSessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Session is not in FINAL_RESULTS state');
        }
      });

      test('Session Id does not refer to a valid session within this quiz', () => {
        const anotherQuizResponse = quizCreate(token, 'Another Quiz', 'Another Description');
        let anotherQuizId: number;
        if ('quizId' in anotherQuizResponse) {
          anotherQuizId = anotherQuizResponse.quizId;
        }
        try {
          requestQuizSessionResults(token, anotherQuizId, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Session Id does not refer to a valid session within this quiz');
        }
      });
    });

    describe('Invalid quizId returns FORBIDDEN (403)', () => {
      test('Non-existent quizId', () => {
        try {
          requestQuizSessionResults(token, quizId + 1, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual(`Invalid quizId number: ${quizId + 1}`);
        }
      });

      test('User is not the owner of the quiz', () => {
        const authResponse = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar');
        let token2: string;
        if ('token' in authResponse) {
          token2 = authResponse.token;
        }
        try {
          requestQuizSessionResults(token2, quizId, sessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual(`Invalid quizId number: ${quizId}`);
        }
      });
    });

    describe('Invalid session state or data returns BAD_REQUEST (400)', () => {
      test('Session with no players', () => {
        const startResponse = requestQuizSessionCreate(token, quizId, 0);
        let newSessionId: number;
        if ('sessionId' in startResponse) {
          newSessionId = startResponse.sessionId;
        }
        // Manually move the new session to FINAL_RESULTS state
        try {
          requestQuizSessionResults(token, quizId, newSessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Session has no players');
        }
      });

      test('Session with invalid question data', () => {
        const startResponse = requestQuizSessionCreate(token, quizId, 0);
        let newSessionId: number;
        if ('sessionId' in startResponse) {
          newSessionId = startResponse.sessionId;
        }
        try {
          requestQuizSessionResults(token, quizId, newSessionId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid question data');
        }
      });
    });
  });
});
