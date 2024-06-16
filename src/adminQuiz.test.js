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
    adminQuizInfo,
    adminQuizRemove,
  } from './quiz.js';
  
  describe('adminQuizInfo tests', () => {
    let userId1, userId2, quizId1, quizId2;
  
    beforeEach(() => {
    clear();
    userId1 = adminAuthRegister('krishpatel@gmail.com', 'KrishP', 'Krish', 'Patel');
    userId2 = adminAuthRegister('joshhoward@gmail.com', 'JoshH', 'Josh', 'Howard');
    adminAuthLogin('krishpatel@gmail.com', 'KrishP');
    quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
    quizId2 = adminQuizCreate(userId1.authUserId, 'Second Quiz', 'Another quiz for testing');
    });
  
    test('Successfully retrieves quiz information', () => {
      const result = adminQuizInfo(userId1.authUserId, quizId1.quizId);
      expect(result).toEqual({
        quizId: quizId1.quizId,
        name: 'My Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz on Testing',
      });
    });
  
    test('Error shown when user ID is invalid', () => {
      const result = adminQuizInfo(999, quizId1.quizId);
      expect(result).toEqual({ error: 'User ID is not valid' });
    });
  
    test('Error shown when quiz ID is invalid', () => {
      const result = adminQuizInfo(userId1.authUserId, 999);
      expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });
  
    test('Error shown when user does not own the quiz', () => {
      const result = adminQuizInfo(userId2.authUserId, quizId1.quizId);
      expect(result).toEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
    });
  
    test('Error shown when quiz ID is a string instead of an integer', () => {
      const result = adminQuizInfo(userId1.authUserId, 'invalidQuizId');
      expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });
  
    test('Error shown when user ID is a string instead of an integer', () => {
      const result = adminQuizInfo('invalidUserId', quizId1.quizId);
      expect(result).toEqual({ error: 'User ID is not valid' });
    });
  
    test('Error shown when quiz ID is null', () => {
      const result = adminQuizInfo(userId1.authUserId, null);
      expect(result).toEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    });
  
    test('Error shown when user ID is null', () => {
      const result = adminQuizInfo(null, quizId1.quizId);
      expect(result).toEqual({ error: 'User ID is not valid' });
    });
  });