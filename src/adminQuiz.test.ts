import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  authRegister, requestAuthLogin,
  requestQuizList, requestQuizCreate, requestQuizInfo, requestQuizRemove,
  requestQuizNameUpdate, requestQuizDescriptionUpdate, requestClear,
  ResError, ResEmpty, ResToken, ResQuizList, ResQuizId, ResQuizInfo,
  requestQuizCreateV1, requestQuizListV1, requestQuizNameUpdateV1,
  requestQuizDescriptionUpdateV1, requestQuizInfoV1
} from './functionRequest';

beforeEach(() => {
  requestClear();
});

afterAll(() => requestClear());

describe('adminQuizList', () => {
  test('requestQuizList returns error when token is not valid', () => {
    const result = requestQuizList('789') as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('requestQuizList returns an empty list for a user with no quizzes', () => {
    const user = authRegister('akshatmishra@gmail.com', 'aks123456', 'Akshat', 'Mishra');
    const token = user.token;
    const result = requestQuizList(token) as ResQuizList;
    expect(result).toStrictEqual({ status: OK, quizzes: [] });
  });

  test('requestQuizList returns a list of quizzes for the logged-in user', () => {
    const user = authRegister('tonystark@gmail.com', 'assem1234ble', 'Tony', 'Stark');
    const token = user.token;
    const quiz1Name = 'Quiz 1';
    const quiz2Name = 'Quiz 2';
    const quiz1 = requestQuizCreate(token, quiz1Name, 'Description 1') as ResQuizId;
    const quiz2 = requestQuizCreate(token, quiz2Name, 'Description 2') as ResQuizId;
    const result = requestQuizList(token) as ResQuizList;
    expect(result.quizzes).toStrictEqual([
      { quizId: quiz1.quizId, name: quiz1Name },
      { quizId: quiz2.quizId, name: quiz2Name },
    ]);
  });
});

describe('adminQuizCreate', () => {
  test('Creating a quiz with valid inputs', () => {
    const user = authRegister('akshatmish@yahoo.com', 'akst123456', 'Akshat', 'Mishra');
    requestAuthLogin('akshatmish@yahoo.com', 'akst123456') as ResToken;

    const result = requestQuizCreate(user.token, 'Test Quiz', 'First test quiz.') as ResQuizId;
    expect(result).toEqual(expect.objectContaining({ quizId: expect.any(Number) }));

    const quizzes = requestQuizList(user.token) as ResQuizList;
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Test Quiz'
        }
      ],
      status: OK,
    });
  });

  test('Creating a quiz with invalid token', () => {
    const result = requestQuizCreate('999', 'Test Quiz', 'This is a test quiz.') as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('Creating a quiz with invalid name', () => {
    const user = authRegister('DaveShalom@gmail.com', 'good23food', 'devaansh', 'shalom');
    const result = requestQuizCreate(user.token, 'T$', 'Second test quiz.') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a name that is too short', () => {
    const user = authRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel');
    const result = requestQuizCreate(user.token, 'Te', 'Third test quiz.') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a name that is too long', () => {
    const name = 'n'.repeat(31);
    const user = authRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel');
    const result = requestQuizCreate(user.token, name, 'Third test quiz.') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a name that is used by the current user for another quiz', () => {
    const name = 'Quiz';
    const user = authRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel');
    const result1 = requestQuizCreate(user.token, name, 'Third test quiz.') as ResError;
    expect(result1).toEqual(expect.objectContaining({ quizId: expect.any(Number) }));

    const result2 = requestQuizCreate(user.token, name, 'Third test quiz.') as ResError;
    expect(result2).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a description that is too long', () => {
    const user = authRegister('prishalom@gmail.com', 'primi456s', 'priyasnhu', 'mish');
    const longDescription = 'a'.repeat(101);
    const result = requestQuizCreate(user.token, 'Test Quiz', longDescription) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });
});

