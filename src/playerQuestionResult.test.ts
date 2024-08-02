import { OK, BAD_REQUEST, ErrorObject } from './dataStore';
import {
  authRegister, quizCreate, questionCreate, playerJoin,
  quizSessionCreate, quizSessionUpdate, requestClear,
  requestPlayerQuestionResults, ResError, ResQuestionResults
} from './functionRequest';

const ERROR: ErrorObject = { error: expect.any(String) };

beforeAll(requestClear);

let token: string, quizId: number,
  sessionId: number, playerId: number,
  result: ResQuestionResults | ResError;

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

describe('Testing playerQuestionAnswer /v1/player/{playerid}/question/{questionposition}/results', () => {
  const VALID_RESULTS = {
    questionId: expect.any(Number),
    playersCorrectList: expect.any(Array<string>),
    averageAnswerTime: expect.any(Number),
    percentCorrect: expect.any(Number)
  };

  test('Successfully retrieves question results', () => {
    quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    quizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    result = requestPlayerQuestionResults(playerId, 1);
    expect(result).toMatchObject(VALID_RESULTS);
    expect(result.status).toStrictEqual(OK);
  });

  test('Error when playerId is invalid', () => {
    result = requestPlayerQuestionResults(-1, 1);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when playerId is missing', () => {
    result = requestPlayerQuestionResults(playerId + 1, 1);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when questionId is invalid', () => {
    result = requestPlayerQuestionResults(playerId, -1);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when questionId is invalid', () => {
    result = requestPlayerQuestionResults(playerId, 2);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when session state is not ANSWER_SHOW', () => {
    quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    result = requestPlayerQuestionResults(playerId, 1);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });
});
