import { OK, BAD_REQUEST, UNAUTHORIZED } from './dataStore';
import {
  requestAuthRegister, requestAuthLogin,
  requestQuizList, requestQuizCreate, requestQuizInfo, requestQuizRemove,
  requestQuizNameUpdate, requestQuizDescriptionUpdate, requestClear,
  ResError, ResEmpty, ResToken, ResQuizList, ResQuizCreate, ResQuizInfo
} from './functionRequest';

beforeEach(() => {
  requestClear();
});

describe('adminQuizList', () => {
  test('requestQuizList returns error when token is not valid', () => {
    const result = requestQuizList('789') as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('requestQuizList returns an empty list for a user with no quizzes', () => {
    requestAuthRegister('akshatmishra@gmail.com', 'aks123456', 'Akshat', 'Mishra') as ResToken;
    const user = requestAuthLogin('akshatmishra@gmail.com', 'aks123456') as ResToken;
    const token = user.token;
    const result = requestQuizList(token) as ResQuizList;
    expect(result).toStrictEqual({ status: OK, quizzes: [] });
  });

  test('requestQuizList returns a list of quizzes for the logged-in user', () => {
    const user = requestAuthRegister('tonystark@gmail.com', 'assem1234ble', 'Tony', 'Stark') as ResToken;
    const token = user.token;
    const quiz1Name = 'Quiz 1';
    const quiz2Name = 'Quiz 2';
    const quiz1 = requestQuizCreate(token, quiz1Name, 'Description 1') as ResQuizCreate;
    const quiz2 = requestQuizCreate(token, quiz2Name, 'Description 2') as ResQuizCreate;
    const result = requestQuizList(token) as ResQuizList;
    expect(result.quizzes).toStrictEqual([
      { quizId: quiz1.quizId, name: quiz1Name },
      { quizId: quiz2.quizId, name: quiz2Name },
    ]);
  });
});

describe('adminQuizCreate', () => {
  test('Creating a quiz with valid inputs', () => {
    const user = requestAuthRegister('akshatmish@yahoo.com', 'akst123456', 'Akshat', 'Mishra') as ResToken;
    requestAuthLogin('akshatmish@yahoo.com', 'akst123456') as ResToken;

    const result = requestQuizCreate(user.token, 'Test Quiz', 'First test quiz.') as ResQuizCreate;
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
    const user = requestAuthRegister('DaveShalom@gmail.com', 'good23food', 'devaansh', 'shalom') as ResToken;
    const result = requestQuizCreate(user.token, 'T$', 'Second test quiz.') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a name that is too short', () => {
    const user = requestAuthRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel') as ResToken;
    const result = requestQuizCreate(user.token, 'Te', 'Third test quiz.') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a name that is too long', () => {
    const name = 'n'.repeat(31);
    const user = requestAuthRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel') as ResToken;
    const result = requestQuizCreate(user.token, name, 'Third test quiz.') as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a name that is used by the current user for another quiz', () => {
    const name = 'Quiz';
    const user = requestAuthRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel') as ResToken;
    const result1 = requestQuizCreate(user.token, name, 'Third test quiz.') as ResError;
    expect(result1).toEqual(expect.objectContaining({ quizId: expect.any(Number) }));

    const result2 = requestQuizCreate(user.token, name, 'Third test quiz.') as ResError;
    expect(result2).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Creating a quiz with a description that is too long', () => {
    const user = requestAuthRegister('prishalom@gmail.com', 'primi456s', 'priyasnhu', 'mish') as ResToken;
    const longDescription = 'a'.repeat(101);
    const result = requestQuizCreate(user.token, 'Test Quiz', longDescription) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });
});

describe('adminQuizRemove tests', () => {
  let userId1: ResToken, userId2: ResToken, quizId1: ResQuizCreate;

  beforeEach(() => {
    requestClear();
    userId1 = requestAuthRegister('krishpatel@gmail.com', 'KrishP01', 'Krish', 'Patel') as ResToken;
    requestAuthLogin('krishpatel@gmail.com', 'KrishP') as ResToken;
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizCreate;
    userId2 = requestAuthRegister('joshhoward@gmail.com', 'JoshH002', 'Josh', 'Howard') as ResToken;
    requestAuthLogin('joshhoward@gmail.com', 'JoshH') as ResToken;
    requestQuizCreate(userId2.token, 'Second Quiz', 'Another quiz for testing') as ResQuizCreate;
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
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Error shown when user does not own the quiz', () => {
    const result = requestQuizRemove(userId2.token, quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Error shown when removing a quiz after it has already been removed', () => {
    requestQuizRemove(userId1.token, quizId1.quizId) as ResError;
    const result = requestQuizRemove(userId1.token, quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Error shown when removing a quiz with an empty quiz ID', () => {
    const result = requestQuizRemove(userId1.token, null) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Error shown when removing a quiz with an empty user ID', () => {
    const result = requestQuizRemove(null, quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  // test('Error shown when quiz ID is a string instead of an integer', () => {
  //   const result = requestQuizRemove(userId1.token, 'invalidQuizId') as ResEmpty;;
  //   expect(result).toStrictEqual({ status: UNAUTHORIZED, error:expect.any(String)});
  // });
});

describe('adminQuizInfo tests', () => {
  let userId1: ResToken, userId2: ResToken, quizId1: ResQuizCreate, quizId2: ResQuizCreate;

  beforeEach(() => {
    requestClear();
    userId1 = requestAuthRegister('krishpatel@gmail.com', 'KrishP01', 'Krish', 'Patel') as ResToken;
    requestAuthLogin('krishpatel@gmail.com', 'KrishP') as ResToken;
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizCreate;
    userId2 = requestAuthRegister('joshhoward@gmail.com', 'JoshH002', 'Josh', 'Howard') as ResToken;
    requestAuthLogin('joshhoward@gmail.com', 'JoshH') as ResToken;
    quizId2 = requestQuizCreate(userId2.token, 'Second Quiz', 'Another quiz for testing') as ResQuizCreate;
  });

  test('Successfully retrieves quiz information', () => {
    const result = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect(result).toStrictEqual({
      quizId: quizId1.quizId,
      name: 'My Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz on Testing',
      status: 200
    });
  });

  test('Error shown when token is not valid', () => {
    const result = requestQuizInfo('789', 1) as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('Error shown when quiz ID is invalid', () => {
    const result = requestQuizInfo(userId1.token, 999) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Error shown when user does not own the quiz', () => {
    const result = requestQuizInfo(userId1.token, quizId2.quizId) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Error shown when user ID is a string instead of an integer', () => {
    const result = requestQuizInfo('invalidUserId', quizId1.quizId) as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  // test('Error shown when quiz ID is a string instead of an integer', () => {
  //   const result = requestQuizInfo(userId1.token, 'invalidQuizId') as ResQuizInfo;
  //   expect(result).toStrictEqual({ status: UNAUTHORIZED, error:expect.any(String)});
  // });

  test('Error shown when quiz ID is null', () => {
    const result = requestQuizInfo(userId1.token, null) as ResError;
    expect(result).toEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Error shown when user ID is null', () => {
    const result = requestQuizInfo(null, quizId1.quizId) as ResError;
    expect(result).toEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });
});

describe('Testing for adminQuizNameUpdate', () => {
  let userId1: ResToken;
  let quizId1: ResQuizCreate;
  let quizInfo1: ResQuizInfo;
  let userId2: ResToken;
  let quizId2: ResQuizCreate;
  let quizInfo2: ResQuizInfo;
  let quizId3: ResQuizCreate;
  let quizInfo3: ResQuizInfo;

  beforeEach(() => {
    requestClear();

    userId1 = requestAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar') as ResToken;
    requestAuthLogin('devk@gmail.com', 'DevaanshK01') as ResToken;
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizCreate;
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;

    userId2 = requestAuthRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel') as ResToken;
    requestAuthLogin('krishp@gmail.com', 'KrishP02') as ResToken;
    quizId2 = requestQuizCreate(userId2.token, 'Your Quiz', 'Quiz on Implementation') as ResQuizCreate;
    quizInfo2 = requestQuizInfo(userId2.token, quizId2.quizId) as ResQuizInfo;

    requestAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar') as ResToken;
    requestAuthLogin('devk@gmail.com', 'DevaanshK01') as ResToken;
    quizId3 = requestQuizCreate(userId1.token, 'Our Quiz', 'Quiz on Ethics') as ResQuizCreate;
    quizInfo3 = requestQuizInfo(userId1.token, quizId3.quizId) as ResQuizInfo;
  });

  test('Valid User ID, Quiz ID and Name', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'New Quiz')).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('New Quiz');
  });

  test('Invalid User ID', () => {
    expect(requestQuizNameUpdate('3', quizInfo1.quizId, 'New Quiz') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    expect(requestQuizNameUpdate(userId1.token, 4, 'New Quiz') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo2.quizId, 'New Quiz') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name with symbols and alphanumeric characters', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '!M@y# $Q%u^i&z*()') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name with only symbols', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '!@#$%^&*()') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Empty name', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name less than 3 characters', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'No') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name more than 30 characters', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'This name is longer than 30 characters') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name already in use', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, quizInfo3.name) as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name with leading and trailing spaces', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '   New Quiz   ')).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('New Quiz');
  });

  test('Name with multiple spaces in between', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'New    Quiz')).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('New    Quiz');
  });

  test('Update name to the same existing name', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'My Quiz')).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('My Quiz');
  });

  test('User ID is null', () => {
    expect(requestQuizNameUpdate(null, quizInfo1.quizId, 'New Name') as ResError).toStrictEqual({ status: UNAUTHORIZED, error: expect.any(String) });
  });

  test('Quiz ID is null', () => {
    expect(requestQuizNameUpdate(userId1.token, null, 'New Name') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name is null', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, null) as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Name with alphanumeric characters only', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, 'Quiz 1') as ResEmpty).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.name)).toStrictEqual('Quiz 1');
  });

  test('Update name of a quiz owned by another user', () => {
    expect(requestQuizNameUpdate(userId2.token, quizInfo1.quizId, 'New Quiz') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Update name to multiple spaces', () => {
    expect(requestQuizNameUpdate(userId1.token, quizInfo1.quizId, '    ') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Update name of a removed quiz', () => {
    requestQuizRemove(userId1.token, quizId1.quizId) as ResEmpty;
    expect(requestQuizNameUpdate(userId1.token, quizId1.quizId, 'New Name') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });
});

describe('Testing for adminQuizDescriptionUpdate', () => {
  let userId1: ResToken;
  let quizId1: ResQuizCreate;
  let quizInfo1: ResQuizInfo;
  let userId2: ResToken;
  let quizId2: ResQuizCreate;
  let quizInfo2: ResQuizInfo;

  beforeEach(() => {
    requestClear();

    userId1 = requestAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar') as ResToken;
    requestAuthLogin('devk@gmail.com', 'DevaanshK01') as ResToken;
    quizId1 = requestQuizCreate(userId1.token, 'My Quiz', 'Quiz on Testing') as ResQuizCreate;
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;

    userId2 = requestAuthRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel') as ResToken;
    requestAuthLogin('krishp@gmail.com', 'KrishP02') as ResToken;
    quizId2 = requestQuizCreate(userId2.token, 'Your Quiz', 'Quiz on Implementation') as ResQuizCreate;
    quizInfo2 = requestQuizInfo(userId2.token, quizId2.quizId) as ResQuizInfo;
  });

  test('valid token, quizId and name', () => {
    expect(requestQuizDescriptionUpdate(userId1.token, quizInfo1.quizId, 'Quiz on Coding') as ResError).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.description)).toStrictEqual('Quiz on Coding');
  });

  test('invalid token', () => {
    expect(requestQuizDescriptionUpdate('3', quizInfo1.quizId, 'Quiz on Coding') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('quizId does not refer to a valid quiz', () => {
    expect(requestQuizDescriptionUpdate(userId1.token, 3, 'Quiz on Coding') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('quizId does not refer to a quiz that this user owns', () => {
    expect(requestQuizDescriptionUpdate(userId1.token, quizInfo2.quizId, 'Quiz on Coding') as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });

  test('Empty description', () => {
    expect(requestQuizDescriptionUpdate(userId1.token, quizInfo1.quizId, '') as ResEmpty).toStrictEqual({ status: OK });
    quizInfo1 = requestQuizInfo(userId1.token, quizId1.quizId) as ResQuizInfo;
    expect((quizInfo1.description)).toStrictEqual('');
  });

  test('Description more than 100 characters', () => {
    const description = 'This description is very long and it crosses the hundred character limit set for the quiz description';
    expect(requestQuizDescriptionUpdate(userId1.token, quizInfo1.quizId, description) as ResError).toStrictEqual({ status: BAD_REQUEST, error: expect.any(String) });
  });
});
