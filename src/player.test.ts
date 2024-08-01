import { OK, BAD_REQUEST, Actions, States, ErrorObject } from './dataStore';
import { QuestionBody } from './quizQuestion';
import { PlayerId } from './player';
import {
  authRegister, quizCreate, requestQuizRemove, requestQuizEmptyTrash,
  questionCreate, quizSessionCreate, requestPlayerJoin, requestClear,
  quizSessionUpdate, ResQuizSessionStatus, quizSessionStatus, playerJoin,
  ResError, ResPlayerId, playerStatus, ResPlayerStatus
} from './functionRequest';

beforeAll(requestClear);

let token: string, quizId: number, sessionId: number;
let result: ResPlayerId | ResError;
const validPlayerAdd: PlayerId = { playerId: expect.any(Number) };
const ERROR: ErrorObject = { error: expect.any(String) };

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
      }],
    thumbnailUrl: 'http://google.com/img_path.jpg'
  };
  questionCreate(token, quizId, questionBody);
  sessionId = quizSessionCreate(token, quizId, 0).sessionId;
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
      result = requestPlayerJoin(sessionId - 1, 'name');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);

      result = requestPlayerJoin(sessionId + 1, 'name');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test 2.2 session not in LOBBY state', () => {
      quizSessionUpdate(token, quizId, sessionId, Actions.NEXT_QUESTION);
      result = requestPlayerJoin(sessionId, 'name');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
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
    test('test 3.1 sessionInfo & playerinfo: initial & autostart', () => {
      const autoStartNum: number = 2;
      sessionId = quizSessionCreate(token, quizId, autoStartNum).sessionId;

      // initial session info
      let sessionInfo: ResQuizSessionStatus = quizSessionStatus(token, quizId, sessionId);
      expect(sessionInfo.state).toStrictEqual(States.LOBBY);

      // initial player info
      result = playerJoin(sessionId, `name${0}`);
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);
      let playerInfo: ResPlayerStatus = playerStatus(result.playerId);
      expect(playerInfo.state).toStrictEqual(States.LOBBY);
      expect(playerInfo.atQuestion).toStrictEqual(0);

      // add player until reach autoStartNum
      for (let i = 1; i < autoStartNum; i++) {
        result = playerJoin(sessionId, `name${i}`);
        expect(result).toMatchObject(validPlayerAdd);
        expect(result.status).toStrictEqual(OK);
      }

      // question start, session info
      quizSessionStatus(token, quizId, sessionId);
      sessionInfo = quizSessionStatus(token, quizId, sessionId);
      expect(sessionInfo.state).toStrictEqual(States.QUESTION_COUNTDOWN);
      expect(sessionInfo.atQuestion).toStrictEqual(1);

      // question start, player info
      playerInfo = playerStatus(result.playerId);
      expect(playerInfo.state).toStrictEqual(States.QUESTION_COUNTDOWN);
      expect(playerInfo.atQuestion).toStrictEqual(1);

      // not allow player join once session start
      result = requestPlayerJoin(sessionId, 'playerName') as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test 3.2 sessionInfo: initial, no autoStart', () => {
      // initial session info
      let sessionInfo: ResQuizSessionStatus = quizSessionStatus(token, quizId, sessionId);
      expect(sessionInfo.state).toStrictEqual(States.LOBBY);

      // initial player info
      result = playerJoin(sessionId, `name${0}`);
      expect(result).toMatchObject(validPlayerAdd);
      expect(result.status).toStrictEqual(OK);

      let playerInfo: ResPlayerStatus = playerStatus(result.playerId);
      expect(playerInfo.state).toStrictEqual(States.LOBBY);
      expect(playerInfo.atQuestion).toStrictEqual(0);

      quizSessionUpdate(token, quizId, sessionId, Actions.NEXT_QUESTION);

      // question start, session info
      sessionInfo = quizSessionStatus(token, quizId, sessionId);
      expect(sessionInfo.state).toStrictEqual(States.QUESTION_COUNTDOWN);
      expect(sessionInfo.atQuestion).toStrictEqual(1);

      // question start, player info
      playerInfo = playerStatus(result.playerId);
      expect(playerInfo.state).toStrictEqual(States.QUESTION_COUNTDOWN);
      expect(playerInfo.atQuestion).toStrictEqual(1);

      // not allow player join once session start
      result = requestPlayerJoin(sessionId, 'playerName') as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });
});
