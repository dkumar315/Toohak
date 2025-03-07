import { OK, BAD_REQUEST, ErrorObject } from './dataStore';
import {
  requestClear, authRegister, quizCreate, questionCreate,
  quizSessionCreate, playerJoin, requestPlayerQuestionAnswer,
  requestQuizSessionUpdate, quizSessionUpdate
} from './functionRequest';

const ERROR: ErrorObject = { error: expect.any(String) };

beforeAll(requestClear);

let token: string, quizId: number, sessionId: number, playerId: number;

beforeEach(() => {
  requestClear();
  token = authRegister('test@example.com', 'Test1234', 'John', 'Doe').token;
  quizId = quizCreate(token, 'Test Quiz', 'This is a test quiz').quizId;
  const questionBody = {
    question: 'Sample question?',
    duration: 30,
    points: 10,
    answers: [
      { answer: 'Correct Answer', correct: true },
      { answer: 'Another Correct Answer', correct: true },
      { answer: 'Wrong Answer', correct: false }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };
  questionCreate(token, quizId, questionBody);
  sessionId = quizSessionCreate(token, quizId, 1).sessionId;
  playerId = playerJoin(sessionId, 'Player1').playerId;
});

afterAll(requestClear);

describe('Testing playerQuestionAnswer /v1/player/:playerid/question/:questionposition/answer', () => {
  test('Valid answer submission', () => {
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    const result = requestPlayerQuestionAnswer(playerId, 1, [1, 2]);
    expect(result).toMatchObject({});
    expect(result.status).toStrictEqual(OK);
  });

  test('Valid answer submission but incomplete', () => {
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    const result = requestPlayerQuestionAnswer(playerId, 1, [1]);
    expect(result).toMatchObject({});
    expect(result.status).toStrictEqual(OK);
  });

  test('Invalid player ID', () => {
    const result = requestPlayerQuestionAnswer(-1, 1, [1]);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Invalid question position', () => {
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    const result = requestPlayerQuestionAnswer(playerId, 999, [1]);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Invalid answer ID', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    const result = requestPlayerQuestionAnswer(playerId, 1, [999]);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Session not in QUESTION_OPEN state', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');

    const result = requestPlayerQuestionAnswer(playerId, 1, [1]);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Duplicate answer IDs', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    const result = requestPlayerQuestionAnswer(playerId, 1, [1, 1]);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('No answer IDs submitted', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    const result = requestPlayerQuestionAnswer(playerId, 1, []);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });
});
