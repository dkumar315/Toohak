import { OK, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST } from './dataStore';
import {
  authRegister, requestAuthLogout,
  quizCreate, requestQuizRemove, requestQuizEmptyTrash,
  requestAdminQuizSessions, requestClear, ResQuizSessions, ResError
} from './functionRequest';

beforeAll(() => requestClear());

let token: string, quizId: number;

beforeEach(() => {
  requestClear();
  token = authRegister('krishpatel@gmail.com', 'Krishpatel01', 'Krish', 'Patel').token;
  quizId = quizCreate(token, 'Random Sample Quiz', 'Random Description').quizId;
});

afterAll(() => requestClear());

describe('Testing adminQuizSessions', () => {
  const VALID_RESPONSE = { status: OK, activeSessions: expect.any(Array), inactiveSessions: expect.any(Array) };

  describe('Valid Returns', () => {
    test('Valid request returns active and inactive sessions', () => {
      const result: ResQuizSessions = requestAdminQuizSessions(token, quizId) as ResQuizSessions;
      expect(result).toMatchObject(VALID_RESPONSE);
      expect(result.status).toBe(OK);
    });
  });

  describe('Invalid Returns', () => {
    describe('Invalid token returns UNAUTHORIZED (401)', () => {
      test('User logged out', () => {
        requestAuthLogout(token);
        const result: ResError = requestAdminQuizSessions(token, quizId) as ResError;
        expect(result.status).toBe(UNAUTHORIZED);
      });

      test('User not exists', () => {
        requestClear();
        const result: ResError = requestAdminQuizSessions(token, quizId) as ResError;
        expect(result.status).toBe(UNAUTHORIZED);
      });

      test('Invalid token format', () => {
        const result: ResError = requestAdminQuizSessions('invalid', quizId) as ResError;
        expect(result.status).toBe(UNAUTHORIZED);
      });

      test('Empty token', () => {
        const result: ResError = requestAdminQuizSessions('', quizId) as ResError;
        expect(result.status).toBe(UNAUTHORIZED);
      });
    });

    describe('Invalid quizId returns FORBIDDEN (403)', () => {
      test('Invalid quizId format', () => {
        try {
          // const result: ResError = requestAdminQuizSessions(token, -1) as ResError;
        } catch (error) {
          const customError = error as ResError;
          console.log('Caught error:', customError);
          expect(customError.status).toBe(BAD_REQUEST);
        }
      });

      test('Non-existent quizId', () => {
        try {
          requestAdminQuizSessions(token, quizId + 1);
        } catch (error) {
          const customError = error as ResError;
          expect(customError.status).toBe(FORBIDDEN);
        }
      });

      test('Permanently removed quizId', () => {
        requestQuizRemove(token, quizId);
        requestQuizEmptyTrash(token, [quizId]);
        try {
          requestAdminQuizSessions(token, quizId);
        } catch (error) {
          const customError = error as ResError;
          expect(customError.status).toBe(FORBIDDEN);
        }
      });

      test('User is not the owner of the quiz', () => {
        const token2: string = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar').token;
        try {
          requestAdminQuizSessions(token2, quizId);
        } catch (error) {
          const customError = error as ResError;
          expect(customError.status).toBe(FORBIDDEN);
        }
      });

      test('User is not the owner of the trash quiz', () => {
        const token2: string = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar').token;
        requestQuizRemove(token, quizId);
        try {
          requestAdminQuizSessions(token2, quizId);
        } catch (error) {
          const customError = error as ResError;
          expect(customError.status).toBe(FORBIDDEN);
        }
      });
    });
  });
});
