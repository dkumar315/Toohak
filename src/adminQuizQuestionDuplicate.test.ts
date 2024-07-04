import {
  requestAuthRegister, requestAuthLogout,
  requestQuizCreate, requestQuizInfo, requestQuizRemove,
  requestQuizQuestionCreate, requestQuizQuestionUpdate,
  requestQuizQuestionDuplicate, requestClear,
  ERROR, ResError, VALID_EMPTY_RETURN
} from './functionRequest';

import {
  OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, Answer, Quiz, Colours, Question
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
  questionId = requestQuizQuestionCreate(token, quizId, questionBody).questionId;
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

    test('test1.4 duplicates of duplicate', () => {
      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, result.newQuestionId);
      expect(result).toMatchObject(expectValidReturn);
      expect(result.status).toStrictEqual(OK);

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

      test('test2.3.4 questionId in other quiz', () => {
        const quizName: string = 'every girl is a princess';
        const quizDescription: string = 'what about every boy';
        const quizId2: number = requestQuizCreate(token, quizName, quizDescription).quizId;
        const questionBody2: QuestionBody = {
          question: 'I want the fancier crown',
          duration: 10,
          points: 10,
          answers: [
            {
              answer: 'boys as well',
              correct: true
            },
            {
              answer: 'always do your best',
              correct: true
            }
          ]
        }
        const questionId2: number = requestQuizQuestionCreate(token, quizId2, questionBody2).questionId;
        result = requestQuizQuestionDuplicate(token, quizId, questionId2);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        // result = requestQuizQuestionDuplicate(token, quizId2, questionId);
        // expect(result).toMatchObject(ERROR);
        // expect(result.status).toStrictEqual(BAD_REQUEST);
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
      result = requestQuizQuestionDuplicate(token, invalidQuizId, invalidQuestionId);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.2.1 invalid token, quizId, and questionId', () => {
      result = requestQuizQuestionDuplicate(invalidToken, invalidQuizId, invalidQuestionId);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });

  describe('test4.0 duplication specifics', () => {
    let originalQuestionId: number;
    let duplicatedQuestionId: number;

    beforeEach(() => {
      const quizInfo: Quiz = requestQuizInfo(token, quizId);
      originalQuestionId = quizInfo.questions[0].questionId;
      const result = requestQuizQuestionDuplicate(token, quizId, originalQuestionId);
      duplicatedQuestionId = result.newQuestionId;
    });

    test('test4.1 duplicated question is placed immediately after the source question', () => {
      const quizInfo: Quiz = requestQuizInfo(token, quizId);
      const questionIds: number[] = quizInfo.questions.map((q: Question) => q.questionId);
      const originalIndex = questionIds.indexOf(originalQuestionId);
      const duplicatedIndex = questionIds.indexOf(duplicatedQuestionId);
      expect(duplicatedIndex).toBe(originalIndex + 1);
    });

    test('test4.2 timeLastEdited is updated after duplication', () => {
      const quizInfoBefore: Quiz = requestQuizInfo(token, quizId);
      const timeLastEditedBefore: number = quizInfoBefore.timeLastEdited;

      return new Promise(resolve => setTimeout(resolve, 1000))
        .then(() => {
          requestQuizQuestionDuplicate(token, quizId, originalQuestionId);
          const quizInfoAfter = requestQuizInfo(token, quizId);
          expect(quizInfoAfter.timeLastEdited).toBeGreaterThan(timeLastEditedBefore);
        });
    });

    test('test4.3 duplicated question has the same content as the original', () => {
      const quizInfo: Quiz = requestQuizInfo(token, quizId);
      const originalQuestion: Question = quizInfo.questions[0];
      const duplicatedQuestion = quizInfo.questions[1];

      expect(duplicatedQuestion.questionId).toBeGreaterThan(originalQuestion.questionId);
      expect(duplicatedQuestion.question).toStrictEqual(originalQuestion.question);
      expect(duplicatedQuestion.duration).toStrictEqual(originalQuestion.duration);
      expect(duplicatedQuestion.points).toStrictEqual(originalQuestion.points);
      expect(duplicatedQuestion.answers).toStrictEqual(originalQuestion.answers);
    });

    test('test4.3.2 duplicated question has the same content as the original', () => {
      requestQuizQuestionCreate(token, quizId, questionBody);
      const quizInfo1: Quiz = requestQuizInfo(token, quizId);
      requestClear();

      requestQuizQuestionCreate(token, quizId, questionBody);
      requestQuizQuestionDuplicate(token, quizId, originalQuestionId);
    });

    test('test4.4 duplicated question has a new unique questionId', () => {
      const quizInfo = requestQuizInfo(token, quizId);
      const questionIds = quizInfo.questions.map((q: Question) => q.questionId);
      expect(questionIds.filter((id: number) => id === duplicatedQuestionId).length).toStrictEqual(1);
      expect(duplicatedQuestionId).not.toStrictEqual(originalQuestionId);
    });

    test('test4.5 quiz numQuestions is incremented after duplication', () => {
      const quizInfoBefore = requestQuizInfo(token, quizId);
      const numQuestionsBefore = quizInfoBefore.numQuestions;
      
      requestQuizQuestionDuplicate(token, quizId, originalQuestionId);
      
      const quizInfoAfter = requestQuizInfo(token, quizId);
      expect(quizInfoAfter.numQuestions).toBe(numQuestionsBefore + 1);
    });

    test('test4.6 quiz duration is updated after duplication', () => {
      const quizInfoBefore = requestQuizInfo(token, quizId);
      const durationBefore = quizInfoBefore.duration;
      const questionDuration = quizInfoBefore.questions[0].duration;
      
      requestQuizQuestionDuplicate(token, quizId, originalQuestionId);

      const quizInfoAfter = requestQuizInfo(token, quizId);
      expect(quizInfoAfter.duration).toBe(durationBefore + questionDuration);
    });

    test('test4.6 sum of quiz duration is passed 3 minutes', () => {
      // undefined behaviour?
    });
  });
});
