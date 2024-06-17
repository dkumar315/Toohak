import test, { beforeEach } from 'node:test'

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
import { hasUncaughtExceptionCaptureCallback } from 'node:process';

beforeEach(() => {
  clear();
});

test('adminQuizList returns error when authUserId is not valid', () => {
  const result = adminQuizList(789);
  expect(result).toEqual({error: 'AuthUserId is not valid'});
});

test('adminQuizList returns an empty list for a user with no quizzes', () => {
  const user = adminAuthRegister('akshat.mishra@gmail.com', 'aks123  ', 'Akshat' , 'Mishra');
  const authUserId = user.authUserId;
  expect(result.quizzes).toEqual([]);
});

test('adminQuizList returns a list of quizzes for the logged-in user', () => {
  const user = adminAuthRegister('tonystark@gmail.com', 'assemble', 'Tony', 'Stark');
  const authUserId = user.authUserId;
  const quiz1 = adminQuizCreate(authUserId, 'Quiz 1', 'Description 1');
  const quiz2 = adminQuizCreate(authUserId, 'Quiz 2', 'Description 2');

  const result = adminQuizList(authUserId);
  expect(result.quizzes).toEqual([
      { quizId: quiz1.quizId, name: 'Quiz 1' },
      { quizId: quiz2.quizId, name: 'Quiz 2' }
  ]);
});

test('adminQuizList returns the correct quizzes for the logged-in user', () => {
  const user1 = adminAuthRegister('haydensmith@gmail.com', 'hydsmth', 'Hayden', 'Smith');
  const user2 = adminAuthRegister('jakerenzella@gmail.com', 'jkrnzla', 'Jake', 'Renzella');
  const authUserId1 = user1.authUserId;
  const authUserId2 = user2.authUserId;

  const quiz1 = adminQuizCreate(authUserId1, 'Quiz 1', 'Description 1');
  const quiz2 = adminQuizCreate(authUserId2, 'Quiz 2', 'Description 2');

  const result1 = adminQuizList(authUserId1);
  expect(result1.quizzes).toEqual([{ quizId: quiz1.quizId, name: 'Quiz 1' }]);

  const result2 = adminQuizList(authUserId2);
  expect(result2.quizzes).toEqual([{ quizId: quiz2.quizId, name: 'Quiz 2' }]);
});