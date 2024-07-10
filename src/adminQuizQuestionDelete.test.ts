import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  ERROR, ResError, ResEmpty, ResToken, ResQuizId, ResQuizInfo,
  authRegister, requestAuthLogin,
  requestQuizCreate, requestQuizInfo,
  requestQuizQuestionCreate, requestQuizQuestionDelete, requestClear,
  ResQuestionId
} from './functionRequest';
import {
  QuestionBody, AnswerInput
} from './quizQuestion';

const initQuestionBody1: QuestionBody = {
  question: 'What is Javascript?',
  duration: 10,
  points: 10,
  answers: [],
};

const initQuestionBody2: QuestionBody = {
  question: 'What are you?',
  duration: 10,
  points: 10,
  answers: [],
};

const trueAnswer1: AnswerInput = {
  answer: 'Programming Langauge',
  correct: true
};

const trueAnswer2: AnswerInput = {
  answer: 'Human',
  correct: true
};

const falseAnswer1: AnswerInput = {
  answer: 'Bird',
  correct: false
};

const falseAnswer2: AnswerInput = {
  answer: 'Compiler',
  correct: false
};

const falseAnswer3: AnswerInput = {
  answer: 'None of the Above',
  correct: false
};
  
beforeEach(() => {
  requestClear();
});
  
describe('adminQuizQuestionDelete', () => {
  let user: ResToken;
  let quiz: ResQuizId;
  let questionBody1: QuestionBody;
  let questionBody2: QuestionBody;
  let question1: ResQuestionId;
  let question2: ResQuestionId;
  
  beforeEach(() => {
    user = authRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    requestAuthLogin('devk@gmail.com', 'DevaanshK01') as ResToken;
    quiz = requestQuizCreate(user.token, 'Sample Quiz', 'Sample Description') as ResQuizId;

    questionBody1 = JSON.parse(JSON.stringify(initQuestionBody1));
    const answers: AnswerInput[] = [trueAnswer1, falseAnswer1];
    questionBody1 = { ...initQuestionBody1, answers };
    questionBody1.answers = [trueAnswer1, falseAnswer1, falseAnswer2];
    question1 = requestQuizQuestionCreate(user.token, quiz.quizId, questionBody1) as ResQuestionId;

    questionBody2 = JSON.parse(JSON.stringify(initQuestionBody2));
    questionBody2 = { ...initQuestionBody2, answers };
    questionBody2.answers = [trueAnswer2, falseAnswer1, falseAnswer3];
    question2 = requestQuizQuestionCreate(user.token, quiz.quizId, questionBody2) as ResQuestionId;
  });

  test('Successfully deletes a question', () => {
    const result = requestQuizQuestionDelete(user.token, quiz.quizId, question1.questionId) as ResEmpty;
    expect(result).toStrictEqual({ status: OK });

    const quizInfo = requestQuizInfo(user.token, quiz.quizId) as ResQuizInfo;
    expect(quizInfo.questions.length).toStrictEqual(1);
    expect(quizInfo.questions[0].questionId).toStrictEqual(question2);
  });

  test('Error when token is invalid', () => {
    const result = requestQuizQuestionDelete('invalid token', quiz.quizId, question1.questionId) as ResError;
    expect(result).toStrictEqual({ status: UNAUTHORIZED, ERROR });
  });

  test('Error when quizId is invalid', () => {
    const result = requestQuizQuestionDelete(user.token, 999, question1.questionId) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, ERROR });
  });

  test('Error when questionId is invalid', () => {
    const result = requestQuizQuestionDelete(user.token, quiz.quizId, 999) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, ERROR });
  });

  test('Error when question has already been deleted', () => {
    requestQuizQuestionDelete(user.token, quiz.quizId, question1.questionId) as ResEmpty;
    const result = requestQuizQuestionDelete(user.token, quiz.quizId, question1.questionId) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, ERROR });
  });

  test('Error when user does not own the quiz', () => {
    const user2 = authRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel') as ResToken;
    requestAuthLogin('krishp@gmail.com', 'KrishP02') as ResToken;

    const result = requestQuizQuestionDelete(user2.token, quiz.quizId, question1.questionId) as ResError;
    expect(result).toStrictEqual({ status: BAD_REQUEST, ERROR });
  });
});
