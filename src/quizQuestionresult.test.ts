import { adminQuizQuestionResults, QuestionBody } from './quizQuestion';
import {
  requestClear, authRegister, quizCreate, requestQuizQuestionCreate,
  ResToken, ResQuizId, ResQuestionId
} from './functionRequest';
import { setData, getData, States } from './dataStore';

beforeEach(requestClear);
afterAll(requestClear);

describe('getQuestionResults', () => {
  let user: ResToken;
  let quiz: ResQuizId;
  let questionBody: QuestionBody;
  let question: ResQuestionId;
  let session: { sessionId: number };
  let playerId: number;
  let userId: number; // Manually assign userId

  beforeEach(() => {
    user = authRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    quiz = quizCreate(user.token, 'My Quiz', 'Quiz on Testing') as ResQuizId;

    questionBody = {
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

    question = requestQuizQuestionCreate(user.token, quiz.quizId, questionBody) as ResQuestionId;

    // Manually assign userId
    userId = 1; // Assign a mock userId

    // Mock session creation and player joining
    session = { sessionId: 123 }; // Mock session ID
    playerId = 456; // Mock player ID

    // Setting up the mock data directly
    setData({
      ...getData(),
      quizSessions: [{
        sessionId: session.sessionId,
        state: States.ANSWER_SHOW,
        atQuestion: 0,
        autoStartNum: 0,
        metadata: {
          quizId: quiz.quizId,
          name: 'My Quiz',
          timeCreated: Date.now(),
          timeLastEdited: Date.now(),
          description: 'Quiz on Testing',
          creatorId: userId, // Use the manually assigned userId
          numQuestions: 1,
          duration: 10,
          thumbnailUrl: 'http://google.com/img_path.jpg',
          questions: [{
            questionId: question.questionId,
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
        players: [{ playerId: playerId, name: 'PlayerName', points: 0, answerIds: [], timeTaken: 0 }]
      }]
    });
  });

  test('Successfully retrieves question results', () => {
    const result = adminQuizQuestionResults(playerId, session.sessionId, question.questionId);
    if ('error' in result) {
      throw new Error('Expected a successful result, but got an error');
    }
    expect(result).toStrictEqual({
      id: question.questionId,
      result: JSON.stringify({
        questionId: question.questionId,
        playersCorrectList: ['Hayden'],
        averageAnswerTime: 5,
        percentCorrect: 75,
      })
    });
  });

  test('Error when playerId is invalid', () => {
    const result = adminQuizQuestionResults(-1, session.sessionId, question.questionId);
    expect(result).toMatchObject({ error: 'Player not found' });
  });

  test('Error when playerId is missing', () => {
    const result = adminQuizQuestionResults(0, session.sessionId, question.questionId);
    expect(result).toMatchObject({ error: 'Player not found' });
  });

  test('Error when sessionId is invalid', () => {
    const result = adminQuizQuestionResults(playerId, -1, question.questionId);
    expect(result).toMatchObject({ error: 'Session not found' });
  });

  test('Error when questionId is invalid', () => {
    const result = adminQuizQuestionResults(playerId, session.sessionId, -1);
    expect(result).toMatchObject({ error: 'Question not found' });
  });

  test('Error when session state is not ANSWER_SHOW', () => {
    setData({
      ...getData(),
      quizSessions: [{
        sessionId: session.sessionId,
        state: States.QUESTION_OPEN,
        atQuestion: 0,
        autoStartNum: 0,
        metadata: {
          quizId: quiz.quizId,
          name: 'My Quiz',
          timeCreated: Date.now(),
          timeLastEdited: Date.now(),
          description: 'Quiz on Testing',
          creatorId: userId,
          numQuestions: 1,
          duration: 10,
          thumbnailUrl: 'http://google.com/img_path.jpg',
          questions: [{
            questionId: question.questionId,
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
        players: [{ playerId: playerId, name: 'PlayerName', points: 0, answerIds: [], timeTaken: 0 }]
      }]
    });

    const result = adminQuizQuestionResults(playerId, session.sessionId, question.questionId);
    expect(result).toMatchObject({ error: 'Results are not available yet' });
  });
});
