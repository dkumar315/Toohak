import { OK, BAD_REQUEST, ErrorObject } from './dataStore';
import { QuestionBody } from './quizQuestion';
import {
  authRegister, quizCreate, questionCreate,
  quizSessionCreate, requestPlayerJoin, requestPlayerQuestionPosition,
  requestClear, ResError, ResPlayerId, ResQuestionResults, requestQuizSessionUpdate, requestAdminQuizSessionStatus
} from './functionRequest';

beforeAll(requestClear);

let token: string, quizId: number, sessionId: number, playerId: number;
let result: ResQuestionResults | ResError;

const ERROR: ErrorObject = { error: expect.any(String) };

const validQuestionResults = {
  questionId: expect.any(Number),
  question: expect.any(String),
  duration: expect.any(Number),
  thumbnailUrl: expect.any(String),
  points: expect.any(Number),
  answers: expect.arrayContaining([
    {
      answerId: expect.any(Number),
      answer: expect.any(String),
      colour: expect.any(String),
    }
  ]),
};

beforeEach(() => {
  requestClear();
  token = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
  quizId = quizCreate(token, 'Sample Quiz', 'Description').quizId;
  const questionBody: QuestionBody = {
    question: `Sample question for quiz ${quizId}`,
    duration: 10,
    points: 5,
    answers: [
      { answer: 'Correct Answer', correct: true },
      { answer: 'Wrong Answer', correct: false }
    ],
    thumbnailUrl: 'http://google.com/img_path.jpg'
  };
  questionCreate(token, quizId, questionBody);
  sessionId = quizSessionCreate(token, quizId, 1).sessionId;
  playerId = (requestPlayerJoin(sessionId, 'player1') as ResPlayerId).playerId;

  requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
});

afterAll(requestClear);

describe('Testing /v1/player/:playerid/question/:questionposition', () => {
  describe('Valid Returns', () => {
    test('Valid player ID and question position', () => {
      let sessionStatusResponse = requestAdminQuizSessionStatus(token, quizId, sessionId);

      while ('state' in sessionStatusResponse && sessionStatusResponse.state !== 'QUESTION_OPEN') {
        sessionStatusResponse = requestAdminQuizSessionStatus(token, quizId, sessionId);
      }

      if ('state' in sessionStatusResponse) {
        expect(sessionStatusResponse.status).toStrictEqual(OK);
        expect(sessionStatusResponse.state).toStrictEqual('QUESTION_OPEN');
      }

      result = requestPlayerQuestionPosition(playerId, 1) as ResQuestionResults;
      expect(result).toMatchObject(validQuestionResults);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('Invalid Returns', () => {
    test('Invalid player ID', () => {
      result = requestPlayerQuestionPosition(-1, 1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Invalid question position', () => {
      result = requestPlayerQuestionPosition(playerId, 999) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Player ID does not exist', () => {
      result = requestPlayerQuestionPosition(playerId + 1, 1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Session is in LOBBY state', () => {
      requestClear();
      token = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
      quizId = quizCreate(token, 'Sample Quiz', 'Description').quizId;
      sessionId = quizSessionCreate(token, quizId, 1).sessionId;
      playerId = (requestPlayerJoin(sessionId, 'player1') as ResPlayerId).playerId;

      result = requestPlayerQuestionPosition(playerId, 1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Session is in QUESTION_COUNTDOWN state', () => {
      requestClear();
      token = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
      quizId = quizCreate(token, 'Sample Quiz', 'Description').quizId;
      sessionId = quizSessionCreate(token, quizId, 1).sessionId;
      playerId = (requestPlayerJoin(sessionId, 'player1') as ResPlayerId).playerId;
      requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

      result = requestPlayerQuestionPosition(playerId, 1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Session is in FINAL_RESULTS state', () => {
      requestClear();
      token = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
      quizId = quizCreate(token, 'Sample Quiz', 'Description').quizId;
      sessionId = quizSessionCreate(token, quizId, 1).sessionId;
      playerId = (requestPlayerJoin(sessionId, 'player1') as ResPlayerId).playerId;
      requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');

      result = requestPlayerQuestionPosition(playerId, 1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Session is in END state', () => {
      requestClear();
      token = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
      quizId = quizCreate(token, 'Sample Quiz', 'Description').quizId;
      sessionId = quizSessionCreate(token, quizId, 1).sessionId;
      playerId = (requestPlayerJoin(sessionId, 'player1') as ResPlayerId).playerId;
      requestQuizSessionUpdate(token, quizId, sessionId, 'END');

      result = requestPlayerQuestionPosition(playerId, 1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });
});
