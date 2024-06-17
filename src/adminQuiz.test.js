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
