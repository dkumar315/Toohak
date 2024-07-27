import { FORBIDDEN, OK, UNAUTHORIZED } from './dataStore';
import {
  authRegister, requestAuthLogout, quizCreate,
  requestQuizRemove, requestQuizEmptyTrash,
  requestAdminQuizSessions, requestClear,
  ResQuizSessions, ResError, ERROR
} from './functionRequest';

beforeAll(() => requestClear());

let token: string, quizId: number;
let result: ResQuizSessions | ResError;

beforeEach(() => {
  requestClear();
  token = authRegister('krishpatel@gmail.com', 'Krishpatel01', 'Krish', 'Patel').token;
  quizId = quizCreate(token, 'Random Sample Quiz', 'Random Description').quizId;
});

afterAll(() => requestClear());

describe('Testing adminQuizSessions', () => {
  const VALID_RESPONSE = { activeSessions: expect.any(Array<number>), inactiveSessions: expect.any(Array<number>) };

  describe('Valid Returns', () => {
    test('Valid request returns active and inactive sessions', () => {
      result = requestAdminQuizSessions(token, quizId);
      expect(result).toMatchObject(VALID_RESPONSE);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('Invalid Returns', () => {
    describe('Invalid token returns UNAUTHORIZED (401)', () => {
      test('User logged out', () => {
        requestAuthLogout(token);
        result = requestAdminQuizSessions(token, quizId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('User not exists', () => {
        requestClear();
        result = requestAdminQuizSessions(token, quizId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('Invalid token format', () => {
        result = requestAdminQuizSessions('invalid', quizId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('Empty token', () => {
        result = requestAdminQuizSessions('', quizId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('Invalid quizId returns FORBIDDEN (403)', () => {
      test('Invalid quizId format', () => {
        result = requestAdminQuizSessions(token, -1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('Non-existent quizId', () => {
        result = requestAdminQuizSessions(token, quizId + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('Permanently removed quizId', () => {
        requestQuizRemove(token, quizId);
        requestQuizEmptyTrash(token, [quizId]);

        result = requestAdminQuizSessions(token, quizId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('User is not the owner of the quiz', () => {
        const token2: string = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar').token;

        result = requestAdminQuizSessions(token2, quizId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('User is not the owner of the trash quiz', () => {
        const token2: string = authRegister('devaanshkumar@gmail.com', 'Devaanshkumar01', 'Devaansh', 'Kumar').token;
        requestQuizRemove(token, quizId);

        result = requestAdminQuizSessions(token2, quizId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });
  });
});
