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
