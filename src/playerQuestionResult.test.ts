import { QuestionBody } from './quizQuestion';
import {
  requestClear, authRegister, quizCreate, questionCreate,
  quizSessionCreate, playerJoin, requestUserDetails, ResUserDetails,
  ResToken, ResQuizId, ResQuestionId, requestPlayerQuestionResults
} from './functionRequest';
import { setData, getData, States, BAD_REQUEST } from './dataStore';

beforeEach(requestClear);
afterAll(requestClear);

describe('getQuestionResults', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
  let sessionId: number;
  let playerId: number;
  let userId: number;

  beforeEach(() => {
    token = authRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar').token;
    quizId = quizCreate(token, 'My Quiz', 'Quiz on Testing').quizId;

    const questionBody: QuestionBody = {
      question: 'What is Javascript?',
      duration: 10,
      points: 10,
      answers: [
        { answer: 'Programming Language', correct: true },
        { answer: 'Coffee', correct: false },
        { answer: 'Bird', correct: false },
        { answer: 'None of the Above', correct: false }
      ],
      thumbnailUrl: 'http://google.com/img_path.jpg'
    };

    questionId = questionCreate(token, quizId, questionBody).questionId;
    userId = (requestUserDetails(token) as ResUserDetails).user.userId;
    sessionId = quizSessionCreate(token, quizId, 0).sessionId;
    playerId = playerJoin(sessionId, '').playerId;

    // Setting up the mock data directly
    setData({
      ...getData(),
      quizSessions: [{
        sessionId: sessionId,
        state: States.ANSWER_SHOW,
        atQuestion: 0,
        autoStartNum: 0,
        metadata: {
          quizId: quizId,
          name: 'My Quiz',
          timeCreated: Date.now(),
          timeLastEdited: Date.now(),
          description: 'Quiz on Testing',
          creatorId: userId,
          numQuestions: 1,
          duration: 10,
          thumbnailUrl: 'http://google.com/img_path.jpg',
          questions: [{
            questionId: questionId,
            question: 'What is Javascript?',
            duration: 10,
            points: 10,
            answers: [
              { answerId: 1, answer: 'Programming Language', colour: 'red', correct: true },
              { answerId: 2, answer: 'Coffee', colour: 'blue', correct: false },
              { answerId: 3, answer: 'Bird', colour: 'green', correct: false },
              { answerId: 4, answer: 'None of the Above', colour: 'yellow', correct: false }
            ],
            thumbnailUrl: 'http://google.com/img_path.jpg',
            playersCorrectList: ['Hayden'], // Example player name
            averageAnswerTime: 5,
            percentCorrect: 75,
          }]
        },
        messages: [],
        players: [{ playerId: playerId, name: 'PlayerName', points: 0, answerIds: [], timeTaken: 0, score: 0 }]
      }]
    });
  });

  test('Successfully retrieves question results', () => {
    const result = requestPlayerQuestionResults(playerId, 1);
    if ('error' in result) {
      throw new Error('Expected a successful result, but got an error');
    }
    expect(result).toStrictEqual({
      status: 200,
      questionId: questionId,
      playersCorrectList: ['Hayden'],
      averageAnswerTime: 5,
      percentCorrect: 75
    });
  });

  test('Error when playerId is invalid', () => {
    const result = requestPlayerQuestionResults(-1, 1);
    expect(result).toMatchObject({ error: expect.any(String) });
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when playerId is missing', () => {
    const result = requestPlayerQuestionResults(0, 1);
    expect(result).toMatchObject({ error: expect.any(String) });
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when questionId is invalid', () => {
    const result = requestPlayerQuestionResults(playerId, -1);
    expect(result).toMatchObject({ error: expect.any(String) });
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when questionId is invalid', () => {
    const result = requestPlayerQuestionResults(playerId, 2);
    expect(result).toMatchObject({ error: expect.any(String) });
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when session state is not ANSWER_SHOW', () => {
    setData({
      ...getData(),
      quizSessions: [{
        sessionId: sessionId,
        state: States.QUESTION_OPEN,
        atQuestion: 0,
        autoStartNum: 0,
        metadata: {
          quizId: quizId,
          name: 'My Quiz',
          timeCreated: Date.now(),
          timeLastEdited: Date.now(),
          description: 'Quiz on Testing',
          creatorId: userId,
          numQuestions: 1,
          duration: 10,
          thumbnailUrl: 'http://google.com/img_path.jpg',
          questions: [{
            questionId: questionId,
            question: 'What is Javascript?',
            duration: 10,
            points: 10,
            answers: [
              { answerId: 1, answer: 'Programming Language', colour: 'red', correct: true },
              { answerId: 2, answer: 'Coffee', colour: 'blue', correct: false },
              { answerId: 3, answer: 'Bird', colour: 'green', correct: false },
              { answerId: 4, answer: 'None of the Above', colour: 'yellow', correct: false }
            ],
            thumbnailUrl: 'http://google.com/img_path.jpg',
            playersCorrectList: ['Hayden'],
            averageAnswerTime: 5,
            percentCorrect: 75,
          }]
        },
        messages: [],
        players: [{ playerId: playerId, name: 'PlayerName', points: 0, answerIds: [], timeTaken: 0, score: 0 }]
      }]
    });

    const result = requestPlayerQuestionResults(playerId, 1);
    expect(result).toMatchObject({ error: expect.any(String) });
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });
});
