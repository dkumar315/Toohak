import {
  adminAuthRegister,
  adminAuthLogin
} from './auth.js';

import {
  clear
} from './other.js';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizRemove,
} from './quiz.js';

beforeEach(() => {
  clear();
});

describe('adminQuizList', () => {
  test('adminQuizList returns error when authUserId is not valid', () => {
    const result = adminQuizList(789);
    expect(result).toStrictEqual({ error: 'AuthUserId is not valid' });
  });
  
  test('adminQuizList returns an empty list for a user with no quizzes', () => {
    adminAuthRegister('akshatmishra@gmail.com', 'aks123456', 'Akshat', 'Mishra');
    const user = adminAuthLogin('akshatmishra@gmail.com', 'aks123456');
    const authUserId = user.authUserId;
    const result = adminQuizList(authUserId);
    expect(result).toStrictEqual({"quizzes": []});
  });
  
  test('adminQuizList returns a list of quizzes for the logged-in user', () => {
    const user = adminAuthRegister('tonystark@gmail.com', 'assem1234ble', 'Tony', 'Stark');
    const authUserId = user.authUserId;
    const quiz1Name = 'Quiz 1';
    const quiz2Name = 'Quiz 2';
    const quiz1 = adminQuizCreate(authUserId, quiz1Name, 'Description 1');
    const quiz2 = adminQuizCreate(authUserId, quiz2Name, 'Description 2');
    const result = adminQuizList(authUserId);
    expect(result.quizzes).toStrictEqual([
      { quizId: quiz1.quizId, name: quiz1Name },
      { quizId: quiz2.quizId, name: quiz2Name }
    ]);
  });
});

describe('adminQuizCreate', () => {
  test('Creating a quiz with valid inputs', () => {
    const user = adminAuthRegister('akshatmish@yahoo.com', 'akst123456', 'Akshat', 'Mishra');
    adminAuthLogin('akshatmish@yahoo.com', 'akst123456');

    const result = adminQuizCreate(user.authUserId, 'Test Quiz', 'First test quiz.');
    expect(result).toEqual(expect.objectContaining({ quizId: expect.any(Number) }));

    const quizzes = adminQuizList(user.authUserId); 
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
        quizId: expect.any(Number),
        name: 'Test Quiz'
        }
      ]
    });
  });

  test('Creating a quiz with invalid authUserId', () => {
    const result = adminQuizCreate(999, 'Test Quiz', 'This is a test quiz.');
    expect(result).toStrictEqual({ error: 'AuthUserId is not a valid user.' });
  });

  test('Creating a quiz with invalid name', () => {
    const user = adminAuthRegister('DaveShalom@gmail.com', 'good23food', 'devaansh', 'shalom');
    const result = adminQuizCreate(user.authUserId, 'T$', 'Second test quiz.');
    expect(result).toStrictEqual({ error: 'Name contains invalid characters or is not the correct length.' });
  });

  test('Creating a quiz with a name that is too short', () => {
    const user = adminAuthRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel');
    const result = adminQuizCreate(user.authUserId, 'Te', 'Third test quiz.');
    expect(result).toStrictEqual({ error: 'Name contains invalid characters or is not the correct length.' });
  });

  test('Creating a quiz with a description that is too long', () => {
    const user = adminAuthRegister('prishalom@gmail.com', 'primi456s', 'priyasnhu', 'mish');
    const longDescription = 'a'.repeat(101);
    const result = adminQuizCreate(user.authUserId, 'Test Quiz', longDescription);
    expect(result).toStrictEqual({ error: 'Description is more than 100 characters in length.' });
  });
});

describe('adminQuizRemove tests', () => {
  let userId1, userId2, quizId1, quizId2;

  beforeEach(() => {
  clear();
  userId1 = adminAuthRegister('krishpatel@gmail.com', 'KrishP01', 'Krish', 'Patel');
  adminAuthLogin('krishpatel@gmail.com', 'KrishP');
  quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
  userId2 = adminAuthRegister('joshhoward@gmail.com', 'JoshH020', 'Josh', 'Howard');
  adminAuthLogin('joshhoward@gmail.com', 'JoshH');
  quizId2 = adminQuizCreate(userId2.authUserId, 'Second Quiz', 'Another quiz for testing');
  });

  test('Quiz successfully gets removed', () => {
    const result = adminQuizRemove(userId1.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({});

    const quizzes = adminQuizList(userId1.authUserId);
    expect(quizzes).toStrictEqual({'quizzes': []});
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
    const result = adminQuizRemove(userId1.authUserId, quizId2.quizId);
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