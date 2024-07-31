import {
  OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, ErrorObject, Actions
} from './dataStore';
import { QuestionBody } from './quizQuestion';
import {
  authRegister, quizCreate, questionCreate, quizSessionCreate,
  playerJoin, requestClear, quizSessionUpdate,
  requestQuizSessionResultsCSV as requestCSVResult, ResError, ResCSVResult,
  requestQuizRemove, // requestPlayerQuestionAnswer
} from './functionRequest';

beforeAll(requestClear);
afterAll(requestClear);

let token: string, quizId: number;
// let playerId1: number, playerId2: number, playerId3: number;
let sessionId: number;
let result: ResCSVResult | ResError;
const ERROR: ErrorObject = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
  token = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
  quizId = quizCreate(token, 'time to start a kahoot', 'test you skill').quizId;
  const questionBody: QuestionBody = {
    question: 'question requirement of quiz',
    duration: 10,
    points: 8,
    answers: [
      {
        answer: 'minimum 1 true answer',
        correct: true
      },
      {
        answer: 'minimum 2 answers in total',
        correct: true
      },
      {
        answer: 'need a false answer',
        correct: false
      }],
    thumbnailUrl: 'http://imgName.png'
  };
  questionCreate(token, quizId, questionBody);
  questionCreate(token, quizId, questionBody);
  playerJoin(sessionId, 'remove after answer implement');
  // playerId1 = playerJoin(sessionId, 'player1').playerId;
  // playerId2 = playerJoin(sessionId, 'player2').playerId;
  // playerId3 = playerJoin(sessionId, 'player3').playerId;
  sessionId = quizSessionCreate(token, quizId, 3).sessionId;
});

describe('testing adminQuizSessionResultsCSV /v1/player/{playerid}/chat', () => {
  test.skip('test 1.0 valid returns', () => {
    // // patially correct ans => score 0
    // requestPlayerQuestionAnswer(playerId3, 1, [1]);
    // // correct ans, player2 quicker
    // requestPlayerQuestionAnswer(playerId2, 1, [1, 2]);
    // requestPlayerQuestionAnswer(playerId1, 1, [2, 1]);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    // name,question1score,question1rank,question2score,question2rank
    // player1,4,2,0,0
    // player2,8,1,0,0
    // player3,0,0,0,0

    result = requestCSVResult(token, quizId, sessionId);

    expect(result).toMatchObject({ url: expect.any(String) });
    expect(result.status).toStrictEqual(OK);
  });

  test.skip('test 1.1 valid returns rank', () => {
    // expect
    // name,question1score,question1rank,question2score,question2rank
    // player1,0,0,8
    // player2,0,0,4
    // player3,8,1,3

    // requestPlayerQuestionAnswer(playerId3, 1, [1,2]);
    // requestPlayerQuestionAnswer(playerId2, 1, [2]);
    // requestPlayerQuestionAnswer(playerId1, 1, []);

    // requestPlayerQuestionAnswer(playerId1, 2, [1, 2]);
    // requestPlayerQuestionAnswer(playerId2, 2, [2, 1]);
    // requestPlayerQuestionAnswer(playerId3, 2, [1, 2]);

    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    result = requestCSVResult(token, quizId, sessionId);

    expect(result).toMatchObject({ url: expect.any(String) });
    expect(result.status).toStrictEqual(OK);
  });

  test('test 1.2 quiz in Trash or quizRemove should not affect', () => {
    requestQuizRemove(token, quizId);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    result = requestCSVResult(token, quizId, sessionId);
    expect(result).toMatchObject({ url: expect.any(String) });
    expect(result.status).toStrictEqual(OK);
  });

  test('test 2.0 invalid token', () => {
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    result = requestCSVResult('', quizId, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(UNAUTHORIZED);

    result = requestCSVResult(token + 1, quizId, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(UNAUTHORIZED);

    result = requestCSVResult('invalid', quizId, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(UNAUTHORIZED);
  });

  test('test 2.1 invalid quizId', () => {
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    result = requestCSVResult(token, quizId + 1, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);
  });

  test('test 2.1.2 user does not own the quiz and trash quiz', () => {
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    const token2: string = authRegister('email2@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
    result = requestCSVResult(token2, quizId, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);

    const quizId2: number = quizCreate(token2, 'quiz2', 'coming soon...').quizId;
    result = requestCSVResult(token, quizId2, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);

    requestQuizRemove(token, quizId);
    result = requestCSVResult(token, quizId2, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);
  });

  test('test 2.3 invalid quizId', () => {
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    result = requestCSVResult(token, quizId, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);
  });

  test('test 2.2 invalid sessionId', () => {
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_ANSWER);
    quizSessionUpdate(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);

    result = requestCSVResult(token, quizId, sessionId + 1);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('test 2.3 invalid invalid session state', () => {
    result = requestCSVResult(token, quizId, sessionId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });
});
