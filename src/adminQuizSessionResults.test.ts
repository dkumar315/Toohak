import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  requestClear, authRegister, requestAuthLogout, quizCreate,
  requestQuizSessionResults, quizSessionCreate, ERROR,
  ResError, ResQuizSessionResults,
} from './functionRequest';
import { SessionLimits } from './quizSession';

beforeAll(() => requestClear());

let token: string, quizId: number, sessionId: number;
const autoStartNum: number = SessionLimits.AUTO_START_NUM_MAX - 1;
let result: ResQuizSessionResults | ResError;

beforeEach(() => {
  requestClear();
  token = authRegister('krishpatel@gmail.com', 'Krishpatel01', 'Krish', 'Patel').token;
  quizId = quizCreate(token, 'Sample Quiz', 'Sample Description').quizId;
  sessionId = quizSessionCreate(token, quizId, autoStartNum).sessionId;
});

afterAll(() => requestClear());

describe('Testing adminQuizSessionResults GET /v1/admin/quiz/{quizId}/session/{sessionId}/results', () => {
  const VALID_RESULT = {
    usersRankedByScore: expect.any(Array),
    questionResults: expect.any(Array)
  };

  describe('Valid Returns', () => {
    test('Valid request returns session results', () => {
      const result = requestQuizSessionResults(token, quizId, sessionId);
      if ('status' in result && result.status === OK) {
        expect(result).toMatchObject(VALID_RESULT);
      }
    });

    test('Valid request with different token and quizId', () => {
      const token2 = authRegister('anotheruser@gmail.com', 'AnotherUser01', 'Another', 'User').token;
      const quizId2 = quizCreate(token2, 'Another Sample Quiz', 'Another Description').quizId;
      const sessionId2 = quizSessionCreate(token2, quizId2, autoStartNum).sessionId;
      const result = requestQuizSessionResults(token2, quizId2, sessionId2);
      if ('status' in result && result.status === OK) {
        expect(result).toMatchObject(VALID_RESULT);
      }
    });
  });

  describe('Invalid Returns', () => {
    describe('Invalid token returns UNAUTHORIZED (401)', () => {
      test('User logged out', () => {
        requestAuthLogout(token);
        result = requestQuizSessionResults(token, quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('User not exists', () => {
        requestClear();
        result = requestQuizSessionResults(token, quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('Invalid token format', () => {
        result = requestQuizSessionResults('invalid', quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('Empty token', () => {
        result = requestQuizSessionResults('', quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('Invalid quizId returns FORBIDDEN (403)', () => {
      test('Invalid quizId format', () => {
        result = requestQuizSessionResults(token, -1, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('Non-existent quizId', () => {
        result = requestQuizSessionResults(token, quizId + 1, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('User is not the owner of the quiz', () => {
        const token2 = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar').token;
        result = requestQuizSessionResults(token2, quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });

    describe('Invalid session state or data returns BAD_REQUEST (400)', () => {
      test('invalid sessionId format', () => {
        result = requestQuizSessionResults(token, quizId, -1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('sessionId does not exist', () => {
        result = requestQuizSessionResults(token, quizId, sessionId + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Session with no players', () => {
        const sessionId2 = quizSessionCreate(token, quizId, autoStartNum).sessionId;
        result = requestQuizSessionResults(token, quizId, sessionId2);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Session Id does not refer to a valid session within this quiz', () => {
        const quizId2 = quizCreate(token, 'Another Quiz', 'Another Description').quizId;
        result = requestQuizSessionResults(token, quizId2, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Session not in FINAL_RESULTS state', () => {
        result = requestQuizSessionResults(token, quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });
  });
});
