import { EmptyObject, OK, UNAUTHORIZED } from './dataStore';
import {
  requestClear, authRegister, quizCreate,
  requestQuizViewTrash, requestQuizRemove,
  ResToken, ResError, ResQuizId, ResQuizList,
  ERROR,
  requestQuizRestore,
  validQuizInfo
} from './functionRequest';

let token: string;
let otherToken: string;
let quizId: number;
let otherQuizId: number;

beforeEach(() => {
  requestClear();

  const tokenResponse = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast');
  token = tokenResponse.token;

  const otherTokenResponse = authRegister('otheremail@gmail.com', 'otherpassw0rd', 'otherFirst', 'otherLast');
  otherToken = otherTokenResponse.token;

  const quizCreateResponse = quizCreate(token, 'Test Quiz', 'This is a test quiz.') as ResQuizId;
  quizId = quizCreateResponse.quizId;

  const otherQuizCreateResponse = quizCreate(otherToken, 'Other Test Quiz', 'This is another test quiz.') as ResQuizId;
  otherQuizId = otherQuizCreateResponse.quizId;

  requestQuizRemove(token, quizId);
  requestQuizRemove(otherToken, otherQuizId);
});

afterAll(() => requestClear());

describe('adminQuizViewTrash', () => {
  test('should return the list of trashed quizzes for the user', () => {
    const example = {
        quizzes: [
          {
            quizId: quizId,
            name: 'Test Quiz',
          },
        ]
    };
    
    const result = requestQuizViewTrash(token) as ResQuizList;
    expect(result).toStrictEqual(example);
    expect(result.status).toStrictEqual(OK);
    // expect(result.quizzes.length).toStrictEqual(1);

    expect(result.quizzes[0].quizId).toStrictEqual(quizId);
    expect(result.quizzes[0].name).toStrictEqual('Test Quiz');
    expect(result.status).toStrictEqual(OK);
  });

  test('should return an error if the token is invalid', () => {
    const result = requestQuizViewTrash('invalidToken') as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(UNAUTHORIZED);
  });

  test('should return an empty list if there are no quizzes in the trash', () => {
    // Clear all data
    requestClear();
    const example: any = {
        quizzes: []
    };
    // Register a new user to ensure no pre-existing quizzes
    const newTokenResponse = authRegister('newuser@example.com', 'newPassword123', 'New', 'User') as ResToken;
    const newToken = newTokenResponse.token;

    // Request trashed quizzes for the new user
    const result = requestQuizViewTrash(newToken) as ResQuizList;
    expect(result).toStrictEqual(example);
    expect(result.status).toStrictEqual(OK);
  });

  test('should return multiple trashed quizzes if the user has more than one', () => {
   
    const anotherQuizCreateResponse = quizCreate(token, 'Another Test Quiz', 'This is another test quiz.') as ResQuizId;
    const anotherQuizId = anotherQuizCreateResponse.quizId;
    requestQuizRemove(token, anotherQuizId);

    const example = {
        quizzes: [
          {
            quizId: quizId,
            name: 'Test Quiz',
          },
          {
            quizId: anotherQuizId,
            name: 'Another Test Quiz',
          }
        ]
    };
    
    const result = requestQuizViewTrash(token) as ResQuizList;
    expect(result).toStrictEqual(example);
    expect(result.status).toStrictEqual(OK);
  });

  test('should return only the quizzes owned by the user even if there are other trashed quizzes', () => {
    const result = requestQuizViewTrash(token) as ResQuizList;
    const example = {
        quizzes: [
          {
            quizId: quizId,
            name: 'Test Quiz',
          },
        ]
    };
    expect(result).toStrictEqual(example);
    expect(result.status).toStrictEqual(OK);
    const example2 = {
        quizzes: [
          {
            quizId: quizId,
            name: 'Other Test Quiz',
          },
        ]
    };
    const otherResult = requestQuizViewTrash(otherToken) as ResQuizList;
    expect(otherResult).toStrictEqual(example2);
    expect(otherResult.status).toStrictEqual(OK);
  });

  test('should return only trashed quizzes after a quiz is restored', () => {
    // Restore a quiz from the trash
    requestQuizRestore(token, quizId);
    const example: any = {
        quizzes: [ ]
    };
    const result = requestQuizViewTrash(token) as ResQuizList;
    expect(result).toStrictEqual(example);
    expect(result.status).toStrictEqual(OK);
  });

  test('should handle a large number of trashed quizzes', () => {
    const example = {
        quizzes: [
          {
            quizId: quizId,
            name: 'Test Quiz',
          },
        ]
    };
    for (let i = 0; i < 100; i++) {
      const quizCreateResponse = quizCreate(token, `Quiz ${i}`, `Description ${i}`) as ResQuizId;
      let quizInfoResponse = validQuizInfo(token, quizCreateResponse.quizId);
      example.quizzes.push({quizId: quizInfoResponse.quizId, name: quizInfoResponse.name});
      requestQuizRemove(token, quizCreateResponse.quizId);
    }

    const result = requestQuizViewTrash(token) as ResQuizList;
    expect(result).toStrictEqual(example); // Including the initial 'Test Quiz'
    expect(result.status).toStrictEqual(OK);
  });
});