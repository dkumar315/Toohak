import { OK, BAD_REQUEST } from './dataStore';
import {
  requestClear, authRegister, quizCreate, questionCreate,
  quizSessionCreate, playerJoin, requestPlayerQuestionAnswer,
  requestQuizSessionUpdate,
  quizSessionUpdate
} from './functionRequest';

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
      { answer: 'Wrong Answer', correct: false }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };
  questionCreate(token, quizId, questionBody);
  sessionId = quizSessionCreate(token, quizId, 1).sessionId;
  playerId = playerJoin(sessionId, 'Player1').playerId;
});

afterAll(requestClear);

describe('Testing /v1/player/:playerid/question/:questionposition/answer', () => {
  test.skip('Valid answer submission', () => {
    quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    const response = requestPlayerQuestionAnswer(playerId, 1, [1]);
    expect(response.status).toStrictEqual(OK);
  });

  test('Invalid player ID', () => {
    const response = requestPlayerQuestionAnswer(-1, 1, [1]);
    expect(response.status).toStrictEqual(BAD_REQUEST);
  });

  test('Invalid question position', () => {
    const response = requestPlayerQuestionAnswer(playerId, 999, [1]);
    expect(response.status).toStrictEqual(BAD_REQUEST);
  });

  test('Invalid answer ID', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    const response = requestPlayerQuestionAnswer(playerId, 1, [999]);
    expect(response.status).toStrictEqual(BAD_REQUEST);
  });

  test('Session not in QUESTION_OPEN state', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');

    const response = requestPlayerQuestionAnswer(playerId, 1, [1]);
    expect(response.status).toStrictEqual(BAD_REQUEST);
  });

  test('Duplicate answer IDs', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    const response = requestPlayerQuestionAnswer(playerId, 1, [1, 1]);
    expect(response.status).toStrictEqual(BAD_REQUEST);
  });

  test('No answer IDs submitted', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');

    const response = requestPlayerQuestionAnswer(playerId, 1, []);
    expect(response.status).toStrictEqual(BAD_REQUEST);
  });
});
