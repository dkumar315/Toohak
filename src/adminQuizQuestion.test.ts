// request functions
import {
  requestAuthRegister, // requestQuizCreate,
  // requestQuizList, requestQuizInfo,
  requestQuizQuestionCreate,
  requestClear
} from './functionRequest';

// interfaces and constants
// import { OK, BAD_REQUEST, UNAUTHORIZED, Answer } from './dataStore';
import { ERROR, ResError } from './functionRequest'; // VALID_EMPTY_RETURN
import { QuestionBody, QuestionIdReturn, AnswerInput } from './quizQuestion';

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

// const trueAnswer2: AnswerInput = {
//   answer: 'Snow White',
//   correct: true
// };

// const trueAnswer3: AnswerInput = {
//   answer: 'the Wicked Queen',
//   correct: true
// };

const falseAnswer1: AnswerInput = {
  answer: 'mirror',
  correct: false
};

const falseAnswer2: AnswerInput = {
  answer: 'Poisoned Apple',
  correct: false
};

// const falseAnswer2: AnswerInput = {
//   answer: 'Prince Florian',
//   correct: false
// };

let token: string, quizId: number, questionBody: QuestionBody;
let result: QuestionIdReturn | ResError;
beforeEach(() => {
  requestClear();
  token = requestAuthRegister('email@gmail.com', 'passw0rd', 'nameFirst', 'nameLast').token;
  quizId = 1; // requestQuizcreate(token, 'Mirror, Mirror on the wall', 'I love disney cartons');
  questionBody = initQuestionBody;
});

describe('testing adminQuizQuestionCreate', () => {
  describe('test 1.0 valid returns', () => {
    test('test 1.1 test with 1 correct answer', () => {
      questionBody.answers.push(trueAnswer1, falseAnswer1, falseAnswer2);
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      expect(result).toMatchObject({ questionId: expect.any(Number) });
      // expect(result.status).toMatchObject(OK);
    });
  });

  describe('test 2.0 invalid returns', () => {
    test('test2.1 ', () => {
      result = requestQuizQuestionCreate(token, quizId, questionBody);
      // expect(result).toMatchObject(ERROR);
      // expect(result.status).toMatchObject(UNAUTHORIZED);
    });
  });
});
