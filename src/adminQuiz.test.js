import {
  adminAuthRegister,
  adminAuthLogin
} from './auth.js';

import {
  clear
} from './other.js';

import {
  adminQuizCreate,
  adminQuizList
} from './quiz.js'

beforeEach(() => {
    clear();
});

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
