import {
  adminAuthRegister,
  adminAuthLogin
} from './auth.js'

import {
  clear
} from './other.js'

import {
  adminQuizList,
  adminQuizCreate
} from './quiz.js'

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