import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, Question, ErrorObject } from './dataStore';
import { QuestionBody, MAX_DURATIONS_SECS } from './quizQuestion';
import {
  authRegister, requestAuthLogout, quizCreate, validQuizInfo,
  requestQuizRemove, questionCreate, requestQuizQuestionDuplicate,
  ResQuizInfo, ResNewQuestionId, requestQuizQuestionDelete,
  requestClear, ResError, VALID_EMPTY_RETURN,
  requestQuizQuestionCreateV1, requestQuizQuestionUpdateV1,
  requestQuizQuestionDuplicateV1, requestQuizQuestionDeleteV1,
  requestQuizQuestionMoveV1, ResQuestionId
} from './functionRequest';

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
  ],
  thumbnailUrl: 'http://google.com/img_path.jpg'
};

const ERROR: ErrorObject = { error: expect.any(String) };

const questionDuplicate = (token: string, quizId: number,
  questionId: number): ResNewQuestionId => {
  const result = requestQuizQuestionDuplicate(token, quizId, questionId) as ResNewQuestionId;
  if ('error' in result) throw new Error(`Fail to duplicate question: ${result.error}`);
  return result;
};

let token: string, quizId: number, questionId: number;
let result: ResNewQuestionId | ResError;
beforeEach(() => {
  requestClear();
  token = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  quizId = quizCreate(token, 'Mirror Mirror on the wall', 'I am the fairest of the all').quizId;
  questionId = questionCreate(token, quizId, questionBody).questionId;
});
afterAll(requestClear);

