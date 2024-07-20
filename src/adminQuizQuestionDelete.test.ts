import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  ERROR, ResError, ResEmpty, ResToken, ResQuizId, ResQuizInfo,
  authRegister, quizCreate, validQuizInfo,
  questionCreate, requestQuizQuestionDelete, requestClear,
  ResQuestionId,
} from './functionRequest';
import {
  QuestionBody, AnswerInput
} from './quizQuestion';

const initQuestionBody1: QuestionBody = {
  question: 'What is Javascript?',
  duration: 10,
  points: 10,
  answers: [],
  thumbnailUrl: 'http://google.com/img_path.jpg'
};

const initQuestionBody2: QuestionBody = {
  question: 'What are you?',
  duration: 10,
  points: 10,
  answers: [],
  thumbnailUrl: 'http://google.com/img_path.jpg'
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

afterAll(() => requestClear());

describe('adminQuizQuestionDelete', () => {
  let user: ResToken;
  let quiz: ResQuizId;
  let questionBody1: QuestionBody;
  let questionBody2: QuestionBody;
  let question1: ResQuestionId;
  let question2: ResQuestionId;

  beforeEach(() => {
    user = authRegister('devk@gmail.com', 'DevaanshK01', 'Devaansh', 'Kumar');
    quiz = quizCreate(user.token, 'My Quiz', 'Quiz on Testing') as ResQuizId;

    questionBody1 = JSON.parse(JSON.stringify(initQuestionBody1));
    const answers: AnswerInput[] = [trueAnswer1, falseAnswer1];
    questionBody1 = { ...initQuestionBody1, answers };
    questionBody1.answers = [trueAnswer1, falseAnswer1, falseAnswer2];
    question1 = questionCreate(user.token, quiz.quizId, questionBody1) as ResQuestionId;

    questionBody2 = JSON.parse(JSON.stringify(initQuestionBody2));
    questionBody2 = { ...initQuestionBody2, answers };
    questionBody2.answers = [trueAnswer2, falseAnswer1, falseAnswer3];
    question2 = questionCreate(user.token, quiz.quizId, questionBody2) as ResQuestionId;
  });

  test('Successfully deletes a question', () => {
    const result = requestQuizQuestionDelete(user.token, quiz.quizId, question1.questionId) as ResEmpty;
    expect(result.status).toStrictEqual(OK);

    const quizInfo = validQuizInfo(user.token, quiz.quizId) as ResQuizInfo;
    expect(quizInfo.questions.length).toStrictEqual(1);
    expect(quizInfo.questions[0].questionId).toStrictEqual(question2.questionId);
  });

  test('Error when token is invalid', () => {
    const result = requestQuizQuestionDelete('invalid token', quiz.quizId, question1.questionId) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(UNAUTHORIZED);
  });

  test('Error when token is missing', () => {
    const result = requestQuizQuestionDelete('', quiz.quizId, question1.questionId) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(UNAUTHORIZED);
  });

  test('Error when quizId is invalid', () => {
    const result = requestQuizQuestionDelete(user.token, 999, question1.questionId) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);
  });

  test('Error when quizId is missing', () => {
    const result = requestQuizQuestionDelete(user.token, null, question1.questionId) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);
  });

  test('Error when questionId is invalid', () => {
    const result = requestQuizQuestionDelete(user.token, quiz.quizId, 999) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when questionId is missing', () => {
    const result = requestQuizQuestionDelete(user.token, quiz.quizId, null) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when question has already been deleted', () => {
    requestQuizQuestionDelete(user.token, quiz.quizId, question1.questionId) as ResEmpty;
    const result = requestQuizQuestionDelete(user.token, quiz.quizId, question1.questionId) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when questionId belongs to a different quiz', () => {
    const quiz2 = quizCreate(user.token, 'Your Quiz', 'Quiz on Implementation') as ResQuizId;
    const result = requestQuizQuestionDelete(user.token, quiz2.quizId, question1.questionId) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
  });

  test('Error when user does not own the quiz', () => {
    const user2 = authRegister('krishp@gmail.com', 'KrishP02', 'Krish', 'Patel');
    const result = requestQuizQuestionDelete(user2.token, quiz.quizId, question1.questionId) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(FORBIDDEN);
  });
});
