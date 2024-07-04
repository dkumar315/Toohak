import {
  requestAuthRegister, requestAuthLogout,
  requestQuizCreate, requestQuizInfo, requestQuizRemove,
  requestQuizQuestionCreate, requestQuizQuestionUpdate,
  requestQuizQuestionDuplicate, requestClear,
  ERROR, ResError, VALID_EMPTY_RETURN
} from './functionRequest';

import {
  OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, Answer, Quiz, Colours
} from './dataStore';

import {
  QuestionBody, AnswerInput, NewQuestionIdReturn
} from './quizQuestion';

interface ResNewQuestionId {
  status: typeof OK;
  newQuestionId: number;
}

const expectValidReturn: NewQuestionIdReturn = { newQuestionId: expect.any(Number) };

const questionBody: QuestionBody = {
  question: 'who\'s the fairest of them all?',
  duration: 10,
  points: 8,
  answers: [
    {
      answer: 'Snow White',
      correct: true
    },
    {
      answer: 'Poisoned Apple',
      correct: false
    }
  ]
};

let token: string, quizId: number, questionId: number;
beforeEach(() => {
  requestClear();
  token = requestAuthRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  quizId = requestQuizCreate(token, 'Mirror Mirror on the wall', 'I am the fairest of the all').quizId;
  requestQuizQuestionCreate(token, quizId, questionBody);
});
afterAll(() => requestClear());

describe('testing adminQuizQuestionDuplicate' +
  '(POST /v1/admin/quiz/{quizid}/question)/{questionid}/duplicate', () => {
  let result: ResNewQuestionId;
  describe('test1.0 valid token, quizId and questionId', () => {
    test('test1.1 single question in the test', () => {
      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.2 duplicate mutiple questions in the test', () => {
      requestQuizQuestionCreate(token, quizId, questionBody);
      requestQuizQuestionDuplicate(token, quizId, questionId);
    });

    test('test1.3 mutiple duplicates of a question', () => {
      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.3 duplicates of duplicate', () => {
      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);

      // newQuestionId = result.newQuestionId as ResNewQuestionId;
      result = requestQuizQuestionDuplicate(token, quizId, result.newQuestionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);

      // newQuestionId = result.newQuestionId as ResNewQuestionId;
      result = requestQuizQuestionDuplicate(token, quizId, result.newQuestionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test2.0 invalid returns', () => {
    let result: ResError;
    describe('test2.1 invalid Token', () => {
      test('test2.1.1 token is empty', () => {
        result = requestQuizQuestionDuplicate('', quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.2 token with incorrect type', () => {
        result = requestQuizQuestionDuplicate('invalid', quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.3 token does not exist', () => {
        const invalidToken = String(parseInt(token) - 1);
        result = requestQuizQuestionDuplicate(invalidToken, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.4 token have not exist', () => {
        const invalidToken = String(parseInt(token) + 1);
        result = requestQuizQuestionDuplicate(invalidToken, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.5 token invalid, user log out', () => {
        requestAuthLogout(token);
        result = requestQuizQuestionDuplicate(token, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test2.2 invalid quizId', () => {
      test('test2.2.1 invalid quizId, quiz is not exist', () => {
        result = requestQuizQuestionDuplicate(token, quizId + 1, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.2 invalid quizId, user does not own the quiz', () => {
        const token2 = requestAuthRegister('email2@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = requestQuizQuestionDuplicate(token2, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);

        const quizId2 = requestQuizCreate(token2, 'quiz2', 'coming soon...').quizId;
        result = requestQuizQuestionDuplicate(token, quizId2, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.3 invalid quizId, user does not own the quiz', () => {
        requestQuizRemove(token, quizId);
        result = requestQuizQuestionDuplicate(token, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });

    describe('test2.3 invalid questionId', () => {
      test('test2.3.1 questionId does not exist', () => {
        result = requestQuizQuestionDuplicate(token, quizId, questionId - 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestQuizQuestionDuplicate(token, quizId, questionId + 1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.2 questionId is not positive', () => {
        result = requestQuizQuestionDuplicate(token, quizId, 0);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestQuizQuestionDuplicate(token, quizId, -1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test.skip('test2.3.3 question is removed', () => {
        // requestQuizQuestionRemove(token, quizId, questionId);
        result = requestQuizQuestionDuplicate(token, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });
  });

  describe('test3.0 mutilple invalid returns', () => {
    const invalidToken = 'invalid';
    const invalidQuizId = quizId + 1;
    const invalidQuestionId = questionId + 1;
    test('test3.1.1 invalid token and invalid quizId', () => {
      result = requestQuizQuestionDuplicate(invalidToken, invalidQuizId, questionId);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.1.2 invalid token and invalid questionId', () => {
      result = requestQuizQuestionDuplicate(invalidToken, quizId, invalidQuestionId);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.1.3 invalid quizId and invalid questionId', () => {
      result = requestQuizQuestionDuplicate(invalidToken, invalidQuizId, invalidQuestionId);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.2.1 invalid token, quizId, and questionId', () => {
      result = requestQuizQuestionDuplicate(invalidToken, invalidQuizId, invalidQuestionId);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });
});
