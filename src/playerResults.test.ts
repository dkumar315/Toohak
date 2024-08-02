import { OK, BAD_REQUEST, ErrorObject } from './dataStore';
import { QuestionBody } from './quizQuestion';
import {
  authRegister, quizCreate, questionCreate, quizSessionCreate,
  quizSessionUpdate, playerJoin, requestPlayerResults,
  requestClear, ResError, ResQuizSessionResult,
} from './functionRequest';
import { playerQuestionAnswer } from './playerQuestion';

const ERROR: ErrorObject = { error: expect.any(String) };

beforeAll(requestClear);

let token: string, quizId: number,
  sessionId: number, playerId: number,
  result: ResQuizSessionResult | ResError;

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
  playerId = playerJoin(sessionId, 'Player1').playerId;
});

afterAll(requestClear);

describe('Testing playerResults /v1/player/{playerid}/results', () => {
  const VALID_RESPONSE = {
    usersRankedByScore: expect.any(Array),
    questionResults: expect.any(Array),
  };

  test('Valid request returns users ranked by score and question results', () => {
    const playerId2 = playerJoin(sessionId, 'Player2').playerId;
    quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    quizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    playerQuestionAnswer(playerId2, 1, [1]);
    quizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    quizSessionUpdate(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS');
    result = requestPlayerResults(playerId);
    expect(result).toMatchObject(VALID_RESPONSE);
    expect(result.status).toStrictEqual(OK);
  });

  test('Non-existent playerId', () => {
    result = requestPlayerResults(playerId + 1);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Invalid playerId format', () => {
    result = requestPlayerResults(-1);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Session state is not FINAL_RESULTS', () => {
    quizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    result = requestPlayerResults(playerId);
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });
});
