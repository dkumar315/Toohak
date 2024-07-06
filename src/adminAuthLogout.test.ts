import { OK, UNAUTHORIZED } from './dataStore';
import { UserDetailReturn, TokenReturn } from './auth';
import {
  requestAuthRegister, requestAuthLogin, requestAuthLogout,
  requestUserDetails, requestUserDetailsUpdate,
  requestUserPasswordUpdate, requestClear,
  VALID_EMPTY_RETURN, ERROR, ResEmpty, ResError
} from './functionRequest';

let email: string, password: string, nameFirst: string, nameLast: string;
let token1: string, token2: string, result: ResEmpty | ResError;

beforeEach(() => {
  requestClear();
  email = 'haydensmith@gmail.com';
  password = 'haydensmith123';
  nameFirst = 'Hayden';
  nameLast = 'Smith';
  token1 = (requestAuthRegister(email, password, nameFirst, nameLast) as TokenReturn).token;
});
afterAll(() => requestClear());

// /v1/admin/auth/logout
describe('testing POST /v1/admin/auth/logout adminAuthLogout', () => {
  describe('test1.0 valid returns', () => {
    test('test 1.1 single user successfully logout', () => {
      result = requestAuthLogout(token1);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
      expect(requestUserDetails(token1).status).toStrictEqual(UNAUTHORIZED);
    });

    test('test 1.2 mutilple logout for different tokens of a same user', () => {
      token2 = (requestAuthLogin(email, password) as TokenReturn).token;
      expect(token2).not.toStrictEqual(token1);
      requestAuthLogout(token1);
      expect(requestUserDetails(token2).status).toStrictEqual(OK);

      result = requestAuthLogout(token2);
      expect(result).toMatchObject(VALID_EMPTY_RETURN);
      expect(result.status).toStrictEqual(OK);
      expect(requestUserDetails(token2).status).toStrictEqual(UNAUTHORIZED);
    });

    test('test 1.3 user1 login, user2 login, user1 logout and user1 login', () => {
      const token2 = (requestAuthRegister('2' + email, '2' + password, nameFirst, nameLast) as TokenReturn).token;
      requestAuthLogout(token1);
      const token3 = (requestAuthLogin(email, password) as TokenReturn).token;
      expect(token1).not.toStrictEqual(token2);
      expect(token1).not.toStrictEqual(token3);
      expect(token2).not.toStrictEqual(token3);
    });
  });

  describe('test2.0 invalid returns', () => {
    test('test 2.1 token is invalid, no session', () => {
      requestClear();
      result = requestAuthLogout(token1);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test 2.2 token is empty', () => {
      result = requestAuthLogout('');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      requestClear();
      result = requestAuthLogout('');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test 2.3 token is invalid, non-existent token', () => {
      result = requestAuthLogout('invalid');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      result = requestAuthLogout(String(parseInt(token1) - 1));
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      result = requestAuthLogout(String(parseInt(token1) + 1));
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test 2.4 token is invalid, session already log out', () => {
      token2 = (requestAuthLogin(email, password) as TokenReturn).token;

      requestAuthLogout(token1);
      result = requestAuthLogout(token1);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      requestAuthLogout(token2);
      result = requestAuthLogout(token2);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });

  describe('test3.0 test with other function', () => {
    test('test 3.1 userDetail', () => {
      token2 = (requestAuthLogin(email, password) as TokenReturn).token;
      requestAuthLogin(email, password + 'invalid');

      const result1 = requestUserDetails(token1) as UserDetailReturn;
      expect(result1.user.numSuccessfulLogins).toStrictEqual(2);
      expect(result1.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);

      requestAuthLogout(token1);
      const result2 = requestUserDetails(token2) as UserDetailReturn;
      expect(result2.user.numSuccessfulLogins).toStrictEqual(2);
      expect(result2.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);

      requestAuthLogout(token2);
      expect(requestUserDetails(token2).status).toStrictEqual(UNAUTHORIZED);
    });

    test('test 3.2 logout after email change', () => {
      requestUserDetailsUpdate(token1, 'new' + email, nameFirst, nameLast);
      const result1 = requestAuthLogout(token1) as ResEmpty;
      expect(result1).toMatchObject(VALID_EMPTY_RETURN);
      expect(result1.status).toStrictEqual(OK);

      token2 = (requestAuthLogin('new' + email, password) as TokenReturn).token;
      const result2 = requestAuthLogout(token2) as ResEmpty;
      expect(result2).toMatchObject(VALID_EMPTY_RETURN);
      expect(result2.status).toStrictEqual(OK);
    });

    test('test 3.3 logout after password change', () => {
      requestUserPasswordUpdate(token1, password, 'new' + password);
      const result1 = requestAuthLogout(token1) as ResEmpty;
      expect(result1).toMatchObject(VALID_EMPTY_RETURN);
      expect(result1.status).toStrictEqual(OK);

      const result2 = (requestAuthLogin(email, 'new' + password) as TokenReturn).token;
      expect(result2).not.toStrictEqual(token1);
      expect(result1.status).toStrictEqual(OK);
    });
  });
});
