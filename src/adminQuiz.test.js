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
    expect(result).toEqual({ error: 'AuthUserId is not valid' });
  });
  
  test('adminQuizList returns an empty list for a user with no quizzes', () => {
    adminAuthRegister('akshatmishra@gmail.com', 'aks123456', 'Akshat', 'Mishra');
    const user = adminAuthLogin('akshatmishra@gmail.com', 'aks123456');
    const authUserId = user.authUserId;
    const result = adminQuizList(authUserId); // Add this line to define result
    console.log(user);
    expect(result).toEqual({"quizzes": []});
  });
  
  test('adminQuizList returns a list of quizzes for the logged-in user', () => {
    const user = adminAuthRegister('tonystark@gmail.com', 'assemble', 'Tony', 'Stark');
    const authUserId = user.authUserId;
    const quiz1 = adminQuizCreate(authUserId, 'Quiz 1', 'Description 1');
    const quiz2 = adminQuizCreate(authUserId, 'Quiz 2', 'Description 2');
    
    const result = adminQuizList(authUserId);
    expect(result.quizzes).toEqual([
      { quizId: quiz1.id, name: quiz1.name },
      { quizId: quiz2.id, name: quiz2.name }
    ]);
  });