describe('adminQuizRemove tests', () => {
  let userId1: ResToken, userId2: ResToken, quizId1: ResQuizId;

  beforeEach(() => {
    requestClear();

    userId1 = authRegister('krishpatel@gmail.com', 'KrishP01', 'Krish', 'Patel');
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizId;
    userId2 = authRegister('joshhoward@gmail.com', 'JoshH002', 'Josh', 'Howard');
    requestQuizCreate(userId2.token, 'Second Quiz', 'Another quiz for testing') as ResQuizId;
  });

  test('Quiz successfully gets removed', () => {
    const result = requestQuizRemove(userId1.token, quizId1.quizId) as ResEmpty;
    expect(result).toStrictEqual({ status: OK });

    const quizzes = requestQuizList(userId1.token) as ResQuizList;
    expect(quizzes).toStrictEqual({ status: OK, quizzes: [] });
  });

  test('Error shown when user ID is invalid', () => {
    const result = requestQuizRemove('999', quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('Error shown when quiz ID is invalid', () => {
    const result = requestQuizRemove(userId1.token, 999) as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Error shown when user does not own the quiz', () => {
    const result = requestQuizRemove(userId2.token, quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Error shown when removing a quiz after it has already been removed', () => {
    requestQuizRemove(userId1.token, quizId1.quizId) as ResError;
    const result = requestQuizRemove(userId1.token, quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Error shown when removing a quiz with an empty quiz ID', () => {
    const result = requestQuizRemove(userId1.token, null) as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Error shown when removing a quiz with an empty user ID', () => {
    const result = requestQuizRemove(null, quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });
});

describe('adminQuizInfo tests', () => {
  let userId1: ResToken, userId2: ResToken, quizId1: ResQuizId, quizId2: ResQuizId;

  beforeEach(() => {
    requestClear();

    userId1 = authRegister('krishpatel@gmail.com', 'KrishP01', 'Krish', 'Patel');
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizId;
    userId2 = authRegister('joshhoward@gmail.com', 'JoshH002', 'Josh', 'Howard');
    quizId2 = requestQuizCreate(userId2.token, 'Second Quiz', 'Another quiz for testing') as ResQuizId;
  });

  test('Successfully retrieves quiz information', () => {
    const result = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect(result).toStrictEqual({
      quizId: quizId1.quizId,
      name: 'My Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz on Testing',
      numQuestions: 0,
      questions: [],
      thumbnailUrl: '',
      duration: 0,
      status: 200
    });
  });

  test('Error shown when token is not valid', () => {
    const result = requestQuizInfo('789', 1) as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('Error shown when quiz ID is invalid', () => {
    const result = requestQuizInfo(userId1.token, 999) as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Error shown when user does not own the quiz', () => {
    const result = requestQuizInfo(userId1.token, quizId2.quizId) as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Error shown when quiz ID is null', () => {
    const result = requestQuizInfo(userId1.token, null) as ResError;
    expect(result).toEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Error shown when user ID is null', () => {
    const result = requestQuizInfo(null, quizId1.quizId) as ResError;
    expect(result).toEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });
});

describe('Testing for adminQuizNameUpdate', () => {
  let userId1: ResToken, quizId1: ResQuizId, quizInfo1: ResQuizInfo;
  let userId2: ResToken, quizId2: ResQuizId, quizInfo2: ResQuizInfo;
  let quizId3: ResQuizId, quizInfo3: ResQuizInfo;

  beforeEach(() => {
    requestClear();

    userId1 = authRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizId;
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;

    userId2 = authRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel');
    quizId2 = requestQuizCreate(userId2.token, 'Your Quiz', 'Quiz on Implementation') as ResQuizId;
    quizInfo2 = requestQuizInfo(userId2.token, quizId2.quizId) as ResQuizInfo;

    quizId3 = requestQuizCreate(userId1.token, 'Our Quiz', 'Quiz on Ethics') as ResQuizId;
    quizInfo3 = requestQuizInfo(userId1.token, quizId3.quizId) as ResQuizInfo;
  });

  test('Valid User ID, Quiz ID and Name', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'New Quiz');
    expect(result).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('New Quiz');
  });

  test('Invalid User ID', () => {
    const result = requestQuizNameUpdate('3', quizInfo1.quizId, 'New Quiz') as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const result = requestQuizNameUpdate(userId1.token, 4, 'New Quiz') as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo2.quizId, 'New Quiz') as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Name with symbols and alphanumeric characters', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '!M@y# $Q%u^i&z*()') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name with only symbols', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '!@#$%^&*()') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Empty name', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name less than 3 characters', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'No') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name more than 30 characters', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'n'.repeat(31)) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name already in use', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, quizInfo3.name) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name with leading and trailing spaces', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '   New Quiz   ');
    expect(result).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('New Quiz');
  });

  test('Name with multiple spaces in between', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'New    Quiz');
    expect(result).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('New    Quiz');
  });

  test('Update name to the same existing name', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'My Quiz');
    expect(result).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('My Quiz');
  });

  test('User ID is null', () => {
    const result = requestQuizNameUpdate(null, quizInfo1.quizId, 'New Name') as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('Quiz ID is null', () => {
    const result = requestQuizNameUpdate(userId1.token, null, 'New Name') as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Name is null', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, null) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name with alphanumeric characters only', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'Quiz 1') as ResEmpty;
    expect(result).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('Quiz 1');
  });

  test('Update name of a quiz owned by another user', () => {
    const result = requestQuizNameUpdate(userId2.token, quizInfo1.quizId, 'New Quiz') as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Update name to multiple spaces', () => {
    const result = requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '    ') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Update name of a removed quiz', () => {
    requestQuizRemove(userId1.token, quizId1.quizId) as ResEmpty;
    const result = requestQuizNameUpdate(userId1.token, quizId1.quizId, 'New Name') as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });
});

describe('Testing for adminQuizDescriptionUpdate', () => {
  let userId1: ResToken;
  let quizId1: ResQuizId;
  let quizInfo1: ResQuizInfo;
  let userId2: ResToken;
  let quizId2: ResQuizId;
  let quizInfo2: ResQuizInfo;

  beforeEach(() => {
    requestClear();

    userId1 = authRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizId;
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;

    userId2 = authRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel');
    quizId2 = requestQuizCreate(userId2.token, 'Your Quiz', 'Quiz on Implementation') as ResQuizId;
    quizInfo2 = requestQuizInfo(userId2.token, quizId2.quizId) as ResQuizInfo;
  });

  test('valid token, quizId and name', () => {
    const result = requestQuizDescriptionUpdate(userId1.token, quizInfo1.quizId, 'Quiz on Coding') as ResError;
    expect(result).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.description)).toStrictEqual('Quiz on Coding');
  });

  test('invalid token', () => {
    const result = requestQuizDescriptionUpdate('3', quizInfo1.quizId, 'Quiz on Coding') as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('quizId does not refer to a valid quiz', () => {
    const result = requestQuizDescriptionUpdate(userId1.token, 3, 'Quiz on Coding') as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('quizId does not refer to a quiz that this user owns', () => {
    const result = requestQuizDescriptionUpdate(userId1.token, quizInfo2.quizId, 'Quiz on Coding') as ResError;
    expect(result).toStrictEqual({ status: FORBIDDEN, error: expect.any(String) });
  });

  test('Empty description', () => {
    const result = requestQuizDescriptionUpdate(userId1.token, quizInfo1.quizId, '') as ResEmpty;
    expect(result).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.description)).toStrictEqual('');
  });

  test('Description more than 100 characters', () => {
    const result = requestQuizDescriptionUpdate(userId1.token, quizInfo1.quizId, 'd'.repeat(101)) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });
});

describe('V1 routes for adminQuiz', () => {
  let token: string, quizId: number;

  beforeEach(() => {
    token = authRegister('e@mail.com', 'passw0rd', 'na', 'me').token;
    quizId = (requestQuizCreateV1(token, 'quiz', '') as ResQuizId).quizId;
  });

  test('quizCreate and quizList', () => {
    const quizList: ResQuizList = requestQuizListV1(token) as ResQuizList;
    expect(quizList.quizzes[0].quizId).toStrictEqual(quizId);
    expect(quizList.quizzes[0].name).toStrictEqual('quiz');
  });

  test('quizUpdate and quizInfo', () => {
    expect(requestQuizNameUpdateV1(token, quizId, 'abc').status).toStrictEqual(OK);
    expect(requestQuizDescriptionUpdateV1(token, quizId, '').status).toStrictEqual(OK);
    const quizInfo: ResQuizInfo = requestQuizInfoV1(token, quizId) as ResQuizInfo;
    expect(quizInfo.name).toStrictEqual('abc');
    expect(quizInfo.description).toStrictEqual('');
  });
});
