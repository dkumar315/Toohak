import { OK, UNAUTHORIZED } from './dataStore';
import { QuizListReturn } from './quiz';
import {
  requestClear, authRegister, quizCreate,
  requestQuizViewTrash, requestQuizRemove,
  ResToken, ResError, ResQuizId, ResQuizList,
  ERROR,
  requestQuizRestore,
  validQuizInfo,
  requestQuizInfoV1, requestQuizRemoveV1, requestQuizViewTrashV1,
  requestQuizRestoreV1, requestQuizEmptyTrashV1
} from './functionRequest';

let token1: string;
let token2: string;
let quizId1: number;
let quizId2: number;

beforeEach(() => {
  requestClear();

  token1 = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  token2 = authRegister('otheremail@gmail.com', 'otherpassw0rd', 'otherFirst', 'otherLast').token;

  quizId1 = quizCreate(token1, 'Test Quiz', 'This is a test quiz.').quizId;
  quizId2 = quizCreate(token2, 'Other Test Quiz', 'This is another test quiz.').quizId;

  requestQuizRemove(token1, quizId1);
  requestQuizRemove(token2, quizId2);
});

afterAll(() => requestClear());

describe('adminQuizViewTrash', () => {
  test('should return the list of trashed quizzes for the user', () => {
    const example: QuizListReturn = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Test Quiz',
        },
      ],
    };

    const result = requestQuizViewTrash(token1) as ResQuizList;
    expect(result).toMatchObject(example);
    expect(result.status).toStrictEqual(OK);
    expect(result.quizzes.length).toStrictEqual(1);

    expect(result.quizzes[0].quizId).toStrictEqual(quizId1);
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
    const example: QuizListReturn = {
      quizzes: []
    };
    // Register a new user to ensure no pre-existing quizzes
    const newTokenResponse = authRegister('newuser@example.com', 'newPassword123', 'New', 'User') as ResToken;
    const newToken = newTokenResponse.token;

    // Request trashed quizzes for the new user
    const result = requestQuizViewTrash(newToken) as ResQuizList;
    expect(result).toMatchObject(example);
    expect(result.status).toStrictEqual(OK);
  });

  test('should return multiple trashed quizzes if the user has more than one', () => {
    const anotherQuizCreateResponse = quizCreate(token1, 'Another Test Quiz', 'This is another test quiz.') as ResQuizId;
    const anotherQuizId = anotherQuizCreateResponse.quizId;
    requestQuizRemove(token1, anotherQuizId);

    const example: QuizListReturn = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Test Quiz',
        },
        {
          quizId: anotherQuizId,
          name: 'Another Test Quiz',
        }
      ]
    };

    const result = requestQuizViewTrash(token1) as ResQuizList;
    expect(result).toMatchObject(example);
    expect(result.status).toStrictEqual(OK);
  });

  test('should return only the quizzes owned by the user even if there are other trashed quizzes', () => {
    const result = requestQuizViewTrash(token1) as ResQuizList;
    const example: QuizListReturn = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Test Quiz',
        },
      ]
    };
    expect(result).toMatchObject(example);
    expect(result.status).toStrictEqual(OK);
    const example2: QuizListReturn = {
      quizzes: [
        {
          quizId: quizId2,
          name: 'Other Test Quiz',
        },
      ]
    };
    const otherResult = requestQuizViewTrash(token2) as ResQuizList;
    expect(otherResult).toMatchObject(example2);
    expect(otherResult.status).toStrictEqual(OK);
  });

  test('should return only trashed quizzes after a quiz is restored', () => {
    // Restore a quiz from the trash
    requestQuizRestore(token1, quizId1);
    const example: QuizListReturn = {
      quizzes: []
    };
    const result = requestQuizViewTrash(token1) as ResQuizList;
    expect(result).toMatchObject(example);
    expect(result.status).toStrictEqual(OK);
  });

  test('should handle a large number of trashed quizzes', () => {
    const example: QuizListReturn = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Test Quiz',
        },
      ]
    };
    for (let i = 0; i < 100; i++) {
      const quizId = quizCreate(token1, `Quiz ${i}`, `Description ${i}`).quizId;
      const quizInfoResponse = validQuizInfo(token1, quizId);
      example.quizzes.push({ quizId, name: quizInfoResponse.name });
      requestQuizRemove(token1, quizId);
    }

    const result = requestQuizViewTrash(token1) as ResQuizList;
    // Including the initial 'Test Quiz'
    expect(result).toMatchObject(example);
    expect(result.status).toStrictEqual(OK);
  });
});

describe('V1 routes for adminQuizTrash', () => {
  let result: ResQuizList;
  test('quizTrash', () => {
    expect(requestQuizEmptyTrashV1(token1, [quizId1]).status).toStrictEqual(OK);
    result = requestQuizViewTrashV1(token1) as ResQuizList;
    expect(result.quizzes.length).toStrictEqual(0);

    expect(requestQuizRemoveV1(token2, quizId2).status).toStrictEqual(OK);
    result = requestQuizViewTrashV1(token2) as ResQuizList;
    expect(result.quizzes.length).toStrictEqual(1);

    expect(requestQuizRestoreV1(token2, quizId2).status).toStrictEqual(OK);
    result = requestQuizViewTrashV1(token2) as ResQuizList;
    expect(result.quizzes.length).toStrictEqual(0);
    expect(requestQuizInfoV1(token2, quizId2).status).toStrictEqual(OK);
  });
});
