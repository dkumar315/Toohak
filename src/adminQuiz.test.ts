// suggest for xxxUpdate:
// expect(timeLastEdited).toBeGreaterThanOrEqual(timeCreated);
test('delete it', () => {
  expect(1 + 1).toBe(2);
});

/* import {
  clear
} from './other.js';

import {
  adminAuthRegister,
  adminAuthLogin
} from './auth.js';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate
} from './quiz.js';

beforeEach(() => {
  clear();
});

describe('adminQuizList', () => {
  test('adminQuizList returns error when authUserId is not valid', () => {
    const result = adminQuizList(789);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('adminQuizList returns an empty list for a user with no quizzes', () => {
    adminAuthRegister('akshatmishra@gmail.com', 'aks123456', 'Akshat', 'Mishra');
    const user = adminAuthLogin('akshatmishra@gmail.com', 'aks123456');
    const authUserId = user.authUserId;
    const result = adminQuizList(authUserId);
    expect(result).toStrictEqual({"quizzes": []});
  });

  test('adminQuizList returns a list of quizzes for the logged-in user', () => {
    const user = adminAuthRegister('tonystark@gmail.com', 'assem1234ble', 'Tony', 'Stark');
    const authUserId = user.authUserId;
    const quiz1Name = 'Quiz 1';
    const quiz2Name = 'Quiz 2';
    const quiz1 = adminQuizCreate(authUserId, quiz1Name, 'Description 1');
    const quiz2 = adminQuizCreate(authUserId, quiz2Name, 'Description 2');
    const result = adminQuizList(authUserId);
    expect(result.quizzes).toStrictEqual([
      { quizId: quiz1.quizId, name: quiz1Name },
      { quizId: quiz2.quizId, name: quiz2Name }
    ]);
  });
});

describe('adminQuizCreate', () => {
  test('Creating a quiz with valid inputs', () => {
    const user = adminAuthRegister('akshatmish@yahoo.com', 'akst123456', 'Akshat', 'Mishra');
    adminAuthLogin('akshatmish@yahoo.com', 'akst123456');

    const result = adminQuizCreate(user.authUserId, 'Test Quiz', 'First test quiz.');
    expect(result).toEqual(expect.objectContaining({ quizId: expect.any(Number) }));

    const quizzes = adminQuizList(user.authUserId);
    expect(quizzes).toStrictEqual({
      quizzes: [
        {
        quizId: expect.any(Number),
        name: 'Test Quiz'
        }
      ]
    });
  });

  test('Creating a quiz with invalid authUserId', () => {
    const result = adminQuizCreate(999, 'Test Quiz', 'This is a test quiz.');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Creating a quiz with invalid name', () => {
    const user = adminAuthRegister('DaveShalom@gmail.com', 'good23food', 'devaansh', 'shalom');
    const result = adminQuizCreate(user.authUserId, 'T$', 'Second test quiz.');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Creating a quiz with a name that is too short', () => {
    const user = adminAuthRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel');
    const result = adminQuizCreate(user.authUserId, 'Te', 'Third test quiz.');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Creating a quiz with a name that is too long', () => {
    const name = 'n'.repeat(31);
    const user = adminAuthRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel');
    const result = adminQuizCreate(user.authUserId, name, 'Third test quiz.');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Creating a quiz with a name that is used by the current user for another quiz', () => {
    const name = 'Quiz';
    const user = adminAuthRegister('krishshalom@gmail.com', 'krisptel7', 'chris', 'patel');
    const result1 = adminQuizCreate(user.authUserId, name, 'Third test quiz.');
    expect(result1).toEqual(expect.objectContaining({ quizId: expect.any(Number) }));

    const result2 = adminQuizCreate(user.authUserId, name, 'Third test quiz.');
    expect(result2).toStrictEqual({ error: expect.any(String) });
  });

  test('Creating a quiz with a description that is too long', () => {
    const user = adminAuthRegister('prishalom@gmail.com', 'primi456s', 'priyasnhu', 'mish');
    const longDescription = 'a'.repeat(101);
    const result = adminQuizCreate(user.authUserId, 'Test Quiz', longDescription);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

describe('adminQuizRemove tests', () => {
  let userId1, userId2, quizId1, quizId2;

  beforeEach(() => {
  clear();
  userId1 = adminAuthRegister('krishpatel@gmail.com', 'KrishP01', 'Krish', 'Patel');
  adminAuthLogin('krishpatel@gmail.com', 'KrishP');
  quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
  userId2 = adminAuthRegister('joshhoward@gmail.com', 'JoshH002', 'Josh', 'Howard');
  adminAuthLogin('joshhoward@gmail.com', 'JoshH');
  quizId2 = adminQuizCreate(userId2.authUserId, 'Second Quiz', 'Another quiz for testing');
  });

  test('Quiz successfully gets removed', () => {
    const result = adminQuizRemove(userId1.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({});

    const quizzes = adminQuizList(userId1.authUserId);
    expect(quizzes).toStrictEqual({'quizzes': []});
  });

  test('Error shown when user ID is invalid', () => {
    const result = adminQuizRemove(999, quizId1.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when quiz ID is invalid', () => {
    const result = adminQuizRemove(userId1.authUserId, 999);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when user does not own the quiz', () => {
    const result = adminQuizRemove(userId2.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when removing a quiz after it has already been removed', () => {
    adminQuizRemove(userId1.authUserId, quizId1.quizId);
    const result = adminQuizRemove(userId1.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when removing a quiz with an empty quiz ID', () => {
    const result = adminQuizRemove(userId1.authUserId, null);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when removing a quiz with an empty user ID', () => {
    const result = adminQuizRemove(null, quizId1.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when quiz ID is a string instead of an integer', () => {
    const result = adminQuizRemove(userId1.authUserId, 'invalidQuizId');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

describe('adminQuizInfo tests', () => {
  let userId1, userId2, quizId1, quizId2;

  beforeEach(() => {
  clear();
  userId1 = adminAuthRegister('krishpatel@gmail.com', 'KrishP01', 'Krish', 'Patel');
  adminAuthLogin('krishpatel@gmail.com', 'KrishP');
  quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
  userId2 = adminAuthRegister('joshhoward@gmail.com', 'JoshH002', 'Josh', 'Howard');
  adminAuthLogin('joshhoward@gmail.com', 'JoshH');
  quizId2 = adminQuizCreate(userId2.authUserId, 'Second Quiz', 'Another quiz for testing');
  });

  test('Successfully retrieves quiz information', () => {
    const result = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect(result).toStrictEqual({
      quizId: quizId1.quizId,
      name: 'My Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz on Testing',
    });
  });

  test('Error shown when authUserId is not valid', () => {
    const result = adminQuizInfo(789, 1);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when quiz ID is invalid', () => {
    const result = adminQuizInfo(userId1.authUserId, 999);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when user does not own the quiz', () => {
    const result = adminQuizInfo(userId1.authUserId, quizId2.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when user ID is a string instead of an integer', () => {
    const result = adminQuizInfo('invalidUserId', quizId1.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when quiz ID is a string instead of an integer', () => {
    const result = adminQuizInfo(userId1.authUserId, 'invalidQuizId');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Error shown when quiz ID is null', () => {
    const result = adminQuizInfo(userId1.authUserId, null);
    expect(result).toEqual({ error: expect.any(String) });
  });

  test('Error shown when user ID is null', () => {
    const result = adminQuizInfo(null, quizId1);
    expect(result).toEqual({ error: expect.any(String) });
  });
});

describe('Testing for adminQuizNameUpdate', () => {
  let userId1;
  let quizId1;
  let quizInfo1;
  let userId2;
  let quizId2;
  let quizInfo2;
  let quizId3;
  let quizInfo3;

  beforeEach(() => {
    clear();

    userId1 = adminAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    adminAuthLogin('devk@gmail.com', 'DevaanshK01');
    quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);

    userId2 = adminAuthRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel');
    adminAuthLogin('krishp@gmail.com', 'KrishP02');
    quizId2 = adminQuizCreate(userId2.authUserId, 'Your Quiz', 'Quiz on Implementation');
    quizInfo2 = adminQuizInfo(userId2.authUserId, quizId2.quizId);

    adminAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    adminAuthLogin('devk@gmail.com', 'DevaanshK01');
    quizId3 = adminQuizCreate(userId1.authUserId, 'Our Quiz', 'Quiz on Ethics');
    quizInfo3 = adminQuizInfo(userId1.authUserId, quizId3.quizId);
  });

  test('Valid User ID, Quiz ID and Name', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'New Quiz')).toStrictEqual({});
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.name)).toStrictEqual('New Quiz');
  });

  test('Invalid User ID', () => {
    expect(adminQuizNameUpdate(3, quizInfo1.quizId, 'New Quiz')).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, 4, 'New Quiz')).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo2.quizId, 'New Quiz')).toStrictEqual({ error: expect.any(String) });
  });

  test('Name with symbols and alphanumeric characters', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '!M@y# $Q%u^i&z*()')).toStrictEqual({ error: expect.any(String) });
  });

  test('Name with only symbols', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '!@#$%^&*()')).toStrictEqual({ error: expect.any(String) });
  });

  test('Empty name', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '')).toStrictEqual({ error: expect.any(String) });
  });

  test('Name less than 3 characters', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'No')).toStrictEqual({ error: expect.any(String) });
  });

  test('Name more than 30 characters', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'This name is longer than 30 characters')).toStrictEqual({ error: expect.any(String) });
  });

  test('Name already in use', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, quizInfo3.name)).toStrictEqual({ error: expect.any(String) });
  });

  test('Name with leading and trailing spaces', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '   New Quiz   ')).toStrictEqual({});
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.name)).toStrictEqual('New Quiz');
  });

  test('Name with multiple spaces in between', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'New    Quiz')).toStrictEqual({});
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.name)).toStrictEqual('New    Quiz');
  });

  test('Update name to the same existing name', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'My Quiz')).toStrictEqual({});
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.name)).toStrictEqual('My Quiz');
  });

  test('User ID is null', () => {
    expect(adminQuizNameUpdate(null, quizInfo1.quizId, 'New Name')).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID is null', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, null, 'New Name')).toStrictEqual({ error: expect.any(String) });
  });

  test('Name is null', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, null)).toStrictEqual({ error: expect.any(String) });
  });

  test('Name with alphanumeric characters only', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, 'Quiz 1')).toStrictEqual({});
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.name)).toStrictEqual('Quiz 1');
  });

  test('Update name of a quiz owned by another user', () => {
    expect(adminQuizNameUpdate(userId2.authUserId, quizInfo1.quizId, 'New Quiz')).toStrictEqual({ error: expect.any(String) });
  });

  test('Update name to multiple spaces', () => {
    expect(adminQuizNameUpdate(userId1.authUserId, quizInfo1.quizId, '    ')).toStrictEqual({ error: expect.any(String) });
  });

  test('Update name of a removed quiz', () => {
    adminQuizRemove(userId1.authUserId, quizId1.quizId);
    expect(adminQuizNameUpdate(userId1.authUserId, quizId1.quizId, 'New Name')).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Testing for adminQuizDescriptionUpdate', () => {
  let userId1;
  let quizId1;
  let quizInfo1;
  let userId2;
  let quizId2;
  let quizInfo2;

  beforeEach(() => {
    clear();

    userId1 = adminAuthRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    adminAuthLogin('devk@gmail.com', 'DevaanshK01');
    quizId1 = adminQuizCreate(userId1.authUserId, 'My Quiz', 'Quiz on Testing');
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);

    userId2 = adminAuthRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel');
    adminAuthLogin('krishp@gmail.com', 'KrishP02');
    quizId2 = adminQuizCreate(userId2.authUserId, 'Your Quiz', 'Quiz on Implementation');
    quizInfo2 = adminQuizInfo(userId2.authUserId, quizId2.quizId);
  });

  test('valid authUserId, quizId and name', () => {
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo1.quizId, 'Quiz on Coding')).toStrictEqual({});
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.description)).toStrictEqual('Quiz on Coding');
  });

  test('invalid authUserId', () => {
    expect(adminQuizDescriptionUpdate(3, quizInfo1.quizId, 'Quiz on Coding')).toStrictEqual({ error: expect.any(String) });
  });

  test('quizId does not refer to a valid quiz', () => {
    expect(adminQuizDescriptionUpdate(userId1.authUserId, 3, 'Quiz on Coding')).toStrictEqual({ error: expect.any(String) });
  });

  test('quizId does not refer to a quiz that this user owns', () => {
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo2.quizId, 'Quiz on Coding')).toStrictEqual({ error: expect.any(String) });
  });

  test('Empty description', () => {
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo1.quizId, '')).toStrictEqual({});
    quizInfo1 = adminQuizInfo(userId1.authUserId, quizId1.quizId);
    expect((quizInfo1.description)).toStrictEqual('');
  });

  test('Description more than 100 characters', () => {
    let description = 'This description is very long and it crosses the hundred character limit set for the quiz description';
    expect(adminQuizDescriptionUpdate(userId1.authUserId, quizInfo1.quizId, description)).toStrictEqual({ error: expect.any(String) });
  });
}); */
