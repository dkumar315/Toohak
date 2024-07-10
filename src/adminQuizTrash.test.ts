import { 
  authRegister,requestAuthLogin,requestQuizList,requestQuizCreate, 
   requestQuizInfo,requestQuizRemove,requestAdminQuizTrash,adminQuizTrash,requestQuizNameUpdate, 
  requestQuizDescriptionUpdate,requestClear, 
  ResError,ResEmpty,ResToken,ResQuizList,ResQuizInfo 
} from './functionRequest';
import { 
  OK, 
  BAD_REQUEST, 
  UNAUTHORIZED, 
  FORBIDDEN
} from './dataStore';
import { QuizTrashReturn } from './quiz';
let token: string;
let quizId: number;


beforeEach(() => {
  requestClear();
  const authResponse = authRegister('Akshat123mish@gmail.com', 'Ak12shat', 'Akshat', 'Mishra');
  token = authResponse.token;

  const createResponse = requestQuizCreate(token, 'Mirror Mirror on the wall', 'I love disney cartoons');//use quizcreate 
  if ('quizId' in createResponse) {
    //quizId = createResponse.quizId;
    //requestQuizRemove(token, quizId);
    }
    else {
      console.error('Quiz creation failed:', createResponse.error);
      // Set to an invalid value to indicate failure
      quizId = -1;
    }
});

describe('adminQuizTrash', () => {
  test.only('should return the list of trashed quizzes for the user', () => {
    if (quizId === -1) {
      return fail('Setup failed: quiz creation failed');
      }
      const result = requestAdminQuizTrash(token) as QuizTrashReturn;
      expect(result).toHaveProperty('quizzes');
      expect(result.quizzes).toHaveLength(1);
      expect(result.quizzes[0].quizId).toBe(quizId);
    });

    test('should return an error if the token is invalid', () => {
      const result = adminQuizTrash('invalidToken');
      expect(result).toHaveProperty('error', UNAUTHORIZED);
    });

    test('should return an empty list if there are no quizzes in the trash', () => {
      requestClear();
      const result = adminQuizTrash(token);
      expect(result).toHaveProperty('quizzes');
      expect(result.quizzes).toHaveLength(0);
    });

    test('should handle unauthorized access', () => {
      const invalidToken = 'invalidToken';
      const result = adminQuizTrash(invalidToken);
      expect(result).toEqual({ error: UNAUTHORIZED });
    });

    test('should return only trashed quizzes', () => {
      const newQuizResponse = requestQuizCreate(token, 'New Quiz', 'New Description');
      if ('quizId' in newQuizResponse) {
        const newQuizId = newQuizResponse.quizId;
        const result = adminQuizTrash(token);
        expect(result.quizzes).not.toContainEqual(expect.objectContaining({ quizId: newQuizId }));
        } else {
        console.error('Quiz creation failed:', newQuizResponse.error);
        }
    });

    test('should return proper structure of trashed quizzes', () => {
      const result = adminQuizTrash(token);
        if (result.quizzes.length > 0) {
          expect(result.quizzes[0]).toHaveProperty('quizId');
          expect(result.quizzes[0]).toHaveProperty('title');
          expect(result.quizzes[0]).toHaveProperty('description');
        }
    });
});