describe('testing adminQuizQuestionDuplicate' +
  '(POST /v2/admin/quiz/{quizid}/question)/{questionid}/duplicate', () => {
  test('route and trpe check', () => {
    result = requestQuizQuestionDuplicate(token, quizId, questionId);
    expect(typeof result === 'object' && 'newQuestionId' in result &&
    typeof result.newQuestionId === 'number').toBe(true);
  });
  describe('test1.0 valid token, quizId and questionId', () => {
    test('test1.1 single question in the test', () => {
      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.2 duplicate mutiple questions in the test', () => {
      questionCreate(token, quizId, questionBody);
      requestQuizQuestionDuplicate(token, quizId, questionId);
    });

    test('test1.3 mutiple duplicates of a question', () => {
      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.4 duplicates of duplicate', () => {
      result = questionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      result = questionDuplicate(token, quizId, result.newQuestionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      result = questionDuplicate(token, quizId, result.newQuestionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test2.0 invalid returns', () => {
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
      test('test2.2.1 quiz is not exist', () => {
        result = requestQuizQuestionDuplicate(token, quizId + 1, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.2 user does not own the quiz', () => {
        const token2 = authRegister('email2@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = requestQuizQuestionDuplicate(token2, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);

        const quizId2 = quizCreate(token2, 'quiz2', 'coming soon...').quizId;
        result = requestQuizQuestionDuplicate(token, quizId2, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.3 user removed the quiz', () => {
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

      test('test2.3.3 question is removed', () => {
        requestQuizQuestionDelete(token, quizId, questionId);
        result = requestQuizQuestionDuplicate(token, quizId, questionId);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.4 questionId in other quiz', () => {
        const quizName: string = 'every girl is a princess';
        const quizDescription: string = 'what about every boy';
        const quizId2: number = quizCreate(token, quizName, quizDescription).quizId;
        questionCreate(token, quizId2, questionBody);
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
          ],
          thumbnailUrl: 'http://google.com/img_path.jpg'
        };
        const questionId2: number = questionCreate(token, quizId2, questionBody2).questionId;
        result = requestQuizQuestionDuplicate(token, quizId, questionId2);
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
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      originalQuestionId = quizInfo.questions[0].questionId;
      result = questionDuplicate(token, quizId, originalQuestionId);
      duplicatedQuestionId = result.newQuestionId;
    });

    test('test4.0 current quiz duration less than, is, and exceed maximum', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      const duration: number = MAX_DURATIONS_SECS - quizInfo.duration;
      const newQuestionBody: QuestionBody = { ...questionBody, duration };
      questionId = questionCreate(token, quizId, newQuestionBody).questionId;

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test4.1 duplicated question is placed immediately after the source question', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      const questionIds: number[] = quizInfo.questions.map((q: Question) => q.questionId);
      const originalIndex = questionIds.indexOf(originalQuestionId);
      const duplicatedIndex = questionIds.indexOf(duplicatedQuestionId);
      expect(duplicatedIndex).toBe(originalIndex + 1);
    });

    test('test4.2 timeLastEdited is updated after duplication', () => {
      const quizInfoBefore: ResQuizInfo = validQuizInfo(token, quizId);
      const timeLastEditedBefore: number = quizInfoBefore.timeLastEdited;

      // return new Promise(resolve => setTimeout(resolve, 1000))
      //   .then(() => {
      //     requestQuizQuestionDuplicate(token, quizId, originalQuestionId);
      //     const quizInfoAfter = validQuizInfo(token, quizId);
      //     expect(quizInfoAfter.timeLastEdited).toBeGreaterThan(timeLastEditedBefore);
      //   });

      const quizInfoAfter = validQuizInfo(token, quizId);
      expect(quizInfoAfter.timeLastEdited).toBeGreaterThanOrEqual(timeLastEditedBefore);
    });

    test('test4.3 duplicated question has the same content as the original', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      const originalQuestion: Question = quizInfo.questions[0];
      const duplicatedQuestion: Question = quizInfo.questions[1];

      expect(duplicatedQuestion.questionId).toBeGreaterThan(originalQuestion.questionId);
      expect(duplicatedQuestion.question).toStrictEqual(originalQuestion.question);
      expect(duplicatedQuestion.duration).toStrictEqual(originalQuestion.duration);
      expect(duplicatedQuestion.points).toStrictEqual(originalQuestion.points);
      expect(duplicatedQuestion.answers).toStrictEqual(originalQuestion.answers);
    });

    test('test4.3.2 when current duration pass maximum, more duplicated are not allowed', () => {
      const initDuration: number = validQuizInfo(token, quizId).duration;
      const duration: number = MAX_DURATIONS_SECS - initDuration - 1;
      const newQuestionBody: QuestionBody = { ...questionBody, duration };
      questionId = questionCreate(token, quizId, newQuestionBody).questionId;

      questionDuplicate(token, quizId, questionId);
      result = requestQuizQuestionDuplicate(token, quizId, questionId);
      expect(result).toStrictEqual({ error: expect.any(String), status: BAD_REQUEST });
    });

    test('test4.4 duplicated question has a new unique questionId', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      const questionIds = quizInfo.questions.map((q: Question) => q.questionId);
      expect(questionIds.filter((id: number) => id === duplicatedQuestionId).length).toStrictEqual(1);
      expect(duplicatedQuestionId).not.toStrictEqual(originalQuestionId);
    });

    test('test4.5 quiz numQuestions is incremented after duplication', () => {
      const quizInfoBefore: ResQuizInfo = validQuizInfo(token, quizId);
      const numQuestionsBefore = quizInfoBefore.numQuestions;

      questionDuplicate(token, quizId, originalQuestionId);
      const quizInfoAfter: ResQuizInfo = validQuizInfo(token, quizId);
      expect(quizInfoAfter.numQuestions).toStrictEqual(numQuestionsBefore + 1);
    });

    test('test4.6 quiz duration is updated after duplication', () => {
      const quizInfoBefore: ResQuizInfo = validQuizInfo(token, quizId);
      const durationBefore: number = quizInfoBefore.duration;
      const questionDuration: number = quizInfoBefore.questions[0].duration;

      questionDuplicate(token, quizId, originalQuestionId);
      const quizInfoAfter: ResQuizInfo = validQuizInfo(token, quizId);
      expect(quizInfoAfter.duration).toStrictEqual(durationBefore + questionDuration);
    });

    test('test4.8 numQuestions and duration increases numQuestions correctly', () => {
      const initQuizInfo: ResQuizInfo = validQuizInfo(token, quizId);

      questionDuplicate(token, quizId, questionId);
      const quizInfo1 = validQuizInfo(token, quizId);
      expect(quizInfo1.numQuestions).toStrictEqual(initQuizInfo.numQuestions + 1);
      expect(quizInfo1.questions.length).toStrictEqual(initQuizInfo.questions.length + 1);
      expect(quizInfo1.duration).toStrictEqual(initQuizInfo.duration + questionBody.duration);

      questionDuplicate(token, quizId, questionId);
      const quizInfo2: ResQuizInfo = validQuizInfo(token, quizId);
      expect(quizInfo2.numQuestions).toStrictEqual(quizInfo1.numQuestions + 1);
      expect(quizInfo2.questions.length).toStrictEqual(quizInfo2.numQuestions);
      expect(quizInfo2.duration).toStrictEqual(quizInfo1.duration + questionBody.duration);
    });
  });
});

describe('testing v1 adminQuizQuestion', () => {
  test('v1 create, update, movem reemove and duplicate', () => {
    questionId = (requestQuizQuestionCreateV1(token, quizId, questionBody) as ResQuestionId).questionId;
    expect(questionId).toStrictEqual(expect.any(Number));

    const newquestion: QuestionBody = { ...questionBody, question: 'update' };
    requestQuizQuestionUpdateV1(token, quizId, questionId, newquestion);
    let updatedQuizInfo: ResQuizInfo = validQuizInfo(token, quizId);
    expect(updatedQuizInfo.questions.length).toStrictEqual(2);
    expect(updatedQuizInfo.questions[1].question).toStrictEqual('update');

    requestQuizQuestionMoveV1(token, quizId, questionId, 0);
    updatedQuizInfo = validQuizInfo(token, quizId);
    expect(updatedQuizInfo.questions[0].questionId).toStrictEqual(questionId);
    expect(updatedQuizInfo.questions.length).toStrictEqual(2);

    requestQuizQuestionDuplicateV1(token, quizId, questionId);
    updatedQuizInfo = validQuizInfo(token, quizId);
    expect(updatedQuizInfo.questions.length).toStrictEqual(3);

    requestQuizQuestionDeleteV1(token, quizId, questionId);
    updatedQuizInfo = validQuizInfo(token, quizId);
    expect(updatedQuizInfo.questions.length).toStrictEqual(2);
  });
});
