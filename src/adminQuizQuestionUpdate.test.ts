// request functions
import {
  authRegister, requestAuthLogout,
  quizCreate, validQuizInfo, requestQuizRemove,
  questionCreate, requestQuizQuestionUpdate,
  requestClear, ResQuizInfo, ResEmpty,
  ERROR, ResError, VALID_EMPTY_RETURN
} from './functionRequest';
import {
  OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, Answer, Colours, Colour
} from './dataStore';
import {
  QuestionBody, AnswerInput, MAX_DURATIONS_SECS,
  QuestionLimit, AnswersLimit, DurationLimit, PointsLimit
} from './quizQuestion';

const initQuestionBody: QuestionBody = {
  question: 'who\'s the fairest of them all?',
  duration: 10,
  points: 8,
  answers: [],
};

const trueAnswer1: AnswerInput = {
  answer: 'Victoria',
  correct: true
};

const trueAnswer2: AnswerInput = {
  answer: 'Snow White',
  correct: true
};

const trueAnswer3: AnswerInput = {
  answer: 'the Wicked Queen',
  correct: true
};

const falseAnswer1: AnswerInput = {
  answer: 'mirror',
  correct: false
};

const falseAnswer2: AnswerInput = {
  answer: 'Poisoned Apple',
  correct: false
};

const falseAnswer3: AnswerInput = {
  answer: 'Prince Florian',
  correct: false
};

let token: string, quizId: number, questionId: number, questionBody: QuestionBody;
let result: ResEmpty | ResError;
beforeEach(() => {
  requestClear();
  token = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  quizId = quizCreate(token, 'Mirror Mirror on the wall', 'I love disney cartons').quizId;
  questionBody = JSON.parse(JSON.stringify(initQuestionBody));
  const answers = [trueAnswer1, falseAnswer1];
  questionBody = { ...initQuestionBody, answers };
  questionId = questionCreate(token, quizId, questionBody).questionId;
});
afterAll(() => requestClear());

