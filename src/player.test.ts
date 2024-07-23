import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  authRegister, requestAuthLogout,
  quizCreate, validQuizInfo, requestQuizRemove, requestQuizEmptyTrash,
  questionCreate, requestQuizQuestionDelete, requestQuizQuestionDuplicate,
  requestQuizSessionCreate, quizSessionCreate, requestPlayerJoin,
  requestClear, ResSessionId, ResQuizInfo, ERROR, ResError, ResPlayerId
} from './functionRequest';
import {
  QuestionBody
} from './quizQuestion';
import {
  SessionLimits, QuizSessionId
} from './quizSession';

import {
  PlayerId
} from './player';

beforeAll(requestClear);

let token: string, quizId: number, questionId: number, sessionId: number;
const autoStartNum: number = SessionLimits.AUTO_START_NUM_MAX - 1;
let result: ResPlayerId | ResError;

const validPlayerAdd: PlayerId = { playerId: expect.any(Number) };

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
  questionId = questionCreate(token, quizId, questionBody).questionId;
  sessionId = quizSessionCreate(token, quizId, 10).sessionId;
});

afterAll(requestClear);

describe('testing playerJoin POST /v1/player/join', () => {
  test('routes', () => {
    result = requestPlayerJoin(sessionId, 'name');
    expect(typeof result === 'object' && 'playerId' in result &&
      typeof result.playerId === 'number').toBe(true);
  });
  describe('test 1.0 valid inputs', () => {
    test('test 1.1 sessionId exist, playerNames empty', () => {
      result = requestPlayerJoin(sessionId, '');
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);

      result = requestPlayerJoin(sessionId, '');
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);
    });
    test('test 1.2 sessionId exist, quiz in trash / deleted', () => {
      requestQuizRemove(token, quizId);
      result = requestPlayerJoin(sessionId, '');
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);

      requestQuizEmptyTrash(token, [quizId]);
      result = requestPlayerJoin(sessionId, '');
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);
    });
    test('test 1.3 sessionId exist, player name not empty', () => {
      result = requestPlayerJoin(sessionId, 'name');
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test 2.0 invalid inputs', () => {
    test('test 2.1 sessionId not exist / incorrect format', () => {
      result = requestPlayerJoin(sessionId + 1, 'name');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
    test.skip('test 2.2 sessionId refer to session with other than LOBBY state', () => {
      // requires update session state
    });
    test('test 2.3 name of user is used in the session', () => {
      result = requestPlayerJoin(sessionId, 'name');
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);

      result = requestPlayerJoin(sessionId, 'name');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });
  describe('test 3.0 player data setup correctly', () => {
    test.skip('test 3.1 playerInfo: player initial state', () => {
      // require player Info
    });
  });
});
