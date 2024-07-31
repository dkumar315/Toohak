import { OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, ErrorObject } from './dataStore';
import {
  authRegister,
  quizCreate, validQuizInfo, requestUpdateQuizThumbnail,
  requestClear, ResQuizInfo, ResError
} from './functionRequest';

let token: string, quizId: number;
const ERROR: ErrorObject = { error: expect.any(String) };

beforeEach(() => {
  requestClear();
  const authResponse = authRegister('e@gmail.com', 'Passw0rd', 'nameFirst', 'nameLast');
  token = authResponse.token;
  const quizResponse = quizCreate(token, 'Test Quiz', 'Description');
  quizId = quizResponse.quizId;
});

afterAll(requestClear);

describe('testing updateQuizThumbnail', () => {
  test('valid thumbnail update', () => {
    const imgUrl = 'http://google.com/some/image/path.jpg';
    const result = requestUpdateQuizThumbnail(token, quizId, imgUrl);
    expect(result.status).toStrictEqual(OK);

    const updatedQuiz = validQuizInfo(token, quizId) as ResQuizInfo;
    expect(updatedQuiz.thumbnailUrl).toStrictEqual(imgUrl);
  });

  describe('invalid thumbnail URL', () => {
    test('URL does not end with jpg, jpeg, or png', () => {
      const imgUrl = 'http://google.com/some/image/path.gif';
      const result = requestUpdateQuizThumbnail(token, quizId, imgUrl) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('URL does not start with http:// or https://', () => {
      const imgUrl = 'google.com/some/image/path.jpg';
      const result = requestUpdateQuizThumbnail(token, quizId, imgUrl) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });

  describe('invalid token', () => {
    test('invalid token', () => {
      const imgUrl = 'http://google.com/some/image/path.jpg';
      const result = requestUpdateQuizThumbnail('invalidToken', quizId, imgUrl) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('empty token', () => {
      const imgUrl = 'http://google.com/some/image/path.jpg';
      const result = requestUpdateQuizThumbnail('', quizId, imgUrl) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('token for non-existing user', () => {
      requestClear();
      const imgUrl = 'http://google.com/some/image/path.jpg';
      const result = requestUpdateQuizThumbnail(token, quizId, imgUrl) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });

  describe('invalid quizId', () => {
    test('non-existing quizId', () => {
      const imgUrl = 'http://google.com/some/image/path.jpg';
      const result = requestUpdateQuizThumbnail(token, quizId + 1, imgUrl) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });

    test('user is not the owner of the quiz', () => {
      const newUserToken = authRegister('another@example.com', 'Password1', 'FirstName', 'LastName').token;
      const imgUrl = 'http://google.com/some/image/path.jpg';
      const result = requestUpdateQuizThumbnail(newUserToken, quizId, imgUrl) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(FORBIDDEN);
    });
  });
});
