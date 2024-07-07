import { UNAUTHORIZED } from './dataStore';
import {
  requestAuthRegister, requestAuthLogin,
  requestUserDetails,
  requestQuizList, requestQuizCreate, requestQuizInfo,
  requestClear, ResToken, ResUserDetail,
  ResQuizList, ResQuizId, ResQuizInfo, ResError
} from './functionRequest';

let user: ResToken;
let quiz: ResQuizId;

beforeEach(() => {
  user = requestAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar') as ResToken;
  requestAuthLogin('devk@gmail.com', 'DevaanshK01');
  quiz = requestQuizCreate(user.token, 'My Quiz1', 'Quiz on Testing') as ResQuizId;
});

describe('clear test', () => {
  test('clears all the user details', () => {
    expect((requestUserDetails(user.token) as ResUserDetail).user).toStrictEqual({
      userId: expect.any(Number),
      name: 'Devaansh Kumar',
      email: 'devk@gmail.com',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 0
    });
    requestClear();
    expect(requestUserDetails(user.token) as ResError).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('clears all the quizzes', () => {
    expect((requestQuizList(user.token) as ResQuizList).quizzes).toStrictEqual([
      { quizId: quiz.quizId, name: 'My Quiz1' }
    ]);
    requestClear();
    expect(requestQuizList(user.token) as ResError).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('clears all the information in the quizzes', () => {
    expect(requestQuizInfo(user.token, quiz.quizId) as ResQuizInfo).toStrictEqual({
      quizId: quiz.quizId,
      name: 'My Quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz on Testing',
      numQuestions: 0,
      questions: [],
      duration: 0,
      status: 200
    });
    requestClear();
    expect(requestQuizInfo(user.token, quiz.quizId) as ResQuizInfo).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });
});
