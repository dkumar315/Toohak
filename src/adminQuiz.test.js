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
  adminQuizDescriptionUpdate
} from './quiz.js';

describe('adminQuizDescriptionUpdate test', () => {
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
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo1.quizId, 'Quiz on Coding').toStrictEqual({}));
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.description).toStrictEqual('Quiz on Coding'));
  });
  
  test('Invalid authUserId', () => {
    expect(adminQuizDescriptionUpdate(3, quizInfo1.quizId, 'Quiz on Coding').toStrictEqual({ error: expect.any(String) }));
  });
  
  test('QuizId does not refer to a valid quiz', () => {
    expect(adminQuizDescriptionUpdate(userId1.authUserId, 3, 'Quiz on Coding').toStrictEqual({ error: expect.any(String) }));
  });

  test('QuizId does not refer to a quiz that this user owns', () => {
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo2.quizId, 'Quiz on Coding').toStrictEqual({ error: expect.any(String) }));
  });

  test('Empty description', () => {
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo1.quizId, '').toStrictEqual({ error: expect.any(String) }));
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.description).toStrictEqual(''));
  });

  test('Description more than 100 characters', () => {
    let description = 'This description is very long and it crosses the hundred character limit set for the quiz description';
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo1.quizId, description).toStrictEqual({ error: expect.any(String) }));
  });
});