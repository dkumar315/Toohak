import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  requestClear, authRegister, requestAuthLogout,
  quizCreate, requestQuizRemove, requestQuizEmptyTrash,
  quizSessionCreate, quizSessionUpdate,
  ERROR, ResError, ResEmpty,
  questionCreate,
} from './functionRequest';
import { QuestionBody } from './quizQuestion';
import {
  SessionLimits
} from './quizSession';
import sleepSync from 'slync';

beforeAll(() => requestClear());

let token: string, quizId: number, sessionId: number;
const autoStartNum: number = SessionLimits.AUTO_START_NUM_MAX - 1;
let result: ResEmpty | ResError;

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

afterAll(() => requestClear());

describe('testing adminQuizSessionUpdate PUT /v1/admin/quiz/{quizId}/session/{sessionid}', () => {
  const VALID_UPDATE = {};

  test('route and type check', () => {
    result = quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    expect(result).toMatchObject(VALID_UPDATE);
    expect(result.status).toStrictEqual(OK);
  });

  describe('test 1.0 valid Returns', () => {
    test('test 1.1 valid action NEXT_QUESTION', () => {
      result = quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
      expect(result).toMatchObject(VALID_UPDATE);
      expect(result.status).toStrictEqual(OK);
    });

    test('test 1.2 valid action SKIP_COUNTDOWN', () => {
      quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
      result = quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
      expect(result).toMatchObject(VALID_UPDATE);
      expect(result.status).toStrictEqual(OK);
    });

    test('test 1.3 valid action GO_TO_ANSWER', () => {
      quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
      quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
      result = quizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
      expect(result).toMatchObject(VALID_UPDATE);
      expect(result.status).toStrictEqual(OK);
    });

    test('test 1.4 valid action GO_TO_FINAL_RESULTS', () => {
      quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
      quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
      quizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
      result = quizSessionUpdate(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');
      expect(result).toMatchObject(VALID_UPDATE);
      expect(result.status).toStrictEqual(OK);
    });

    test('test 1.5 valid action END', () => {
      result = quizSessionUpdate(token, quizId, sessionId, 'END');
      expect(result).toMatchObject(VALID_UPDATE);
      expect(result.status).toStrictEqual(OK);
    });

    describe('test 1.6 timer checks', () => {
      test.skip('test 1.6.1 timer for QUESTION_COUNTDOWN to QUESTION_OPEN', () => {
        quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        sleepSync(3000);
        // const sessionState = adminQuizSessionState(quizId, sessionId);
        // expect(sessionState).toStrictEqual('QUESTION_OPEN');
      });

      test.skip('test 1.6.2 timer for QUESTION_OPEN to QUESTION_CLOSE', () => {
        quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        sleepSync(3000);
        sleepSync(5000);
        // const sessionState = adminQuizSessionState(quizId, sessionId);
        // expect(sessionState).toStrictEqual('QUESTION_CLOSE');
      });

      test('test 1.6.3 timer for QUESTION_OPEN to QUESTION_CLOSE when question countdown skipped', () => {
        quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
        sleepSync(5000);
        // const sessionState = adminQuizSessionState(quizId, sessionId);
        // expect(sessionState).toStrictEqual('QUESTION_CLOSE');
      });
    });
  });

  describe('test 2.0 invalid Returns', () => {
    describe('test 2.1 token invalid (UNAUTHORIZED)', () => {
      test('test 2.1.1 user logged out', () => {
        requestAuthLogout(token);
        result = quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.2 user not exists', () => {
        requestClear();
        result = quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.3 invalid token format', () => {
        result = quizSessionUpdate('invalid', quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.1.4 empty token', () => {
        result = quizSessionUpdate('', quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test 2.2 quizId invalid (FORBIDDEN)', () => {
      test('test 2.2.1 invalid quizId format', () => {
        result = quizSessionUpdate(token, -1, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.2 quizId does not exist', () => {
        result = quizSessionUpdate(token, quizId + 1, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.3 quizId is permanently removed', () => {
        requestQuizRemove(token, quizId);
        requestQuizEmptyTrash(token, [quizId]);
        result = quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test 2.2.4 user is not the owner of the quiz', () => {
        const token2: string = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = quizSessionUpdate(token2, quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });

    describe('test 2.3 BAD_REQUEST', () => {
      test('test 2.3.1 invalid sessionId format', () => {
        result = quizSessionUpdate(token, quizId, -1, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.2 sessionId does not exist', () => {
        result = quizSessionUpdate(token, quizId, sessionId + 1, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.3 session already ended', () => {
        quizSessionUpdate(token, quizId, sessionId, 'END');
        result = quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.4 invalid action', () => {
        result = quizSessionUpdate(token, quizId, sessionId, 'INVALID_ACTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.5 action NEXT_QUESTION in END state', () => {
        quizSessionUpdate(token, quizId, sessionId, 'END');
        result = quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.6 action SKIP_COUNTDOWN in QUESTION_OPEN state', () => {
        quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
        result = quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.7 action GO_TO_ANSWER in QUESTION_COUNTDOWN state', () => {
        quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
        result = quizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test 2.3.8 action GO_TO_FINAL_RESULTS in LOBBY state', () => {
        result = quizSessionUpdate(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test 2.4 order of error returns', () => {
      test('test 2.4.1 token invalid (UNAUTHORIZED) and quizId not exist (FORBIDDEN)', () => {
        result = quizSessionUpdate('invalid token', quizId + 1, sessionId, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.4.2 token invalid (UNAUTHORIZED) and sessionId not exist (BAD_REQUEST)', () => {
        result = quizSessionUpdate('invalid token', quizId, sessionId + 1, 'NEXT_QUESTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.4.3 token invalid (UNAUTHORIZED) and action invalid (BAD_REQUEST)', () => {
        result = quizSessionUpdate('invalid token', quizId, sessionId, 'INVALID_ACTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test 2.4.4 quizId not exist (FORBIDDEN) and action invalid (BAD_REQUEST)', () => {
        result = quizSessionUpdate(token, quizId + 1, sessionId, 'INVALID_ACTION');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });
  });
});
