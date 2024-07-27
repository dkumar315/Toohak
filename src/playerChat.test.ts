import { OK, BAD_REQUEST } from './dataStore';
import { QuestionBody } from './quizQuestion';
import { MessageBody, MessageLimits } from './playerChat';
import {
  authRegister, quizCreate, questionCreate, quizSessionCreate,
  playerJoin, requestClear, requestPlayerChatCreate,
  ERROR, ResError, ResPlayerId, ResEmpty
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
  const sessionId: number = quizSessionCreate(token, quizId, 10).sessionId;
  playerId = playerJoin(sessionId, '').playerId;
  message = {
    message: {
      messageBody: 'minimum 1 len and maximum 100 len'
    }
  };
});

describe('test 1.0 valid test', () => {
  test('valid Input', () => {
    requestPlayerChatCreate(playerId, message);
  });
});
