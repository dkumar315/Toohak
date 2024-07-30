import { OK, BAD_REQUEST } from './dataStore';
import { QuestionBody } from './quizQuestion';
import { MessageBody, MessageLimits } from './playerChat';
import {
  authRegister, quizCreate, questionCreate, quizSessionCreate,
  playerJoin, requestClear, requestPlayerChatCreate,
  ERROR, ResError, ResEmpty, VALID_EMPTY_RETURN
} from './functionRequest';

beforeAll(requestClear);
afterAll(requestClear);

let playerId: number, message: MessageBody;
let result: ResEmpty | ResError;

beforeEach(() => {
  requestClear();
  const token: string = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
  const quizId: number = quizCreate(token, 'time to start a kahoot', 'test you skill').quizId;
  const questionBody: QuestionBody = {
    question: `question of quiz ${quizId}`,
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
      }],
    thumbnailUrl: 'http://imgName.png'
  };
  questionCreate(token, quizId, questionBody);
  const sessionId: number = quizSessionCreate(token, quizId, 10).sessionId;
  playerId = playerJoin(sessionId, '').playerId;
});

describe('testing playerChatCreate /v1/player/{playerid}/chat', () => {
  describe('test 1.0 valid test', () => {
    test('valid Input', () => {
      message = { message: { messageBody: 'min 1, max 100 chars in len' } };
      result = requestPlayerChatCreate(playerId, message);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    test('Edge Case of message: minimum Len', () => {
      const messageBody: string = 'm';
      message = { message: { messageBody } };
      result = requestPlayerChatCreate(playerId, message);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    test('Edge Case of message: maximum len', () => {
      const messageBody: string = 'm'.repeat(MessageLimits.MAX_MSGBODY_LEN);
      message = { message: { messageBody } };
      result = requestPlayerChatCreate(playerId, message);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test 2.0 invalid test', () => {
    test('invalid playerId', () => {
      message = { message: { messageBody: 'min 1, max 100 chars in len' } };
      result = requestPlayerChatCreate(playerId + 1, message);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);

      result = requestPlayerChatCreate(playerId - 1, message);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Edge Case of message: minimum Len', () => {
      const messageBody: string = '';
      message = { message: { messageBody } };
      result = requestPlayerChatCreate(playerId, message);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Edge Case of message: maximum len', () => {
      const messageBody: string = 'm'.repeat(MessageLimits.MAX_MSGBODY_LEN + 1);
      message = { message: { messageBody } };
      result = requestPlayerChatCreate(playerId, message);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });
});
