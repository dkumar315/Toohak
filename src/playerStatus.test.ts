import { OK, BAD_REQUEST, ErrorObject } from './dataStore';
import { QuestionBody } from './quizQuestion';
import {
  authRegister, quizCreate, questionCreate,
  quizSessionCreate, requestPlayerJoin, requestPlayerStatus,
  requestClear, ResError, ResPlayerStatus, ResPlayerId
} from './functionRequest';

const ERROR: ErrorObject = { error: expect.any(String) };

beforeAll(requestClear);

let token: string, quizId: number,
  sessionId: number, playerId: number,
  result: ResPlayerStatus | ResError;
const validPlayerStatus = {
  state: expect.any(String),
  numQuestions: expect.any(Number),
  atQuestion: expect.any(Number)
};

beforeEach(() => {
  requestClear();
  token = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
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
      }
    ],
    thumbnailUrl: 'http://google.com/img_path.jpg'
  };
  questionCreate(token, quizId, questionBody);
  sessionId = quizSessionCreate(token, quizId, 10).sessionId;
  playerId = (requestPlayerJoin(sessionId, 'name') as ResPlayerId).playerId;
});

afterAll(requestClear);

describe('testing playerStatus GET /v1/player/:playerId', () => {
  describe('test 1.0 valid inputs', () => {
    test('test 1.1 valid playerId', () => {
      result = requestPlayerStatus(playerId);
      expect(result).toMatchObject(validPlayerStatus);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test 2.0 invalid inputs', () => {
    test('test 2.1 invalid playerId', () => {
      result = requestPlayerStatus(-1);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test 2.2 playerId does not exist', () => {
      result = requestPlayerStatus(playerId + 1);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });

  describe('test 3.0 player data setup correctly', () => {
    test('test 3.1 initial player state', () => {
      result = requestPlayerStatus(playerId);
      expect(result).toMatchObject({
        state: 'LOBBY',
        numQuestions: 1,
        atQuestion: 1
      });
      expect(result.status).toStrictEqual(OK);
    });
  });
});
