import {
  clear,
} from './other.js';
  
import {
  adminAuthRegister,
  adminAuthLogin,
} from './auth.js';
  
import {
  adminQuizCreate,
  adminQuizInfo,
} from './quiz.js';
  
describe('adminQuizInfo tests', () => {
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

  test('Successfully retrieves quiz information', () => {
    const result = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({
      quizId: quizId1.quizId,
      name: quizId1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quizId1.description,
    });
  });

  test('Error shown when user ID is invalid', () => {
    const result = adminQuizInfo(999, quizId1.quizId);
    expect(result).toStrictEqual({ error: 'User ID is not valid' });
  });

  test('Error shown when quiz ID is invalid', () => {
    const result = adminQuizInfo(userId1.authUserId, 999);
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('Error shown when user does not own the quiz', () => {
    const result = adminQuizInfo(userId2.authUserId, quizId2.quizId);
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });

  test('Error shown when user ID is a string instead of an integer', () => {
    const result = adminQuizInfo('invalidUserId', quizId1.quizId);
    expect(result).toStrictEqual({ error: 'User ID is not valid' });
  });

  test('Error shown when quiz ID is a string instead of an integer', () => {
    const result = adminQuizInfo(userId1.authUserId, 'invalidQuizId');
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('Error shown when quiz ID is null', () => {
    const result = adminQuizInfo(userId1.authUserId, null);
    expect(result).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('Error shown when user ID is null', () => {
    const result = adminQuizInfo(null, quizId1.quizId);
    expect(result).toStrictEqual({ error: 'User ID is not valid' });
  });
});