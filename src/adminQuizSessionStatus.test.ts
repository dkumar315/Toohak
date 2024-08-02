import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, ErrorObject } from './dataStore';
import {
  requestClear, authRegister, requestAuthLogout, quizCreate,
  quizSessionCreate, quizSessionStatus, questionCreate,
  ResError, ResQuizSessionStatus,
} from './functionRequest';
import { QuestionBody } from './quizQuestion';
import {
  SessionLimits
} from './quizSession';

beforeAll(requestClear);
let token: string, quizId: number, sessionId: number;
const autoStartNum: number = SessionLimits.AUTO_START_NUM_MAX - 1;
let result: ResQuizSessionStatus | ResError;
const ERROR: ErrorObject = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
  token = authRegister('e@gmail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
  quizId = quizCreate(token, 'time to start a kahoot', 'test your skill').quizId;
  const questionBody: QuestionBody = {
    question: `question of quiz ${quizId}`,
    duration: 5,
    points: 8,
    answers: [
      {
        answer: '1 right answer at least',
        correct: true
      },
      {
        answer: '2 answers minimum',
        correct: true
      }],
    thumbnailUrl: 'http://google.com/img_path.jpg'
  };
  questionCreate(token, quizId, questionBody);
  sessionId = quizSessionCreate(token, quizId, autoStartNum).sessionId;
});

afterAll(requestClear);

describe('testing quizSessionStatus GET /v1/admin/quiz/{quizId}/session/{sessionId}', () => {
  const VALID_STATUS = {
    state: expect.any(String),
    atQuestion: expect.any(Number),
    players: expect.any(Array),
    metadata: {
      quizId: expect.any(Number),
      name: expect.any(String),
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: expect.any(String),
      numQuestions: expect.any(Number),
      questions: expect.any(Array),
      duration: expect.any(Number),
      thumbnailUrl: expect.any(String)
    }
  };

  describe('test 1.0 valid Returns', () => {
    test('test 1.1 valid status retrieval', () => {
      result = quizSessionStatus(token, quizId, sessionId);
      expect(result).toMatchObject(VALID_STATUS);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test 2.0 invalid Returns', () => {
    describe('test 2.1 token invalid (UNAUTHORIZED)', () => {
      test('test 2.1.1 user logged out', () => {
        requestAuthLogout(token);
        result = quizSessionStatus(token, quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.2 user not exists', () => {
        requestClear();
        result = quizSessionStatus(token, quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.3 invalid token format', () => {
        result = quizSessionStatus('invalid', quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.4 empty token', () => {
        result = quizSessionStatus('', quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test 2.2 quizId invalid (FORBIDDEN)', () => {
      test('test 2.2.1 invalid quizId format', () => {
        result = quizSessionStatus(token, -1, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.2 quizId does not exist', () => {
        result = quizSessionStatus(token, quizId + 1, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.4 user is not the owner of the quiz', () => {
        const token2: string = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = quizSessionStatus(token2, quizId, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });

    describe('test 2.3 BAD_REQUEST', () => {
      test('test 2.3.1 invalid sessionId format', () => {
        result = quizSessionStatus(token, quizId, -1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.2 sessionId does not exist', () => {
        result = quizSessionStatus(token, quizId, sessionId + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      // test('test 2.3.3 session already ended', () => {
      //   quizSessionUpdate(token, quizId, sessionId, 'END');
      //   result = quizSessionStatus(token, quizId, sessionId);
      //   expect(result).toMatchObject(ERROR);
      //   expect(result.status).toStrictEqual(BAD_REQUEST);
      // });
    });

    describe('test 2.4 order of error returns', () => {
      test('test 2.4.1 token invalid (UNAUTHORIZED) and quizId not exist (FORBIDDEN)', () => {
        result = quizSessionStatus('invalid token', quizId + 1, sessionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.4.2 token invalid (UNAUTHORIZED) and sessionId not exist (BAD_REQUEST)', () => {
        result = quizSessionStatus('invalid token', quizId, sessionId + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });
  });
});
