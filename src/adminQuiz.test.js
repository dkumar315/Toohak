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
  test('Creating a quiz with valid inputs', () => {
      const user = adminAuthRegister('akshatmish@yahoo.com', 'akst123', 'Akshat', 'Mishra');
      const result = adminQuizCreate(user.authUserId, 'Test Quiz', 'First test quiz.');
      const data = getData();
      
      expect(result).toHaveProperty('quizId');
      expect(data.quizzes.length).toBe(1);
      expect(data.quizzes[0].name).toBe('Test Quiz');
  });
  
  test('Creating a quiz with invalid authUserId', () => {
      const result = adminQuizCreate(999, 'Test Quiz', 'This is a test quiz.');
      expect(result).toHaveProperty('error');
  });
  
  test('Creating a quiz with invalid name', () => {
      const user = adminAuthRegister('DaveShalom@gmail.com', 'goodfood', 'devaansh', 'shalom');
      const result = adminQuizCreate(user.authUserId, 'T$', 'Second test quiz.');
      expect(result).toHaveProperty('error');
  });
  
  test('Creating a quiz with a name that is too short', () => {
      const user = adminAuthRegister('krishshalom@gmail.com', 'kptel7', 'chris', 'patel');
      const result = adminQuizCreate(user.authUserId, 'Te', 'Third test quiz.');
      expect(result).toHaveProperty('error');
  });
  
  test('Creating a quiz with a description that is too long', () => {
      const user = adminAuthRegister('prishalom@gmail.com', 'primis', 'priyasnhu', 'mish');
      const longDescription = 'a'.repeat(101);
      const result = adminQuizCreate(user.authUserId, 'Test Quiz', longDescription);
      expect(result).toHaveProperty('error');
  });