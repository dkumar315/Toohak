// request functions
import {
  requestAuthRegister, requestQuizCreate,
  requestQuizInfo, requestQuizQuestionCreate,
  requestClear
} from './functionRequest';

// interfaces and constants
import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, Answer, Quiz } from './dataStore';
import { ERROR, ResError } from './functionRequest'; // VALID_EMPTY_RETURN
import {
  QuestionBody, QuestionIdReturn, AnswerInput,
  MAX_DURATIONS_SECS, MIN_POINT_AWARD, MAX_POINT_AWARD, MAX_ANSWER_STRING_LEN
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

let token: string, quizId: number, questionBody: QuestionBody;
let result: QuestionIdRes | ResError;
beforeEach(() => {
  requestClear();
  token = requestAuthRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  quizId = requestQuizCreate(token, 'Mirror Mirror on the wall', 'I love disney cartons').quizId;
  questionBody = initQuestionBody;
  questionBody.answers = [trueAnswer1, falseAnswer1];
});
afterAll(() => requestClear());

describe('testing adminQuizQuestionCreate (POST /v1/admin/quiz/{quizid}/question)', () => {
  describe('test1.0 valid returns (valid token and quizId)', () => {
    test('test1.1 test with 1 correct answer, 3 answers in total', () => {
      questionBody.answers = [trueAnswer1, falseAnswer1, falseAnswer2];
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject({ questionId: expect.any(Number) });
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.2 test with 2 correct answer, 3 answers in total', () => {
      questionBody.answers = [trueAnswer1, trueAnswer2, falseAnswer1];
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject({ questionId: expect.any(Number) });
      expect(result.status).toStrictEqual(OK);
    });

    test('test1.3 test with 3 correct answer, 3 answers in total', () => {
      questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3];
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject({ questionId: expect.any(Number) });
      expect(result.status).toStrictEqual(OK);
    });

    describe('test1.4 just meet requiremnets', () => {
      test('test 1.4.1 question string have 5 characters in length', () => {
        questionBody.question = 'q'.repeat(5);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test 1.4.1 question string have special characters', () => {
        questionBody.question = '~!@#$%^&*()_+ {}|:"<>?';
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.2 question string have 50 characters in length', () => {
        questionBody.question = 'q'.repeat(50);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.3 question have 2 all true answers', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.3 question have 2, 1 true answers', () => {
        questionBody.answers = [trueAnswer1, falseAnswer1];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.3 question have 6 answers', () => {
        questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3,
          falseAnswer1, falseAnswer2, falseAnswer3];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.4 quiz with only one question has 3 minutes duration', () => {
        questionBody.duration = MAX_DURATIONS_SECS;
        questionBody.answers = [trueAnswer1, trueAnswer2, trueAnswer3];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.5 quiz with two quiz with 3 minutes duration in total', () => {
        questionBody.duration = Math.floor(MAX_DURATIONS_SECS / 2);

        // question 1
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);

        // question 2
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.6 point awarded for the question is 1', () => {
        questionBody.points = MIN_POINT_AWARD;
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.7 points awarded for the question are 10', () => {
        questionBody.points = MAX_POINT_AWARD;
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.8 the length of any answer is 1 character long', () => {
        const ShortAnswer: AnswerInput = {
          answer: ' ',
          correct: false
        };
        questionBody.answers = [trueAnswer1, ShortAnswer];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });

      test('test1.4.9 the length of any answer is 30 characters long', () => {
        const answer = 'iseveryone'.repeat(3);
        const LongAnswer: AnswerInput = {
          answer: answer,
          correct: true
        };
        questionBody.answers = [LongAnswer, falseAnswer1];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject({ questionId: expect.any(Number) });
        expect(result.status).toStrictEqual(OK);
      });
    });

    test('test1.5 questions have a same answer', () => {
      questionBody.answers = [trueAnswer1, falseAnswer1];
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject({ questionId: expect.any(Number) });
      expect(result.status).toStrictEqual(OK);

      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject({ questionId: expect.any(Number) });
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('test2.0 invalid returns', () => {
    describe('test2.1 invalid Token', () => {
      test('test2.1.1 invalid Token, token is empty', () => {
        result = requestQuizQuestionCreate('', quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.2 token with incorrect type', () => {
        result = requestQuizQuestionCreate('invalid', quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.3 token does not exist', () => {
        result = requestQuizQuestionCreate(String(parseInt(token) - 1), quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.1.4 token have not exist', () => {
        result = requestQuizQuestionCreate(String(parseInt(token) + 1), quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe.only('test2.2 invalid quizId', () => {
      test('test2.2.1 invalid quizId, quiz is not exist', () => {
        result = requestQuizQuestionCreate(token, quizId + 1, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });

      test('test2.2.2 invalid quizId, user does not own the quiz', () => {
        const token2 = requestAuthRegister('email2@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
        result = requestQuizQuestionCreate(token2, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);

        const quizId2 = requestQuizCreate(token2, 'quiz2', 'coming soon...').quizId;
        result = requestQuizQuestionCreate(token, quizId2, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(FORBIDDEN);
      });
    });

    describe('test2.3 invalid question string', () => {
      test('test2.3.1 string is less than 5 characters in length', () => {
        questionBody.question = '';
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.2 string is 4 characters in length', () => {
        questionBody.question = 'q'.repeat(4);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.3 string is greater than 50 characters in length', () => {
        questionBody.question = 'q'.repeat(51);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.4 invalid answers length', () => {
      test('test2.4.1 invalid answers, question have only 1 true answer', () => {
        questionBody.answers.push(trueAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.2 invalid answers, question have only 1 false answer', () => {
        questionBody.answers.push(falseAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.3 invalid answers, question have only 7 answers', () => {
        const extraAnswer = {
          answer: 'N/A',
          correct: false,
        };
        questionBody.answers.push(trueAnswer1, trueAnswer2, trueAnswer3,
          falseAnswer1, falseAnswer2, falseAnswer3, extraAnswer);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.5 invalid question durations', () => {
      test('test2.5.1 question durations is 0', () => {
        questionBody.answers.push(trueAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.5.2 question durations is negative', () => {
        questionBody.duration = MAX_DURATIONS_SECS + 1;
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.6 invalid durations length', () => {
      test('test2.6.1 question pass duration', () => {
        questionBody.duration = MAX_DURATIONS_SECS + 1;
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
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
        result = requestQuizQuestionCreate(token, quizId, questionBody);
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
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.7 invalid points awarded', () => {
      test('test2.7.1 points awarded is negative value', () => {
        questionBody.points = -1;
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.2 points awarded is 0', () => {
        questionBody.points = 0;
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.3 points awarded is more than 10', () => {
        questionBody.points = MAX_POINT_AWARD + 1;
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.7 invalid length of answer string', () => {
      const tooShortAnswer = {
        answer: '',
        correct: false,
      };
      const tooLongAnswer = {
        answer: 'ans'.repeat(MAX_ANSWER_STRING_LEN),
        correct: false,
      };

      test('test2.7.1 answer is empty', () => {
        questionBody.answers.push(tooShortAnswer);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.2 answer is over long', () => {
        questionBody.answers.unshift(tooShortAnswer);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.3 answers are too short or too long', () => {
        questionBody.answers.unshift(tooShortAnswer, trueAnswer1);
        questionBody.answers.push(tooLongAnswer, trueAnswer2);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.7.4 answers are all too short or too long', () => {
        questionBody.answers = [tooShortAnswer, tooLongAnswer];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.8 invalid answers', () => {
      test('test2.8.1 1 answers are duplicate', () => {
        questionBody.answers.push(trueAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.8.2 mutiple answers are duplicate', () => {
        questionBody.answers.push(trueAnswer1, trueAnswer2, falseAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.8.3 all answers are duplicate', () => {
        questionBody.answers.push(trueAnswer1, falseAnswer1);
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.8.4 all answers are duplicate', () => {
        questionBody.answers = [trueAnswer1, trueAnswer1, trueAnswer1];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.8.5 all false answers', () => {
        questionBody.answers = [falseAnswer1, falseAnswer2, falseAnswer3];
        result = requestQuizQuestionCreate(token, quizId, questionBody);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });
  });

  describe.skip('test3.0 mutilple invalid returns', () => {
    test('test3.1 invalid token and invalid quizId', () => {
      const invalidToken = 'invalidToken';
      const invalidQuizId = quizId + 1;
      result = requestQuizQuestionCreate(invalidToken, invalidQuizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.2 invalid token and invalid question string', () => {
      const invalidToken = 'invalidToken';
      questionBody.question = 'qs';
      result = requestQuizQuestionCreate(invalidToken, quizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.3 valid token, invalid quizId, and invalid answers', () => {
      const invalidQuizId = quizId + 1;
      questionBody.answers = [trueAnswer1];
      result = requestQuizQuestionCreate(token, invalidQuizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.4 valid token, valid quizId, invalid question string and duration', () => {
      questionBody.question = 'qs';
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.5 valid token and quizId, multiple invalid question properties', () => {
      questionBody.question = 'q'.repeat(51);
      questionBody.duration = 0;
      questionBody.points = MAX_POINT_AWARD + 1;
      questionBody.answers = [
        { answer: '', correct: false },
        { answer: 'a'.repeat(MAX_ANSWER_STRING_LEN + 1), correct: false },
        { answer: 'validAnsStr', correct: false }];
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.6 invalid token, invalid quizId, and invalid question properties', () => {
      const invalidToken = 'invalidToken';
      const invalidQuizId = quizId + 1;
      questionBody.question = 'a'.repeat(51);
      questionBody.duration = -1;
      questionBody.points = 0;
      result = requestQuizQuestionCreate(invalidToken, invalidQuizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.7 valid token, non-existent quizId, and duplicate answers', () => {
      const nonExistentQuizId = 9999;
      questionBody.answers = [trueAnswer1, trueAnswer1, falseAnswer1, falseAnswer1];
      result = requestQuizQuestionCreate(token, nonExistentQuizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('test3.8 valid token and quizId, invalid duration and answer count', () => {
      questionBody.duration = MAX_DURATIONS_SECS + 1;
      questionBody.answers = [trueAnswer1];
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('test3.9 invalid token, valid quizId, and too many answers', () => {
      const invalidToken = 'invalidToken';
      questionBody.answers = [
        trueAnswer1, trueAnswer2, trueAnswer3,
        falseAnswer1, falseAnswer2, falseAnswer3,
        { answer: 'extra answer', correct: false }
      ];
      result = requestQuizQuestionCreate(invalidToken, quizId, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.10 valid token, quiz owned by another user, and invalid points', () => {
      const anotherUserToken = requestAuthRegister('another@email.com', 'password123', 'Another', 'User').token;
      const quizId2 = requestQuizCreate(anotherUserToken, 'Another Quiz', 'Description').quizId;
      questionBody.points = -5;
      result = requestQuizQuestionCreate(token, quizId2, questionBody);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });
  });

  describe.skip('test4.0 test with quizInfo', () => {
    let quizInfo: Quiz;

    beforeEach(() => {
      quizInfo = requestQuizInfo(token, quizId);
    });

    test('test4.1 quiz info updates after adding one question', () => {
      const result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject({ questionId: expect.any(Number) });

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(1);
      expect(updatedQuizInfo.questions.length).toStrictEqual(1);
      expect(updatedQuizInfo.questions[0].question).toStrictEqual(questionBody.question);
      expect(updatedQuizInfo.questions[0].duration).toStrictEqual(questionBody.duration);
      expect(updatedQuizInfo.questions[0].points).toStrictEqual(questionBody.points);
      expect(updatedQuizInfo.questions[0].answers.length).toStrictEqual(questionBody.answers.length);
      expect(updatedQuizInfo.duration).toStrictEqual(questionBody.duration);
      expect(updatedQuizInfo.timeLastEdited).toBeGreaterThan(quizInfo.timeLastEdited); // toBeGreaterThanOrEqual
    });

    test('test4.2 quiz info updates after adding multiple questions', () => {
      requestQuizQuestionCreate(token, quizId, questionBody);
      requestQuizQuestionCreate(token, quizId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(2);
      expect(updatedQuizInfo.questions.length).toStrictEqual(2);
      expect(updatedQuizInfo.duration).toStrictEqual(questionBody.duration * 2);
      expect(updatedQuizInfo.timeLastEdited).toBeGreaterThan(quizInfo.timeLastEdited);
    });

    test('test4.3 quiz info reflects correct question IDs', () => {
      const question1 = requestQuizQuestionCreate(token, quizId, questionBody);
      const question2 = requestQuizQuestionCreate(token, quizId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.questions[0].questionId).toStrictEqual(question1.questionId);
      expect(updatedQuizInfo.questions[1].questionId).toStrictEqual(question2.questionId);
    });

    test('test4.4 quiz info shows correct answer details', () => {
      requestQuizQuestionCreate(token, quizId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      const questionInfo = updatedQuizInfo.questions[0];
      expect(questionInfo.question).toHaveProperty('questionId');
      expect(questionInfo.answers.length).toStrictEqual(questionBody.answers.length);
      questionInfo.answers.forEach((answer: Answer, index: number) => {
        expect(answer.answer).toStrictEqual(questionBody.answers[index].answer);
        expect(answer.correct).toStrictEqual(questionBody.answers[index].correct);
        expect(answer).toHaveProperty('answerId');
        expect(answer).toHaveProperty('colour');
      });
    });

    test('test4.5 quiz info preserves original quiz details', () => {
      requestQuizQuestionCreate(token, quizId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.quizId).toStrictEqual(quizInfo.quizId);
      expect(updatedQuizInfo.name).toStrictEqual(quizInfo.name);
      expect(updatedQuizInfo.description).toStrictEqual(quizInfo.description);
      expect(updatedQuizInfo.timeCreated).toStrictEqual(quizInfo.timeCreated);
    });

    test('test4.6 quiz info shows correct total duration', () => {
      const initQuizinfo = requestQuizInfo(token, quizId);
      expect(initQuizinfo.duration).toStrictEqual(0);
      let durationSum = initQuizinfo.duration;

      questionBody.duration = 7;
      durationSum += questionBody.duration;
      requestQuizQuestionCreate(token, quizId, questionBody);
      expect(requestQuizInfo(token, quizId).duration).toStrictEqual(durationSum);

      questionBody.duration = 8;
      durationSum += questionBody.duration;
      requestQuizQuestionCreate(token, quizId, questionBody);
      expect(requestQuizInfo(token, quizId).duration).toStrictEqual(durationSum);

      questionBody.duration = 9;
      durationSum += questionBody.duration;
      requestQuizQuestionCreate(token, quizId, questionBody);
      expect(requestQuizInfo(token, quizId).duration).toStrictEqual(durationSum);
    });

    test('test4.7 quiz info updates correctly when reaching maximum duration', () => {
      questionBody.duration = MAX_DURATIONS_SECS - 1;
      requestQuizQuestionCreate(token, quizId, questionBody);
      questionBody.duration = 1;
      questionBody.answers.push(trueAnswer2);
      requestQuizQuestionCreate(token, quizId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.numQuestions).toStrictEqual(2);
      expect(updatedQuizInfo.duration).toStrictEqual(MAX_DURATIONS_SECS);
    });

    test('test4.8 quiz info shows correct order of added questions', () => {
      // question 1
      questionBody.question = 'First question';
      requestQuizQuestionCreate(token, quizId, questionBody);

      // question 2
      questionBody.question = 'Second question';
      requestQuizQuestionCreate(token, quizId, questionBody);

      // question 3
      questionBody.question = 'Third question';
      requestQuizQuestionCreate(token, quizId, questionBody);

      const updatedQuizInfo = requestQuizInfo(token, quizId);
      expect(updatedQuizInfo.questions[0].question).toStrictEqual('First question');
      expect(updatedQuizInfo.questions[1].question).toStrictEqual('Second question');
      expect(updatedQuizInfo.questions[2].question).toStrictEqual('Third question');
    });

    test('test4.9 quiz info reflects changes in timeLastEdited for each question addition', () => {
      const initialTime = quizInfo.timeLastEdited;

      // question 1
      requestQuizQuestionCreate(token, quizId, questionBody);
      const infoAfterQuestion1 = requestQuizInfo(token, quizId);
      expect(infoAfterQuestion1.timeLastEdited).toBeGreaterThan(initialTime);

      // question 2
      questionBody.question = 'new question';
      requestQuizQuestionCreate(token, quizId, questionBody);
      const infoAfterQuestion2 = requestQuizInfo(token, quizId);
      expect(infoAfterQuestion2.timeLastEdited).toBeGreaterThan(infoAfterQuestion1.timeLastEdited);
    });

    test('test4.10 quiz info does not update with invalid input', () => {
      const initialQuizInfo = requestQuizInfo(token, quizId);
      const invalidQuestionBody = {
        question: 'q',
        duration: -1,
        points: 0,
        answers: [trueAnswer1]
      };

      const result = requestQuizQuestionCreate(token, quizId, invalidQuestionBody);
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
