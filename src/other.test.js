import {
  clear,
} from './other.js';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails
} from './auth.js';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizInfo,
} from './quiz.js';

let user;
let quiz;

beforeEach(() => {
  user = adminAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
  adminAuthLogin('devk@gmail.com', 'DevaanshK01');
  quiz = adminQuizCreate(user.authUserId, 'My Quiz1', 'Quiz on Testing');
});

describe('clear test', () => {
  test('clears all the user details', () => {
    expect(adminUserDetails(user.authUserId).user).toStrictEqual({
      userId: user.authUserId,
      name: 'Devaansh Kumar',
      email: 'devk@gmail.com',
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 0
    });
    clear();
    expect(adminUserDetails(user.authUserId)).toStrictEqual({ error: expect.any(String) });
  });

  test('clears all the quizzes', () => {
    expect(adminQuizList(user.authUserId, quiz.quizId).quizzes).toStrictEqual([
      { quizId: quiz.quizId, name: 'My Quiz1' }
    ]);
    clear();
    expect(adminQuizList(user.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test('clears all the information in the quizzes', () => {
    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual({
      quizId: quiz.quizId,
      name: 'My Quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz on Testing',
    });
    clear();
    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});