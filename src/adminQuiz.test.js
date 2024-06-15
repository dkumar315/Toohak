import {
  clear,
} from './other.js';

import {
  adminAuthRegister,
  adminAuthLogin,
} from './auth.js';

import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizNameUpdate
} from './quiz.js';

describe('Testing for adminQuizNameUpdate', () => {
  let userId1;
  let quizId1;
  let quizInfo1;
  let userId2;
  let quizId2;
  let quizInfo2;

  beforeEach(() => {
    clear();

    userId1 = adminAuthRegister('devk@gmail.com', 'DevK01', 'Devaansh', 'Kumar');
    adminAuthLogin('devk@gmail.com', 'DevK01');
    quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);

    userId2 = adminAuthRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel');
    adminAuthLogin('krishp@gmail.com', 'KrishP02');
    quizId2 = adminQuizCreate(userId2.authUserId, 'Your Quiz', 'Quiz on Implementation');
    quizInfo2 = adminQuizInfo(userId2.authUserId, quizId2.quizId);
  });

  test('Valid authUserId, quizId and name', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'Other quiz').toStrictEqual({}));
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.name).toStrictEqual('Other quiz'));
  });
  
  test('Invalid authUserId', () => {
    expect(adminQuizNameUpdate(3, quizInfo1.quizId, 'Other quiz').toStrictEqual({ error: expect.any(String) }));
  });
  
  test('QuizId does not refer to a valid quiz', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, 3, 'Other quiz').toStrictEqual({ error: expect.any(String) }));
  });

  test('QuizId does not refer to a quiz that this user owns', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo2.quizId, 'Other quiz').toStrictEqual({ error: expect.any(String) }));
  });

  test('Name with symbols and alphanumeric characters', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '!M@y# $Q%u^i&z*()').toStrictEqual({ error: expect.any(String) }));
  });

  test('Name with only symbols', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '!@#$%^&*()').toStrictEqual({ error: expect.any(String) }));
  });

  test('Empty name', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '').toStrictEqual({ error: expect.any(String) }));
  });

  test('Name less than 3 characters', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'No').toStrictEqual({ error: expect.any(String) }));
  });

  test('Name more than 30 characters', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'This name is longer than 30 characters').toStrictEqual({ error: expect.any(String) }));
  });

  test('Name already in use', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, quizInfo2.name).toStrictEqual({ error: expect.any(String) }));
  });
});