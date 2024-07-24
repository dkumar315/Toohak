import { OK } from './dataStore';
import {
  authRegister, requestAuthLogout,
  quizCreate, requestQuizRemove, requestQuizEmptyTrash,
  requestAdminQuizSessions, requestClear, ResQuizSessions
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
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('Invalid Returns', () => {
    describe('Invalid token returns UNAUTHORIZED (401)', () => {
      test('User logged out', () => {
        requestAuthLogout(token);
        try {
          requestAdminQuizSessions(token, quizId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: krishpatel@gmail.com');
        }
      });

      test('User not exists', () => {
        requestClear();
        try {
          requestAdminQuizSessions(token, quizId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: krishpatel@gmail.com');
        }
      });

      test('Invalid token format', () => {
        try {
          requestAdminQuizSessions('invalid', quizId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: invalid');
        }
      });

      test('Empty token', () => {
        try {
          requestAdminQuizSessions('', quizId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid token string: ');
        }
      });
    });

    describe('Invalid quizId returns FORBIDDEN (403)', () => {
      test('Invalid quizId format', () => {
        try {
          requestAdminQuizSessions(token, -1);
        } catch (error) {
          expect((error as Error).message).toStrictEqual('Invalid quizId number: -1');
        }
      });

      test('Non-existent quizId', () => {
        try {
          requestAdminQuizSessions(token, quizId + 1);
        } catch (error) {
          expect((error as Error).message).toStrictEqual(`Invalid quizId number: ${quizId + 1}`);
        }
      });

      test('Permanently removed quizId', () => {
        requestQuizRemove(token, quizId);
        requestQuizEmptyTrash(token, [quizId]);
        try {
          requestAdminQuizSessions(token, quizId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual(`Invalid quizId number: ${quizId}`);
        }
      });

      test('User is not the owner of the quiz', () => {
        const token2: string = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar').token;
        try {
          requestAdminQuizSessions(token2, quizId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual(`Invalid quizId number: ${quizId}`);
        }
      });

      test('User is not the owner of the trash quiz', () => {
        const token2: string = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar').token;
        requestQuizRemove(token, quizId);
        try {
          requestAdminQuizSessions(token2, quizId);
        } catch (error) {
          expect((error as Error).message).toStrictEqual(`Invalid quizId number: ${quizId}`);
        }
      });
    });
  });
});
