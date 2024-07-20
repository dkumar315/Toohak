import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  authRegister, requestAuthLogout,
  quizCreate, validQuizInfo, requestQuizRemove, requestQuizEmptyTrash,
  questionCreate, requestQuizQuestionDelete, requestQuizQuestionDuplicate,
  requestQuizSessionCreate, quizSessionCreate,
  requestClear, ResSessionId, ResQuizInfo, ERROR, ResError
} from './functionRequest';
import {
  QuestionBody
} from './quizQuestion';
import {
  SessionLimits, QuizSessionId
} from './quizSession';

beforeAll(() => requestClear());

let token: string, quizId: number, questionId: number;
const autoStartNum: number = SessionLimits.AUTO_START_NUM_MAX - 1;
let result: ResSessionId | ResError;

beforeEach(() => {
  requestClear();
  token = authRegister('e@gmail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
  quizId = quizCreate(token, 'time to start a kahoot', 'test you skill').quizId;
  const questionBody: QuestionBody = {
    question: `question of quiz ${quizId}`,
    duration: 10,
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
  questionId = questionCreate(token, quizId, questionBody).questionId; // https://url.jpg
});

afterAll(() => requestClear());

describe('testing adminQuizSessionCreate POST /v1/admin/quiz/{quizid}/session/start', () => {
  const VALID_CREATE: QuizSessionId = { sessionId: expect.any(Number) };
  test('route and trpe check', () => {
    result = requestQuizSessionCreate(token, quizId, autoStartNum) as ResSessionId;
    expect(typeof result === 'object' && 'sessionId' in result &&
    typeof result.sessionId === 'number').toBe(true);
  });

  describe('test 1.0 valid Returns', () => {
    test('test 1.1 autoStartNum < 50, sessions in END state > 10', () => {
      result = requestQuizSessionCreate(token, quizId, autoStartNum);
      expect(result).toMatchObject(VALID_CREATE);
      expect(result.status).toStrictEqual(OK);
    });

    test('test 1.2 Edge Case: autoStartNum is 50', () => {
      const newAutoStartNum: number = SessionLimits.AUTO_START_NUM_MAX;
      result = requestQuizSessionCreate(token, quizId, newAutoStartNum);
      expect(result).toMatchObject(VALID_CREATE);
      expect(result.status).toStrictEqual(OK);
    });

    test('test 1.3 Edge Case: 10 sessions is active (check test 2.2.3)', () => {
    });

    test('test 1.4 session start before quiz remove', () => {
      result = requestQuizSessionCreate(token, quizId, autoStartNum);
      requestQuizRemove(token, quizId);
      expect(result).toMatchObject(VALID_CREATE);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizSessionCreate(token, quizId, autoStartNum);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test 1.5 origin quiz does not moditify', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      quizSessionCreate(token, quizId, autoStartNum);
      // need PUT /v1/admin/quiz/{quizid}/session/{sessionid}
      const quizInfoUpdate: ResQuizInfo = validQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual(quizInfoUpdate);
    });

    test.skip('test 1.7 check active quiz sessions', () => {
      // const sessionId: number = quizSessionCreate(token, quizId, autoStartNum).sessionId;
      // need GET /v1/admin/quiz/{quizid}/sessions
      // const expectList: type = { activeSessions: [ sessionId ], inactiveSessions: [ ] }
      // expect(activeQuizList).toStrictEqual(expectList);
    });

    test('test 1.8 check moditify of quiz / question not effect running session', () => {
      quizSessionCreate(token, quizId, autoStartNum);
      // const sessionInfo1: ResQuizInfo =
      requestQuizQuestionDuplicate(token, quizId, questionId);
      // need GET /v1/admin/quiz/{quizid}/session/{sessionid}
      // const sessionInfo2: ResQuizInfo =
      // expect(sessionInfo1).toStrictEqual(sessionInfo2);
    });
  });

  describe('test 2.0 invlaid Return', () => {
    describe('test 2.1 token invalid (UNAUTHORIZED)', () => {
      test('test 2.1.1 user logged out', () => {
        requestAuthLogout(token);
        result = requestQuizSessionCreate(token, quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.2 user not exits', () => {
        requestClear();
        result = requestQuizSessionCreate(token, quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.3 invalid token format', () => {
        result = requestQuizSessionCreate('invalid', quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.4 empty token', () => {
        result = requestQuizSessionCreate('', quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test 2.2 quizId invalid (FORBIDDEN)', () => {
      test('test 2.2.1 invalid quizId format', () => {
        result = requestQuizSessionCreate(token, -1, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.2 not exist quizId', () => {
        result = requestQuizSessionCreate(token, quizId + 1, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.3 quiz is premently removed', () => {
        requestQuizRemove(token, quizId);
        requestQuizEmptyTrash(token, [quizId]);
        result = requestQuizSessionCreate(token, quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.4 user is not the owner of the quiz', () => {
        const token2: string = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = requestQuizSessionCreate(token2, quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);

        const quizId2: number = quizCreate(token2, 'quiz2', 'description').quizId;
        result = requestQuizSessionCreate(token, quizId2, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });

    describe('test 2.3 BAD_REQUEST', () => {
      test('test 2.2.1 autoStartNum is less than 0', () => {
        const newAutoStartNum: number = -1;
        result = requestQuizSessionCreate(token, quizId, newAutoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.2.2 autoStartNum is greater than 50', () => {
        const newAutoStartNum: number = SessionLimits.AUTO_START_NUM_MAX + 1;
        result = requestQuizSessionCreate(token, quizId, newAutoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.2.3 more than 10 active sessions in current quiz', () => {
        for (let i = 0; i < SessionLimits.ACTIVE_SESSIONS_NUM_MAX; i++) {
          result = requestQuizSessionCreate(token, quizId, autoStartNum);
          expect(result).toMatchObject(VALID_CREATE);
          expect(result.status).toStrictEqual(OK);
        }

        result = requestQuizSessionCreate(token, quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.2.4 quiz does not have any questions', () => {
        const quizId2: number = quizCreate(token, 'quiz2', '').quizId;
        result = requestQuizSessionCreate(token, quizId2, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.2.5 questions are removed', () => {
        requestQuizQuestionDelete(token, quizId, questionId);
        result = requestQuizSessionCreate(token, quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.2.6 quiz is in trash', () => {
        requestQuizRemove(token, quizId);
        result = requestQuizSessionCreate(token, quizId, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test 2.4 order of error returns', () => {
      test('test 2.4.1 token invalid (UNAUTHORIZED) and quizId not exist (FORBIDDEN)', () => {
        result = requestQuizSessionCreate('invalid token', quizId + 1, autoStartNum);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.4.2 token invalid (UNAUTHORIZED) and autoStartNum invalid (BAD_REQUEST)', () => {
        result = requestQuizSessionCreate('invalid token', quizId, autoStartNum + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.4.3 quizId not exist (FORBIDDEN) and autoStartNum invalid (BAD_REQUEST)', () => {
        result = requestQuizSessionCreate(token, quizId + 1, autoStartNum + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.4.4 quizId in trash (BAD_REQUEST) and autoStartNum invalid (BAD_REQUEST)', () => {
        requestQuizRemove(token, quizId);
        result = requestQuizSessionCreate(token, quizId, autoStartNum + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });
  });
});
