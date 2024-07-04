// request functions
import {
  requestAuthRegister, requestAuthLogout,
  requestQuizCreate, requestQuizInfo, requestQuizRemove,
  requestQuizQuestionCreate, requestQuizQuestionUpdate,
  requestClear
} from './functionRequest';

// interfaces and constants
import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, Answer, Quiz, COLORS } from './dataStore';
import { ERROR, ResError, VALID_EMPTY_RETURN } from './functionRequest';
import {
  QuestionBody, AnswerInput,
  MIN_QUESTION_LEN, MAX_QUESTION_LEN, MAX_DURATIONS_SECS,
  MIN_POINTS_AWARD, MAX_POINTS_AWARD, MAX_ANSWER_STRING_LEN
} from './quizQuestion';

interface QuestionIdRes {
  status: typeof OK;
  questionId: number;
}

const initQuestionBody: QuestionBody = {
  question: 'who\'s the fairest of them all?',
  duration: 10,
  points: 8,
  answers: [],
};

// // length answer length in [1, 30]
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
let result: QuestionIdRes | ResError;
beforeEach(() => {
  requestClear();
  token = requestAuthRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  quizId = requestQuizCreate(token, 'Mirror Mirror on the wall', 'I love disney cartons').quizId;
  questionBody = JSON.parse(JSON.stringify(initQuestionBody));

  const answers = [trueAnswer1, falseAnswer1];
  questionBody = { ...initQuestionBody, answers };
  questionId = requestQuizQuestionCreate(token, quizId, questionBody).questionId;
});
afterAll(() => requestClear());