describe('testing adminQuizQuestionUpdate' +
  '(PUT /v1/admin/quiz/{quizid}/question)/{questionid}', () => {
  describe('test1.0 valid returns' +
    '(implies valid token, quizId and questionId)', () => {
    describe('test1.1 general valid cases, mutiple types of answers', () => {
      test('test1.1.1 test with 1 correct answer, 3 answers in total', () => {
        questionBody.answers = [trueAnswer1, falseAnswer1, falseAnswer2];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.1.2 test with 2 correct answer, 3 answers in total', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2, falseAnswer1];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.1.3 test with 3 correct answer, 3 answers in total', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.2 question string - len and specail characters', () => {
      test('test1.2.1 question string have 5 characters in length', () => {
        questionBody.question = 'q'.repeat(QuestionLimit.MinLen);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.2.2 question string have special characters', () => {
        questionBody.question = '~!@#$%^&*()_+ {}|:"<>?';
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.2.3 question string have 50 characters in length', () => {
        questionBody.question = 'q'.repeat(QuestionLimit.MaxLen);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.3 answers - different number and correctness', () => {
      test('test1.3.1 question have 2 all true answers', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.3.2 question have 2, 1 true answers', () => {
        questionBody.answers = [trueAnswer1, falseAnswer1];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.3.3 question have 6 answers', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3,
          falseAnswer1, falseAnswer2, falseAnswer3];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.4 duration - of single and mutiple questions', () => {
      test('test1.4.1 quiz with only one question has 3 minutes duration', () => {
        questionBody.duration = MAX_DURATIONS_SECS;
        questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.2 update quiz with 3 minutes and sum is 3 minutes duration in total', () => {
        questionBody.duration = Math.floor(MAX_DURATIONS_SECS / 2); // 90
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);

        const questionId2: number = questionCreate(token, quizId, questionBody).questionId;
        result = requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.5 points - different number awarded', () => {
      test('test1.5.1 point awarded for the question is 1', () => {
        questionBody.points = PointsLimit.MinNum;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.5.2 points awarded for the question are 10', () => {
        questionBody.points = PointsLimit.MaxNum;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.6 answer - different len, all correct', () => {
      test('test1.6.1 the length of any answer is 1 character long', () => {
        const ShortAnswer: AnswerInput = {
          answer: ' ',
          correct: false
        };
        questionBody.answers = [trueAnswer1, ShortAnswer];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.6.2 the length of any answer is 30 characters long', () => {
        const answer = 'iseveryone'.repeat(3);
        const LongAnswer: AnswerInput = {
          answer: answer,
          correct: true
        };
        questionBody.answers = [LongAnswer, falseAnswer1];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.7 special cases, duplicate questions and update is same', () => {
      test('test1.7.1 questions have a same answer', () => {
        questionBody.answers = [trueAnswer1, falseAnswer1];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);

        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.7.2 update questions same as original', () => {
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });
  });

  describe('test2.0 invalid returns', () => {
    describe('test2.1 invalid Token', () => {
      test('test2.1.1 invalid Token, token is empty', () => {
        result = requestQuizQuestionUpdate('', quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.2 token with incorrect type', () => {
        result = requestQuizQuestionUpdate('invalid', quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.3 token does not exist', () => {
        const invalidToken = String(parseInt(token) - 1);
        result = requestQuizQuestionUpdate(invalidToken, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.4 token have not exist', () => {
        const invalidToken = String(parseInt(token) + 1);
        result = requestQuizQuestionUpdate(invalidToken, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.5 token invalid, user log out', () => {
        requestAuthLogout(token);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test2.2 invalid quizId', () => {
      test('test2.2.1 invalid quizId, quiz is not exist', () => {
        result = requestQuizQuestionUpdate(token, quizId + 1, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.2 invalid quizId, user does not own the quiz', () => {
        const token2 = authRegister('email2@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = requestQuizQuestionUpdate(token2, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);

        const quizId2 = quizCreate(token2, 'quiz2', 'coming soon...').quizId;
        result = requestQuizQuestionUpdate(token, quizId2, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.3 invalid quizId, user does not own the quiz', () => {
        requestQuizRemove(token, quizId);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.4 quizId is null', () => {
        result = requestQuizQuestionUpdate(token, null, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });

    describe('test2.3 invalid questionId', () => {
      test('test2.3.1 questionId does not exist', () => {
        result = requestQuizQuestionUpdate(token, quizId, questionId - 1, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestQuizQuestionUpdate(token, quizId, questionId + 1, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.2 questionId is not positive', () => {
        result = requestQuizQuestionUpdate(token, quizId, 0, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestQuizQuestionUpdate(token, quizId, -1, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test.skip('test2.3.3 question is removed', () => {
        // requestQuizQuestionRemove(token, quizId, questionId);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.4 questionId is null', () => {
        result = requestQuizQuestionUpdate(token, quizId, null, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.4 invalid question string', () => {
      test('test2.3.4 questionId is null', () => {
        result = requestQuizQuestionUpdate(token, quizId, questionId, null);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.1 string is less than 5 characters in length', () => {
        questionBody.question = '';
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.2 string is 4 characters in length', () => {
        questionBody.question = 'q'.repeat(QuestionLimit.MinLen - 1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.3 string is greater than 50 characters in length', () => {
        questionBody.question = 'q'.repeat(QuestionLimit.MaxLen + 1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.5 invalid answers length', () => {
      test('test2.5.1 question does not have answer', () => {
        questionBody.answers = [];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
      });

      test('test2.5.2 uestion have only 1 true answer', () => {
        questionBody.answers.push(trueAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.5.3 question have only 1 false answer', () => {
        questionBody.answers.push(falseAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.5.4 invalid answers, question have only 7 answers', () => {
        const extraAnswer: AnswerInput = {
          answer: 'N/A',
          correct: false,
        };
        questionBody.answers.push(trueAnswer1, trueAnswer2, trueAnswer3,
          falseAnswer1, falseAnswer2, falseAnswer3, extraAnswer);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.6 invalid question durations', () => {
      test('test2.6.1 question durations is 0', () => {
        questionBody.duration = DurationLimit.MinQuestionSecs - 1;
        questionBody.answers.push(trueAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.6.2 question durations is negative', () => {
        questionBody.duration = -1;
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.7 invalid durations length', () => {
      test('test2.7.1 question pass duration', () => {
        questionBody.duration = MAX_DURATIONS_SECS + 1;
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.2 question1 reach max duration', () => {
        const initDuration: number = questionBody.duration;
        questionBody.duration = MAX_DURATIONS_SECS - initDuration;
        questionCreate(token, quizId, questionBody);

        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.8 invalid points awarded', () => {
      test('test2.8.1 points awarded is negative value', () => {
        questionBody.points = -1;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.8.2 points awarded is 0', () => {
        questionBody.points = 0;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.8.3 points awarded is more than 10', () => {
        questionBody.points = PointsLimit.MaxNum + 1;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.9 invalid questionBody.answers', () => {
      describe('test2.9.1 invalid length of answer string', () => {
        const tooShortAnswer: AnswerInput = {
          answer: '',
          correct: false,
        };
        const tooLongAnswer: AnswerInput = {
          answer: 'ans'.repeat(AnswersLimit.MaxStrLen),
          correct: false,
        };

        test('answer is empty', () => {
          questionBody.answers.push(tooShortAnswer);
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });

        test('answer is over long', () => {
          questionBody.answers.unshift(tooShortAnswer);
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });

        test('answers are too short or too long', () => {
          questionBody.answers.unshift(tooShortAnswer, trueAnswer1);
          questionBody.answers.push(tooLongAnswer, trueAnswer2);
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });

        test('answers are all too short or too long', () => {
          questionBody.answers = [tooShortAnswer, tooLongAnswer];
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });
      });

      describe('test2.9.2 invalid length of answer string', () => {
        test('1 answers are duplicate', () => {
          questionBody.answers.push(trueAnswer1);
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });

        test('mutiple answers are duplicate', () => {
          questionBody.answers.push(trueAnswer1, trueAnswer2, falseAnswer1);
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });

        test('all answers are duplicate', () => {
          questionBody.answers.push(trueAnswer1, falseAnswer1);
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });

        test('all answers are duplicate', () => {
          questionBody.answers = [trueAnswer1, trueAnswer1, trueAnswer1];
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });
      });

      describe('test2.9.3 answers does no contain correct answer', () => {
        test('all false answers', () => {
          questionBody.answers = [falseAnswer1, falseAnswer2, falseAnswer3];
          result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });
      });
    });
  });

  describe('test3.0 mutilple invalid returns', () => {
    const invalidToken: string = 'invalidToken';
    const invalidQuizId: number = quizId + 1;
    const invalidQuestionId: number = questionId + 1;
    test('test3.1.1 invalid token and invalid quizId', () => {
      result = requestQuizQuestionUpdate(invalidToken, invalidQuizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.1.2 invalid token and invalid questionId', () => {
      result = requestQuizQuestionUpdate(invalidToken, quizId, invalidQuestionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.1.3 invalid token and invalid question string', () => {
      questionBody.question = 'qs';
      result = requestQuizQuestionUpdate(invalidToken, quizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.2.1 invalid quizId, questionId', () => {
      result = requestQuizQuestionUpdate(token, quizId + 1, questionId + 1, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.2.2 invalid quizId, questionId, and answers', () => {
      questionBody.answers = [trueAnswer1];
      result = requestQuizQuestionUpdate(token, invalidQuizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.3.0 invalid question string and duration', () => {
      questionBody.question = 'qs';
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.4.0 invalid questionId, question string and duration', () => {
      questionBody.question = 'qs';
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      result = requestQuizQuestionUpdate(token, quizId, questionId + 1, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.5.0 multiple invalid question properties', () => {
      questionBody.question = 'q'.repeat(QuestionLimit.MinLen + 1);
      questionBody.duration = DurationLimit.MinQuestionSecs - 1;
      questionBody.points = PointsLimit.MaxNum + 1;
      questionBody.answers = [
        { answer: '', correct: false },
        { answer: 'a'.repeat(AnswersLimit.MaxStrLen + 1), correct: false },
        { answer: 'validAnsStr', correct: false }];
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.6.0 invalid token, quizId, questionId and question properties', () => {
      questionBody.question = 'a'.repeat(QuestionLimit.MaxLen + 1);
      questionBody.duration = -1 * DurationLimit.MinQuestionSecs;
      questionBody.points = PointsLimit.MinNum - 1;
      result = requestQuizQuestionUpdate(invalidToken, invalidQuizId, invalidQuestionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.7.0 invalid quizId and questionId, and duplicate answers', () => {
      questionBody.answers = [trueAnswer1, trueAnswer1, falseAnswer1, falseAnswer1];
      result = requestQuizQuestionUpdate(token, invalidQuizId, invalidQuestionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.8.1 invalid duration and answer count', () => {
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      questionBody.answers = [trueAnswer1];
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.8.2 invalid questionId, duration and answer count', () => {
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      questionBody.answers = [trueAnswer1];
      result = requestQuizQuestionUpdate(token, quizId, questionId + 1, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.9.1 invalid token and questionId, and too many answers', () => {
      questionBody.answers = [
        trueAnswer1, trueAnswer2, trueAnswer3,
        falseAnswer1, falseAnswer2, falseAnswer3,
        { answer: 'extra answer', correct: false }
      ];
      result = requestQuizQuestionUpdate(invalidToken, quizId, questionId + 1, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.9.2 valid token, quiz owned by another user, and invalid points', () => {
      const token2: string = authRegister('another@email.com', 'password123', 'Another', 'User').token;
      const quizId2: number = quizCreate(token2, 'Another Quiz', 'Description').quizId;
      questionBody.points = -5;
      result = requestQuizQuestionUpdate(token, quizId2, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });
  });

  describe('test4.0 test with quizInfo', () => {
    beforeEach(() => {
      requestClear();
      token = authRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
      quizId = quizCreate(token, 'Mirror Mirror on the wall', 'I love disney cartons').quizId;
      questionBody = JSON.parse(JSON.stringify(initQuestionBody));
      questionBody.answers = [trueAnswer1, falseAnswer1];
      questionId = questionCreate(token, quizId, questionBody).questionId;
      questionBody.answers = [trueAnswer2, falseAnswer2];
    });

    // time changes is too small and one way is change function to
    // timeStamp = (): number => Date.now() to have milliseconds pr
    // toBeGreaterThanOrEqual is not representing changes
    test('test4.1.1 quiz info updates after updating question', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);

      const updatedQuizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(1);
      expect(updatedQuizInfo.questions.length).toStrictEqual(1);
      expect(updatedQuizInfo.questions[0].question).toStrictEqual(questionBody.question);
      expect(updatedQuizInfo.questions[0].duration).toStrictEqual(questionBody.duration);
      expect(updatedQuizInfo.questions[0].points).toStrictEqual(questionBody.points);
      expect(updatedQuizInfo.questions[0].answers.length).toStrictEqual(questionBody.answers.length);
      expect(updatedQuizInfo.duration).toStrictEqual(questionBody.duration);
      expect(updatedQuizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizInfo.timeLastEdited);
    });

    test('test4.1.2 quiz info updates after updating multiple questions', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      questionBody.answers = [trueAnswer1, trueAnswer2, falseAnswer2, falseAnswer3];
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      questionBody.answers = [trueAnswer3, falseAnswer3];
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(1);
      expect(updatedQuizInfo.questions.length).toStrictEqual(1);
      expect(updatedQuizInfo.questions[0].answers.length).toStrictEqual(2);
      expect(updatedQuizInfo.duration).toStrictEqual(questionBody.duration);
      expect(updatedQuizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizInfo.timeLastEdited);
    });

    test('test4.2.1 quiz info reflects correct questionId', () => {
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      const questionId2 = questionCreate(token, quizId, questionBody).questionId;
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);

      const updatedQuizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo.questions[0].questionId).toStrictEqual(questionId);
      expect(updatedQuizInfo.questions[1].questionId).toStrictEqual(questionId2);
      expect(questionId + 1).toStrictEqual(questionId2);
    });

    test('test4.2.2 quiz info shows correct answer details', () => {
      // add new answer
      const answers: AnswerInput[] = questionBody.answers;
      answers.push(trueAnswer3); // expect 3 answers
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      const questionInfo = updatedQuizInfo.questions[0];
      expect(questionInfo).toHaveProperty('questionId');
      expect(questionInfo.answers.length).toStrictEqual(answers.length);

      questionInfo.answers.forEach((answer: Answer, index: number) => {
        expect(answer.answer).toStrictEqual(answers[index].answer);
        expect(answer.correct).toStrictEqual(answers[index].correct);
        expect(answer.answerId).toStrictEqual(expect.any(Number));
        expect(answer).toHaveProperty('colour');
        expect(Object.values(Colours)).toContain(answer.colour);
      });

      // remove an answer
      questionBody.answers.pop(); // expect 2 answers
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      const updatedQuizInfo2: ResQuizInfo = validQuizInfo(token, quizId);
      const questionInfo2 = updatedQuizInfo2.questions[0];
      expect(questionInfo2).toHaveProperty('questionId');
      expect(questionInfo2.answers.length).toStrictEqual(answers.length);

      questionInfo2.answers.forEach((answer: Answer, index: number) => {
        expect(answer.answer).toStrictEqual(answers[index].answer);
        expect(answer.correct).toStrictEqual(answers[index].correct);
        expect(answer.answerId).toStrictEqual(expect.any(Number));
        expect(answer).toHaveProperty('colour');
        expect(Object.values(Colours)).toContain(answer.colour);
      });
    });

    test('test4.2.3 quiz info shows correct answer details', () => {
      // an answer changed
      questionBody.answers = [trueAnswer2, falseAnswer1];
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      const questionInfo = updatedQuizInfo.questions[0];
      expect(questionInfo).toHaveProperty('questionId');
      expect(questionInfo.answers.length).toStrictEqual(questionBody.answers.length);

      questionInfo.answers.forEach((answer: Answer, index: number) => {
        expect(answer.answer).toStrictEqual(questionBody.answers[index].answer);
        expect(answer.correct).toStrictEqual(questionBody.answers[index].correct);
        expect(answer.answerId).toStrictEqual(expect.any(Number));
        expect(answer).toHaveProperty('colour');
        expect(Object.values(Colours)).toContain(answer.colour);
      });
    });

    test('test4.3.1 quiz info preserves original quiz details', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo.quizId).toStrictEqual(quizInfo.quizId);
      expect(updatedQuizInfo.name).toStrictEqual(quizInfo.name);
      expect(updatedQuizInfo.description).toStrictEqual(quizInfo.description);
      expect(updatedQuizInfo.timeCreated).toStrictEqual(quizInfo.timeCreated);
    });

    test('test4.3.2 quiz info shows correct total duration', () => {
      const initQuizinfo: ResQuizInfo = validQuizInfo(token, quizId);
      const initDuration: number = initQuizinfo.duration;
      const questionId2: number = questionCreate(token, quizId, questionBody).questionId;

      questionBody.duration = 7;
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);
      let updateDuration = initDuration + questionBody.duration;
      expect(validQuizInfo(token, quizId).duration).toStrictEqual(updateDuration);

      questionBody.duration = 8;
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);
      updateDuration = initDuration + questionBody.duration;
      expect(validQuizInfo(token, quizId).duration).toStrictEqual(updateDuration);

      questionBody.duration = 9;
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);
      updateDuration = initDuration + questionBody.duration;
      expect(validQuizInfo(token, quizId).duration).toStrictEqual(updateDuration);

      questionBody.duration = MAX_DURATIONS_SECS - initDuration;
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);
      updateDuration = initDuration + questionBody.duration;
      expect(validQuizInfo(token, quizId).duration).toStrictEqual(updateDuration);
    });

    test('test4.3.3 quiz info update when reaching maximum duration', () => {
      questionBody.duration = MAX_DURATIONS_SECS;
      questionBody.answers.push(trueAnswer1);
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(1);
      expect(updatedQuizInfo.duration).toStrictEqual(MAX_DURATIONS_SECS);
    });

    test('test4.4.0 mutiple info updated correctly', () => {
      questionBody.question = 'I am the fairest of them all!';
      questionBody.points = PointsLimit.MinNum;
      questionBody.answers.push(trueAnswer1);
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(1);
      expect(updatedQuizInfo.duration).toStrictEqual(questionBody.duration);

      const updatedQuestion = updatedQuizInfo.questions[0];
      expect(updatedQuestion.questionId).toStrictEqual(questionId);
      expect(updatedQuestion.question).toStrictEqual(questionBody.question);
      expect(updatedQuestion.duration).toStrictEqual(questionBody.duration);
      expect(updatedQuestion.points).toStrictEqual(PointsLimit.MinNum);
    });

    test('test4.4.3 colors are randomly regenerated', () => {
      const initQuizInfo = validQuizInfo(token, quizId);
      const initialColors: Colour[] = initQuizInfo.questions[0].answers.map((ans: Answer) => ans.colour);

      questionBody.answers.push(trueAnswer3, falseAnswer3);
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      const updatedQuizInfo = validQuizInfo(token, quizId);
      // cannot check if colors have changed,
      // for a same questionBody of create and update
      // as there's a minimum (1/COLOURS.length)^MAX_ANSWERS_LEN fail the test
      const updatedColors: Colour[] = updatedQuizInfo.questions[0].answers.map((ans: Answer) => ans.colour);
      expect(updatedColors).not.toEqual(initialColors);

      // Ensure all colors are valid
      updatedColors.forEach(color => expect(Object.values(Colours)).toContain(color));
    });

    test('test4.4.4 quiz info shows correct order of added questions', () => {
      // question 1
      questionBody.question = 'First question';
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      // question 2
      questionBody.question = 'Second question';
      const questionId2 = questionCreate(token, quizId, questionBody).questionId;

      // question 3
      questionBody.question = 'Third question';
      questionCreate(token, quizId, questionBody);

      // Update question 2
      questionBody.question = 'Update Second question';
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);

      const updatedQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo.questions[0].question).toStrictEqual('First question');
      expect(updatedQuizInfo.questions[1].question).toStrictEqual('Update Second question');
      expect(updatedQuizInfo.questions[2].question).toStrictEqual('Third question');
    });

    test('test4.4.5 quiz info reflects changes in timeLastEdited for each question addition', () => {
      const quizInfo: ResQuizInfo = validQuizInfo(token, quizId);
      const initialTime = quizInfo.timeLastEdited;

      // question 1
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      const infoAfterQuestion1 = validQuizInfo(token, quizId);
      expect(infoAfterQuestion1.timeLastEdited).toBeGreaterThanOrEqual(initialTime);

      // question 2
      questionBody.question = 'new question';
      const questionId2 = questionCreate(token, quizId, questionBody).questionId;
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);
      const infoAfterQuestion2 = validQuizInfo(token, quizId);
      expect(infoAfterQuestion2.timeLastEdited).toBeGreaterThanOrEqual(infoAfterQuestion1.timeLastEdited);
    });

    test('test4.5.0 quiz info should not update with invalid input', () => {
      const initialQuizInfo = validQuizInfo(token, quizId);
      const invalidQuestionBody = {
        question: 'q',
        duration: -1,
        points: 0,
        answers: [trueAnswer1]
      };

      const result = requestQuizQuestionUpdate(token, quizId, questionId, invalidQuestionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);

      // Check that quiz info hasn't changed
      const updatedQuizInfo = validQuizInfo(token, quizId);
      expect(updatedQuizInfo).toEqual(initialQuizInfo);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(initialQuizInfo.numQuestions);
      expect(updatedQuizInfo.questions).toStrictEqual(initialQuizInfo.questions);
      expect(updatedQuizInfo.duration).toStrictEqual(initialQuizInfo.duration);
      expect(updatedQuizInfo.timeLastEdited).toStrictEqual(initialQuizInfo.timeLastEdited);
    });
  });
});
