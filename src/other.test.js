import {
  clear,
} from './other.js';

import {
  adminAuthRegister,
  adminAuthLogin,
} from './auth.js';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizInfo,
} from './quiz.js';

let userId;
let quizId;

beforeEach(() => {
  userId = adminAuthRegister('devk@gmail.com', 'DevK01', 'Devaansh', 'Kumar');
  adminAuthLogin('devk@gmail.com', 'DevK01');
  quizId = adminQuizCreate(userId.authUserId, 'My Quiz', 'Quiz on Testing');
});

describe('clear test', () => {
  test('clears all the user details', () => {
    clear();
    expect(adminUserDetails(userId.authUserId).toStrictEqual({}));
  });

  test('clears all the quizzes', () => {
    clear();
    expect(adminQuizList(userId.authUserId, quizId.quizId).toStrictEqual({}));
  });

  test('clears all the information in the quizzes', () => {
    clear();
    expect(adminQuizInfo(userId.authUserId, quizId.quizId).toStrictEqual({}));
  });
});