describe('testing adminQuizQuestionUpdate' + 
  '(PUT /v1/admin/quiz/{quizid}/question)/{questionid}', () => {
  describe('test1.0 valid returns' + 
    '(implies valid token, quizId and questionId)', () => {
    test('test1.1 test with 1 correct answer, 3 answers in total', () => {
      questionBody.answers = [trueAnswer1, falseAnswer1, falseAnswer2];
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.2 test with 2 correct answer, 3 answers in total', () => {
      questionBody.answers = [trueAnswer1, trueAnswer2, falseAnswer1];
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.3 test with 3 correct answer, 3 answers in total', () => {
      questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3];
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    describe('test1.4 just meet requirements', () => {
      test('test 1.4.1 question string have 5 characters in length', () => {
        questionBody.question = 'q'.repeat(MIN_QUESTION_LEN);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test 1.4.1 question string have special characters', () => {
        questionBody.question = '~!@#$%^&*()_+ {}|:"<>?';
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.2 question string have 50 characters in length', () => {
        questionBody.question = 'q'.repeat(MAX_QUESTION_LEN);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.3 question have 2 all true answers', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.3 question have 2, 1 true answers', () => {
        questionBody.answers = [trueAnswer1, falseAnswer1];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.3 question have 6 answers', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3,
          falseAnswer1, falseAnswer2, falseAnswer3];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.4 quiz with only one question has 3 minutes duration', () => {
        questionBody.duration = MAX_DURATIONS_SECS;
        questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.5 quiz with two quiz with 3 minutes duration in total', () => {
        questionBody.duration = Math.floor(MAX_DURATIONS_SECS / 2);

        // question 1
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);

        // question 2
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.6 point awarded for the question is 1', () => {
        questionBody.points = MIN_POINTS_AWARD;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.7 points awarded for the question are 10', () => {
        questionBody.points = MAX_POINTS_AWARD;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.8 the length of any answer is 1 character long', () => {
        const ShortAnswer: AnswerInput = {
          answer: ' ',
          correct: false
        };
        questionBody.answers = [trueAnswer1, ShortAnswer];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.9 the length of any answer is 30 characters long', () => {
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

    test('test1.5 questions have a same answer', () => {
      questionBody.answers = [trueAnswer1, falseAnswer1];
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.6 update questions same as original', () => {
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
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
        const token2 = requestAuthRegister('email2@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = requestQuizQuestionUpdate(token2, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);

        const quizId2 = requestQuizCreate(token2, 'quiz2', 'coming soon...').quizId;
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
    });

    describe('test2.4 invalid question string', () => {
      test('test2.3.1 string is less than 5 characters in length', () => {
        questionBody.question = '';
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.2 string is 4 characters in length', () => {
        questionBody.question = 'q'.repeat(MIN_QUESTION_LEN - 1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.3 string is greater than 50 characters in length', () => {
        questionBody.question = 'q'.repeat(MAX_QUESTION_LEN + 1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.5 invalid answers length', () => {
      test('test2.4.1 question does not have answer', () => {
        questionBody.answers = [];
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
      });

      test('test2.4.2 uestion have only 1 true answer', () => {
        questionBody.answers.push(trueAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.3 question have only 1 false answer', () => {
        questionBody.answers.push(falseAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.4 invalid answers, question have only 7 answers', () => {
        const extraAnswer = {
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
      test('test2.5.1 question durations is 0', () => {
        questionBody.answers.push(trueAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.5.2 question durations is negative', () => {
        questionBody.duration = MAX_DURATIONS_SECS + 1;
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.7 invalid durations length', () => {
      test('test2.6.1 question pass duration', () => {
        questionBody.duration = MAX_DURATIONS_SECS + 1;
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.6.2 one question has max duration, create new question', () => {
        questionBody.duration = MAX_DURATIONS_SECS;

        // question 1
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        requestQuizQuestionCreate(token, quizId, questionBody);

        // question 2
        questionBody.duration = 1;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.6.3 sum of 2 questions has max duration, create new question', () => {
        questionBody.duration = Math.floor(MAX_DURATIONS_SECS / 2);

        // question 1
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        requestQuizQuestionCreate(token, quizId, questionBody);

        // question 2
        questionBody.answers.push(trueAnswer2, falseAnswer2);
        requestQuizQuestionCreate(token, quizId, questionBody);

        // question 3
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.8 invalid points awarded', () => {
      test('test2.7.1 points awarded is negative value', () => {
        questionBody.points = -1;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.2 points awarded is 0', () => {
        questionBody.points = 0;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.3 points awarded is more than 10', () => {
        questionBody.points = MAX_POINTS_AWARD + 1;
        result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.9 invalid questionBody.answers', () => {
      describe('test2.9.1 invalid length of answer string', () => {
        const tooShortAnswer = {
          answer: '',
          correct: false,
        };
        const tooLongAnswer = {
          answer: 'ans'.repeat(MAX_ANSWER_STRING_LEN),
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
    test('test3.1 invalid token and invalid quizId', () => {
      const invalidToken = 'invalidToken';
      const invalidQuizId = quizId + 1;
      result = requestQuizQuestionUpdate(invalidToken, invalidQuizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.1.2 invalid token and invalid questionId', () => {
      const invalidToken = 'invalidToken';
      const invalidQuestionId = questionId + 1;
      result = requestQuizQuestionUpdate(invalidToken, quizId, invalidQuestionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.2 invalid token and invalid question string', () => {
      const invalidToken = 'invalidToken';
      questionBody.question = 'qs';
      result = requestQuizQuestionUpdate(invalidToken, quizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.3 invalid quizId, questionId, and answers', () => {
      const invalidQuizId = quizId + 1;
      questionBody.answers = [trueAnswer1];
      result = requestQuizQuestionUpdate(token, invalidQuizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.4 invalid question string and duration', () => {
      questionBody.question = 'qs';
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.4.2 invalid questionId, question string and duration', () => {
      questionBody.question = 'qs';
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      result = requestQuizQuestionUpdate(token, quizId, questionId + 1, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.5 multiple invalid question properties', () => {
      questionBody.question = 'q'.repeat(51);
      questionBody.duration = 0;
      questionBody.points = MAX_POINTS_AWARD + 1;
      questionBody.answers = [
        { answer: '', correct: false },
        { answer: 'a'.repeat(MAX_ANSWER_STRING_LEN + 1), correct: false },
        { answer: 'validAnsStr', correct: false }];
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.6 invalid token, quizId, questionId and question properties', () => {
      const invalidToken = 'invalidToken';
      const invalidQuizId = quizId + 1;
      const invalidQuestionId = questionId + 1;
      questionBody.question = 'a'.repeat(51);
      questionBody.duration = -1;
      questionBody.points = 0;
      result = requestQuizQuestionUpdate(invalidToken, invalidQuizId, invalidQuestionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.7 invalid quizId and questionId, and duplicate answers', () => {
      const invalidQuizId = 9999;
      const invalidQuestionId = 9999;
      questionBody.answers = [trueAnswer1, trueAnswer1, falseAnswer1, falseAnswer1];
      result = requestQuizQuestionUpdate(token, invalidQuizId, invalidQuestionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.8 invalid duration and answer count', () => {
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

    test('test3.9 invalid token and questionId, and too many answers', () => {
      const invalidToken = 'invalidToken';
      questionBody.answers = [
        trueAnswer1, trueAnswer2, trueAnswer3,
        falseAnswer1, falseAnswer2, falseAnswer3,
        { answer: 'extra answer', correct: false }
      ];
      result = requestQuizQuestionUpdate(invalidToken, quizId, questionId + 1, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.9 valid token, quiz owned by another user, and invalid points', () => {
      const token2 = requestAuthRegister('another@email.com', 'password123', 'Another', 'User').token;
      const quizId2 = requestQuizCreate(token2, 'Another Quiz', 'Description').quizId;
      questionBody.points = -5;
      result = requestQuizQuestionUpdate(token, quizId2, questionId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });
  });

  describe.skip('test4.0 test with quizInfo', () => {
    beforeEach(() => {
      requestClear();
      token = requestAuthRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
      quizId = requestQuizCreate(token, 'Mirror Mirror on the wall', 'I love disney cartons').quizId;
      questionBody = initQuestionBody;
      questionBody.answers = [trueAnswer1, falseAnswer1];
    });

    // time changes is too small and one way is change function to
    // timeStamp = (): number => Date.now() to have milliseconds pr
    // toBeGreaterThanOrEqual is not representing changes
    test('test4.1.1 quiz info updates after adding one question', () => {
      const quizInfo: Quiz = requestQuizInfo(token, quizId);
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
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
      const quizInfo: Quiz = requestQuizInfo(token, quizId);
      questionBody.answers = [trueAnswer1, trueAnswer2, falseAnswer2, falseAnswer3];
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      questionBody.answers = [trueAnswer3, falseAnswer3];
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(1);
      expect(updatedQuizInfo.questions.length).toStrictEqual(1);
      expect(updatedQuizInfo.questions.answers.length).toStrictEqual(3);
      expect(updatedQuizInfo.duration).toStrictEqual(questionBody.duration);
      expect(updatedQuizInfo.timeLastEdited).toBeGreaterThanOrEqual(quizInfo.timeLastEdited);
    });

    test('test4.2.1 quiz info reflects correct questionId', () => {
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      const questionId2 = requestQuizQuestionCreate(token, quizId, questionBody);
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody).questionId;

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.questions[0].questionId).toStrictEqual(questionId);
      expect(updatedQuizInfo.questions[1].questionId).toStrictEqual(questionId2);
      expect(questionId + 1).toStrictEqual(questionId2);
    });

    test('test4.2.2 quiz info shows correct answer details', () => {
      // add new answer
      const addedAnswers = [trueAnswer1, trueAnswer2, falseAnswer1];
      const updateQuestionBody = { ...questionBody, addedAnswers };
      requestQuizQuestionUpdate(token, quizId, questionId, updateQuestionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      const questionInfo = updatedQuizInfo.questions[0];
      expect(questionInfo).toHaveProperty('questionId');
      expect(questionInfo.answers.length).toStrictEqual(addedAnswers.length);

      questionInfo.answers.forEach((answer: Answer, index: number) => {
        expect(answer.answer).toStrictEqual(addedAnswers[index].answer);
        expect(answer.correct).toStrictEqual(addedAnswers[index].correct);
        expect(answer.answerId).toStrictEqual(expect.any(Number));
        expect(answer).toHaveProperty('colour');
        expect(COLORS).toContain(answer.colour);
      });

      // remove an answer
      const deletedAnswers = [trueAnswer2, falseAnswer1];
      const updateQuestionBody2 = { ...questionBody, deletedAnswers };
      requestQuizQuestionUpdate(token, quizId, questionId, updateQuestionBody2);
      const updatedQuizInfo2 = requestQuizInfo(token, quizId);
      const questionInfo2 = updatedQuizInfo2.questions[0];
      expect(questionInfo2).toHaveProperty('questionId');
      expect(questionInfo2.answers.length).toStrictEqual(deletedAnswers.length);

      questionInfo2.answers.forEach((answer: Answer, index: number) => {
        expect(answer.answer).toStrictEqual(deletedAnswers[index].answer);
        expect(answer.correct).toStrictEqual(deletedAnswers[index].correct);
        expect(answer.answerId).toStrictEqual(expect.any(Number));
        expect(answer).toHaveProperty('colour');
        expect(COLORS).toContain(answer.colour);
      });
    });

    test('test4.2.3 quiz info shows correct answer details', () => {
      // an answer changed
      const updatedAnswers = [trueAnswer2, falseAnswer1];
      const updateQuestionBody = { ...questionBody, updatedAnswers };
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      const questionInfo = updatedQuizInfo.questions[0];
      expect(questionInfo).toHaveProperty('questionId');
      expect(questionInfo.answers.length).toStrictEqual(updatedAnswers.length);

      questionInfo.answers.forEach((answer: Answer, index: number) => {
        expect(answer.answer).toStrictEqual(updatedAnswers[index].answer);
        expect(answer.correct).toStrictEqual(updatedAnswers[index].correct);
        expect(answer.answerId).toStrictEqual(expect.any(Number));
        expect(answer).toHaveProperty('colour');
        expect(COLORS).toContain(answer.colour);
      });
    });

    test('test4.3.1 quiz info preserves original quiz details', () => {
      const quizInfo: Quiz = requestQuizInfo(token, quizId);
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.quizId).toStrictEqual(quizInfo.quizId);
      expect(updatedQuizInfo.name).toStrictEqual(quizInfo.name);
      expect(updatedQuizInfo.description).toStrictEqual(quizInfo.description);
      expect(updatedQuizInfo.timeCreated).toStrictEqual(quizInfo.timeCreated);
    });

    test('test4.3.2 quiz info shows correct total duration', () => {
      const initQuizinfo = requestQuizInfo(token, quizId);
      const initDuration = initQuizinfo.duration;
      let updateDuration = initDuration;

      questionBody.duration = 7;
      updateDuration += questionBody.duration;
      expect(requestQuizInfo(token, quizId).duration).toStrictEqual(updateDuration);

      questionBody.duration = 8;
      updateDuration += questionBody.duration;
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(requestQuizInfo(token, quizId).duration).toStrictEqual(updateDuration);

      questionBody.duration = 9;
      updateDuration += questionBody.duration;
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(requestQuizInfo(token, quizId).duration).toStrictEqual(updateDuration);
    });

    test('test4.3.3 colors are randomly regenerated', () => {
      const initQuizInfo = requestQuizInfo(token, quizId);
      const initialColors: string[] = initQuizInfo.questions[0].answers.map((ans: Answer) => ans.colour);

      questionBody.answers.push(trueAnswer3, falseAnswer3);
      result = requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      // cannot check if colors have changed, for a same questionBody of create and update
      // as there's a minimum (1/COLOURS.length)^MAX_ANSWERS_LEN they might be the same
      const updatedColors: string[] = updatedQuizInfo.questions[0].answers.map((ans: Answer) => ans.colour);
      expect(updatedColors).not.toEqual(initialColors); // at least len is different

      // Ensure all colors are valid
      updatedColors.forEach(color => expect(COLORS).toContain(color));
    });

    test('test4.3.3 quiz info updates correctly when reaching maximum duration', () => {
      const initDuration = requestQuizInfo(token, quizId).duration;

      questionBody.duration = MAX_DURATIONS_SECS;
      questionBody.answers.push(trueAnswer2);
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(1);
      expect(updatedQuizInfo.duration).toStrictEqual(MAX_DURATIONS_SECS);
    });

    test('test4.3.4 quiz info shows correct order of added questions', () => {
      // question 1
      questionBody.question = 'First question';
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);

      // question 2
      questionBody.question = 'Second question';
      const questionId2 = requestQuizQuestionCreate(token, quizId, questionBody).questionId;

      // question 3
      questionBody.question = 'Third question';
      requestQuizQuestionCreate(token, quizId, questionBody);

      // Update question 2
      questionBody.question = 'Update Second question';
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.questions[0].question).toStrictEqual('First question');
      expect(updatedQuizInfo.questions[1].question).toStrictEqual('Update Second question');
      expect(updatedQuizInfo.questions[2].question).toStrictEqual('Third question');
    });

    test('test4.3.5 quiz info reflects changes in timeLastEdited for each question addition', () => {
      const quizInfo: Quiz = requestQuizInfo(token, quizId);
      const initialTime = quizInfo.timeLastEdited;

      // question 1
      requestQuizQuestionUpdate(token, quizId, questionId, questionBody);
      const infoAfterQuestion1 = requestQuizInfo(token, quizId);
      expect(infoAfterQuestion1.timeLastEdited).toBeGreaterThanOrEqual(initialTime);

      // question 2
      questionBody.question = 'new question';
      const questionId2 = requestQuizQuestionCreate(token, quizId, questionBody).questionId;
      requestQuizQuestionUpdate(token, quizId, questionId2, questionBody);
      const infoAfterQuestion2 = requestQuizInfo(token, quizId);
      expect(infoAfterQuestion2.timeLastEdited).toBeGreaterThanOrEqual(infoAfterQuestion1.timeLastEdited);
    });

    test('test4.4.0 quiz info should not update with invalid input', () => {
      const initialQuizInfo = requestQuizInfo(token, quizId);
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
      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo).toEqual(initialQuizInfo);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(initialQuizInfo.numQuestions);
      expect(updatedQuizInfo.questions).toStrictEqual(initialQuizInfo.questions);
      expect(updatedQuizInfo.duration).toStrictEqual(initialQuizInfo.duration);
      expect(updatedQuizInfo.timeLastEdited).toStrictEqual(initialQuizInfo.timeLastEdited);
    });
  });
});
