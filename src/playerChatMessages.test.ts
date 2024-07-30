import { OK, BAD_REQUEST, ErrorObject } from './dataStore';
import { QuestionBody } from './quizQuestion';
import { MessageBody } from './playerChat';
import {
  authRegister, quizCreate, questionCreate, quizSessionCreate,
  playerJoin, requestClear, playerChatMessages, requestPlayerChatCreate,
  ResError, ResPlayerChatMessages
} from './functionRequest';

beforeAll(requestClear);
afterAll(requestClear);

let sessionId: number, playerId: number, message: MessageBody;
let result: ResPlayerChatMessages | ResError;
const ERROR: ErrorObject = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
  const token: string = authRegister('e@mail.com', 'Passw0rd', 'nameFirst', 'nameLast').token;
  const quizId: number = quizCreate(token, 'time to start a kahoot', 'test your skill').quizId;
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
  sessionId = quizSessionCreate(token, quizId, 10).sessionId;
  playerId = playerJoin(sessionId, '').playerId;
});

describe('testing playerChatMessages /v1/player/{playerid}/chat', () => {
  describe('test 1.0 valid tests', () => {
    test('retrieve messages after sending one message', () => {
      message = { message: { messageBody: 'Hello, world!' } };
      requestPlayerChatCreate(playerId, message);

      result = playerChatMessages(playerId);

      expect(result.status).toStrictEqual(OK);
      expect(result).toHaveProperty('messages');
      expect(result.messages.length).toStrictEqual(1);
      expect(result.messages[0]).toMatchObject({
        messageBody: 'Hello, world!',
        playerId,
        playerName: expect.any(String),
        timeSent: expect.any(Number)
      });

      const timeNow = Math.floor(Date.now() / 1000);
      expect(result.messages[0].timeSent).toBeGreaterThan(timeNow - 1);
      expect(result.messages[0].timeSent).toBeLessThan(timeNow + 1);
    });

    test('retrieve messages after sending multiple messages', () => {
      const messageList = ['First message', 'Second message', 'Third message'];
      messageList.forEach(msg => {
        message = { message: { messageBody: msg } };
        requestPlayerChatCreate(playerId, message);
      });

      result = playerChatMessages(playerId) as ResPlayerChatMessages;

      expect(result.status).toStrictEqual(OK);
      expect(result).toHaveProperty('messages');
      expect(result.messages.length).toStrictEqual(3);
      messageList.forEach((msg, index) => {
        expect((result as ResPlayerChatMessages).messages[index]).toMatchObject(
          {
            messageBody: msg,
            playerId,
            playerName: expect.any(String),
            timeSent: expect.any(Number)
          }
        );
        const timeNow = Math.floor(Date.now() / 1000);
        expect((result as ResPlayerChatMessages).messages[index].timeSent).toBeGreaterThan(timeNow - 1);
        expect((result as ResPlayerChatMessages).messages[index].timeSent).toBeLessThan(timeNow + 1);
      });
    });

    test('player with no messages', () => {
      result = playerChatMessages(playerId);
      expect(result.status).toStrictEqual(OK);
      expect(result).toHaveProperty('messages');
      expect(result.messages.length).toStrictEqual(0);
    });
  });

  describe('test 2.0 invalid tests', () => {
    test('invalid playerId', () => {
      result = playerChatMessages(playerId + 1);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('invalid playerId format', () => {
      result = playerChatMessages(-1);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });
});
