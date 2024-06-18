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
  adminQuizRemove,
} from './quiz.js';

describe('adminQuizRemove tests', () => {
  let userId1, userId2, quizId1, quizId2;

  beforeEach(() => {
  clear();
  userId1 = adminAuthRegister('krishpatel@gmail.com', 'KrishP', 'Krish', 'Patel');
  adminAuthLogin('krishpatel@gmail.com', 'KrishP');
  quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
  userId2 = adminAuthRegister('joshhoward@gmail.com', 'JoshH', 'Josh', 'Howard');
  adminAuthLogin('joshhoward@gmail.com', 'JoshH');
  quizId2 = adminQuizCreate(userId2.authUserId, 'Second Quiz', 'Another quiz for testing');
  });

  test('Quiz successfully gets removed', () => {
    const result = adminQuizRemove(userId1.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({});

    const quizzes = adminQuizList(userId1.authUserId);
    expect(quizzes).toStrictEqual([]);
  });

  test('Error shown when user ID is invalid', () => {
    const result = adminQuizRemove(999, quizId1.quizId);
    expect(result).toStrictEqual({ error: 'User ID is not valid' });
  });
  
  test('Error shown when quiz ID is invalid', () => {
    const result = adminQuizRemove(userId1.authUserId, 999);
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });
  
  test('Error shown when user does not own the quiz', () => {
    const result = adminQuizRemove(userId2.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({ error: 'User does not own the quiz' });
  });
  
  test('Error shown when removing a quiz after it has already been removed', () => {
    adminQuizRemove(userId1.authUserId, quizId1.quizId);
    const result = adminQuizRemove(userId1.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });
  
  test('Error shown when removing a quiz with an empty quiz ID', () => {
    const result = adminQuizRemove(userId1.authUserId, null);
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });
  
  test('Error shown when removing a quiz with an empty user ID', () => {
    const result = adminQuizRemove(null, quizId1.quizId);
    expect(result).toStrictEqual({ error: 'User ID is not valid' });
  });
  
  test('Error shown when quiz ID is a string instead of an integer', () => {
    const result = adminQuizRemove(userId1.authUserId, 'invalidQuizId');
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });
});