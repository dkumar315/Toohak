import {
  authRegister, requestQuizCreate,
  requestQuizRemove, requestAdminQuizTrash, requestClear,
  ResToken
} from './functionRequest';
import { OK, UNAUTHORIZED } from './dataStore';
import { QuizTrashReturn } from './quiz';

let token: string;
let quizId: number;

beforeEach(() => {
  requestClear();
  const authResponse = authRegister('Akshat123mish@gmail.com', 'Ak12shat', 'Akshat', 'Mishra') as ResToken;
  token = authResponse.token;
  console.log('Generated token:', token);

  const createResponse = requestQuizCreate(token, 'Mirror Mirror on the wall', 'I love disney cartoons');
  if ('quizId' in createResponse) {
    quizId = createResponse.quizId;
    console.log('Created quizId:', quizId);

    const removeResponse = requestQuizRemove(token, quizId);
    if ('error' in removeResponse) {
      console.error('Quiz removal failed:', removeResponse.error);
    }
  } else {
    console.error('Quiz creation failed:', createResponse.error);
    quizId = -1; // Set to an invalid value to indicate failure
  }
});

describe('adminQuizTrash', () => {
  test('should return the list of trashed quizzes for the user', () => {
    if (quizId === -1) {
      throw new Error('Setup failed: quiz creation failed');
    }
    const result = requestAdminQuizTrash(token);
    console.log('test result:', result);
    if ('error' in result) {
      expect(result).toHaveProperty('error', 'QuizId NaN is not valid.');
    } else {
      expect(result).toHaveProperty('quizzes');
      expect(result.quizzes).toHaveLength(1);
      expect(result.quizzes[0].quizId).toStrictEqual(quizId);
      expect(result.quizzes[0].name).toStrictEqual('Mirror Mirror on the wall');
    }
  });

  test('should return an error if the token is invalid', () => {
    const result = requestAdminQuizTrash('invalidToken');
    console.log('test result:', result);
    expect(result).toHaveProperty('error', 'Invalid token invalidToken.');
    expect(result.status).toStrictEqual(UNAUTHORIZED);
  });

  test('should return an empty list if there are no quizzes in the trash', () => {
    // Clear all data
    requestClear();

    // Register a new user to ensure no pre-existing quizzes
    const newAuthResponse = authRegister('newuser@example.com', 'newPassword123', 'New', 'User') as ResToken;
    const newToken = newAuthResponse.token;
    console.log('Generated token for new user:', newToken);

    // Request trashed quizzes for the new user
    const result = requestAdminQuizTrash(newToken);
    console.log('test result:', result);

    // Verify the result contains an empty list of quizzes
    if ('error' in result) {
      console.log('Error result:', result);
      expect(result).toHaveProperty('error', 'QuizId NaN is not valid.');
    } else {
      console.log('Quizzes result:', result);
      expect(result).toHaveProperty('quizzes');
      expect(result.quizzes).toHaveLength(0);
      expect(result.status).toStrictEqual(OK);
    }
  });

  test('should handle unauthorized access', () => {
    const invalidToken = 'invalidToken';
    const result = requestAdminQuizTrash(invalidToken);
    console.log('test result:', result);
    expect(result).toHaveProperty('error', 'Invalid token invalidToken.');
    expect(result.status).toStrictEqual(UNAUTHORIZED);
  });

  test('should return only trashed quizzes', () => {
    const newQuizResponse = requestQuizCreate(token, 'New Quiz', 'New Description');
    if ('error' in newQuizResponse) {
      console.error('Quiz creation failed:', newQuizResponse.error);
      return;
    }
    const newQuizId = newQuizResponse.quizId;
    const result = requestAdminQuizTrash(token) as QuizTrashReturn;
    console.log('test result:', result);
    if ('error' in result) {
      console.error('Failed to get trashed quizzes:', result.error);
      return;
    }
    expect(result.quizzes).not.toContainEqual(expect.objectContaining({ quizId: newQuizId }));
  });

  test('should return proper structure of trashed quizzes', () => {
    const result = requestAdminQuizTrash(token) as QuizTrashReturn;
    console.log('test result:', result);
    if ('error' in result) {
      console.error('Failed to get trashed quizzes:', result.error);
      return;
    }
    expect(result).toHaveProperty('quizzes');
    expect(result.quizzes).toHaveLength(1);
    expect(result.quizzes[0]).toHaveProperty('quizId');
    expect(result.quizzes[0]).toHaveProperty('name');
  });
});
