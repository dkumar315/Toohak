import { OK, BAD_REQUEST, UNAUTHORIZED, EmptyObject } from './dataStore';
import { UserDetails } from './auth';
import {
  authRegister, requestAuthLogin, requestAuthLogout,
  requestUserDetails, requestUserDetailsUpdate,
  requestUserPasswordUpdate, requestClear,
  VALID_EMPTY_RETURN, ERROR, ResToken,
  ResError, ResEmpty, ResUserDetail
} from './functionRequest';

let email: string, password: string, nameFirst: string, nameLast: string;
let token: string;

beforeEach(() => {
  requestClear();
  email = 'haydensmith@gmail.com';
  password = 'haydensmith123';
  nameFirst = 'Hayden';
  nameLast = 'Smith';
  token = authRegister(email, password, nameFirst, nameLast).token;
});
afterAll(() => requestClear());

describe('testing adminUserDetails (GET /v1/admin/user/details)', () => {
  let result: ResUserDetail | ResError;
  test('route and type check', () => {
    result = requestUserDetails(token);
    expect(
      typeof result === 'object' && 'user' in result &&
      typeof result.user === 'object' && 'userId' in result.user &&
      typeof result.user.userId === 'number' && 'email' in result.user &&
      result.user.email === email && 'name' in result.user &&
      result.user.name === nameFirst + ' ' + nameLast &&
      'numSuccessfulLogins' in result.user &&
      result.user.numSuccessfulLogins === 1 &&
      'numFailedPasswordsSinceLastLogin' in result.user &&
      result.user.numFailedPasswordsSinceLastLogin === 0
    ).toBe(true);
  });
  describe('test1: no registered user', () => {
    test('test1.0: invalid token (test with clear())', () => {
      requestClear();
      result = requestUserDetails(token);
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });

  describe('test2: single registered user', () => {
    test('test2.1: valid input', () => {
      const expectRes: UserDetails = {
        userId: expect.any(Number),
        name: nameFirst + ' ' + nameLast,
        email: email,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };
      result = requestUserDetails(token) as ResUserDetail;
      expect(result.status).toStrictEqual(OK);
      expect(result.user).toMatchObject(expectRes);
    });

    test('test2.2: invalid tokens (non-existence)', () => {
      requestClear();
      const token1: string = (parseInt(token) - 1).toString();
      result = requestUserDetails(token1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      const token2: string = (parseInt(token) + 1).toString();
      result = requestUserDetails(token2) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      const token3: string = 'invalidToken';
      result = requestUserDetails(token3) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test2.3: invalid tokens (user Logout)', () => {
      requestAuthLogout(token);
      result = requestUserDetails(token) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });

  describe('test3: multiple registered users', () => {
    let email1: string, password1: string, nameFirst1: string, nameLast1: string;
    let email2: string, password2: string, nameFirst2: string, nameLast2: string;
    let token1: string, token2: string;
    let expectUser1: UserDetails, expectUser2: UserDetails;

    beforeEach(() => {
      requestClear();
      // user1
      email1 = 'stringab@gmail.com';
      password1 = 'string12345';
      nameFirst1 = 'stringa';
      nameLast1 = 'stringb';

      // user2
      email2 = 'haydensmith@gmail.com';
      password2 = 'haydensmith123';
      nameFirst2 = 'Hayden';
      nameLast2 = 'Smith';

      // user tokens
      token1 = authRegister(email1, password1, nameFirst1, nameLast1).token;
      token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;

      expectUser1 = {
        userId: expect.any(Number),
        name: nameFirst1 + ' ' + nameLast1,
        email: email1,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };

      expectUser2 = {
        userId: expect.any(Number),
        name: nameFirst2 + ' ' + nameLast2,
        email: email2,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };
    });

    test('test3.1: with valid tokens', () => {
      result = requestUserDetails(token1) as ResUserDetail;
      expect(result.user).toMatchObject(expectUser1);
      expect(result.status).toStrictEqual(OK);

      result = requestUserDetails(token2) as ResUserDetail;
      expect(result.user).toMatchObject(expectUser2);
      expect(result.status).toStrictEqual(OK);
    });

    test('test3.2: with invalid tokens', () => {
      token = (parseInt(token1) - 1).toString();
      result = requestUserDetails(token) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      token = (parseInt(token2) + 1).toString();
      result = requestUserDetails(token) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test3.2: with more authUsers', () => {
      // user3
      const email3: string = 'someone@gmail.com';
      const password3: string = 'email1234';
      const nameFirst3: string = 'Hello';
      const nameLast3: string = 'World';
      const token3: string = authRegister(email3, password3, nameFirst3, nameLast3).token;

      const expectUser3: UserDetails = {
        userId: expect.any(Number),
        name: nameFirst3 + ' ' + nameLast3,
        email: email3,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };

      result = requestUserDetails(token3) as ResUserDetail;
      expect(result.user).toMatchObject(expectUser3);

      const invalidToken: string = (parseInt(token3) + 1).toString();
      result = requestUserDetails(invalidToken) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });

  describe('test4: test with authlogin and authLogout', () => {
    let userResult: UserDetails | ResError;
    test('test4.0: initial before authadminLogin', () => {
      userResult = (requestUserDetails(token) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(1);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('test4.1: fail to login twice', () => {
      requestAuthLogin(email, password + 'invalid');
      requestAuthLogin(email, password + 'invalid');

      userResult = (requestUserDetails(token) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(1);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(2);
    });

    test('test4.2: successfully login twice, then fail to login', () => {
      requestAuthLogin(email, password);
      requestAuthLogin(email, password);
      requestAuthLogin(email, password + 'invalid');

      userResult = (requestUserDetails(token) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(3);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('test4.3: successful, fail the successful to login', () => {
      // successfully login
      requestAuthLogin(email, password);
      userResult = (requestUserDetails(token) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(2);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

      // then fail to login
      requestAuthLogin(email, password + 'invalid');
      userResult = (requestUserDetails(token) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(2);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(1);

      // then successfully login
      requestAuthLogin(email, password);
      userResult = (requestUserDetails(token) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(3);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});

describe('testing adminUserDetailsUpdate (PUT /v1/admin/user/details)', () => {
  let result: EmptyObject | ResError;
  describe('test1: valid results', () => {
    describe('test1.1: valid token(s)', () => {
      test('test1.1: valid inputs of single user', () => {
        result = requestUserDetailsUpdate(token, 'new' + email, 'new' + nameFirst, 'new' + nameLast);
        expect(result.status).toStrictEqual(OK);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      test('test1.2: valid inputs of single user, nothing update', () => {
        result = requestUserDetailsUpdate(token, email, nameFirst, nameLast);
        expect(result.status).toStrictEqual(OK);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      test('test1.3: valid tokens of mutiple users', () => {
        const email2: string = 'haydensmith2@gmail.com';
        const psw2: string = 'haydensmith2123';
        const nameFirst2: string = 'HaydenTwo';
        const nameLast2: string = 'SmithTwo';
        const token2: string = authRegister(email2, psw2, nameFirst2, nameLast2).token;

        result = requestUserDetailsUpdate(token2, email2, nameFirst2, nameLast2);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      test('test1.4: mutiple tokens of single user', () => {
        const newEmail: string = '1' + email;
        const newName: string = 'newName';
        requestUserDetailsUpdate(token, newEmail, nameFirst, nameLast);

        const token2: string = (requestAuthLogin(newEmail, password) as ResToken).token;
        requestUserDetailsUpdate(token2, email, newName, nameLast);

        const token3: string = (requestAuthLogin(email, password) as ResToken).token;
        requestUserDetailsUpdate(token3, newEmail, nameFirst, newName);

        const result1: UserDetails = (requestUserDetails(token3) as ResUserDetail).user;
        expect(result1.email).toStrictEqual(newEmail);
        expect(result1.name).toStrictEqual(nameFirst + ' ' + newName);
        expect(result1.numSuccessfulLogins).toStrictEqual(3);
        expect(result1.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

        const token4: string = (requestAuthLogin(newEmail, password) as ResToken).token;
        const result2: UserDetails = (requestUserDetails(token4) as ResUserDetail).user;
        expect(result2.email).toStrictEqual(newEmail);
        expect(result2.name).toStrictEqual(result1.name);
        expect(result2.numSuccessfulLogins).toStrictEqual(4);
        expect(result2.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
      });
    });

    describe('test1.2: valid emails', () => {
      test('test1.2.1: update email is the same as current user email', () => {
        email = 'haydensmith@gmail.com';
        result = requestUserDetailsUpdate(token, email, nameFirst, nameLast);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      const emails: string[] = ['hay.s2@gmail.com', 'hayd@icloud.com', 'nameFirst@gmail.com',
        'z5411789@ad.unsw.edu.au', 'h_s@protonmail.com', 'hayden@au@yahoo.com'];
      test.each(emails)('test1.2.2: valid email = \'%s\'', (validEmail) => {
        result = requestUserDetailsUpdate(token, validEmail, nameFirst, nameLast);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });
    });

    describe('test1.3: valid names', () => {
      const names: string[] = ['ab', 'abc', 'thisNameNineteenLen', 'thisNameTwentyLength',
        'name has spaces ', '     ', 'ALLUPPERCASE', 'hayden-Smith', 'Hay\'s-name'];

      describe('test1.3.1: valid nameFirst', () => {
        test.each(names)('valid nameFirst = \'%s\'', (validNameFirst) => {
          result = requestUserDetailsUpdate(token, email, validNameFirst, nameLast);
          expect(result).toMatchObject(VALID_EMPTY_RETURN);
        });
      });

      describe('test1.3.2: valid nameLast', () => {
        test.each(names)('valid nameLast = \'%s\'', (validNameLast) => {
          result = requestUserDetailsUpdate(token, email, nameFirst, validNameLast);
          expect(result).toMatchObject(VALID_EMPTY_RETURN);
        });
      });
    });
  });

  describe('test2: invalid results', () => {
    // invalid Tokens
    describe('test2.1: invalid tokens', () => {
      const emailnew: string = 'haydensmithNew@123.com';
      describe('test2.1.1: no user no valid token', () => {
        beforeEach(() => requestClear());
        const invalidIds: string[] = ['0', '1', '2', '3', '-1', '9999'];
        test.each(invalidIds)('invalid token = \'%s\'', (invalidToken) => {
          result = requestUserDetailsUpdate(invalidToken, emailnew, nameFirst, nameLast);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(UNAUTHORIZED);
        });
      });

      describe('test2.1.2: invalid tokens', () => {
        const invalidTokens: string[] = ['0', '2', '3', '10', '111', '9999', '-1'];
        test.each(invalidTokens)('invalid token = \'%s\'', (invalidToken) => {
          result = requestUserDetailsUpdate(invalidToken, emailnew, nameFirst, nameLast);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(UNAUTHORIZED);
        });
      });
    });
    // invalid Emails
    describe('test2.2: invalid emails', () => {
      const invalidEmails: string[] = ['', 'strings', '12345', 'hi!@mails', '@gmail.com'];
      test.each(invalidEmails)('test2.2.1: invalid email = \'%s\'', (invalidEmail) => {
        result = requestUserDetailsUpdate(token, invalidEmail, nameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.2.2: email used by other users', () => {
        // user2
        const email2: string = '078999@gmail.com';
        const psw2: string = 'vict078999';
        const nameFirst2: string = 'myName';
        const nameLast2: string = 'vict';
        const token2: string = authRegister(email2, psw2, nameFirst2, nameLast2).token;

        result = requestUserDetailsUpdate(token, email2, nameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
        result = requestUserDetailsUpdate(token2, email, nameFirst2, nameLast2);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });
  });
  // invalid Names
  describe('test2.3: invalid names', () => {
    const invalidNames: string[] = ['a', '1', ' ', 'includesnumber1', '123',
      'abc! specail char', 'str?12', '!@#$%^&*()_+=[]', '{}\\|;:\'",.<>?/',
      'there is twoOne words', 'overoveroveroverLoooooooogName'];

    describe('test2.3.1: invalid nameFirst', () => {
      test.each(invalidNames)('invalid nameFirst = \'%s\'', (invalidNameFirst) => {
        result = requestUserDetailsUpdate(token, email, invalidNameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.3.2: invalid nameLast', () => {
      test.each(invalidNames)('invalid nameLast = \'%s\'', (invalidNameLast) => {
        result = requestUserDetailsUpdate(token, email, nameFirst, invalidNameLast);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    // Errors are thrown in the following order: 401, then 403, then 400
    describe('test2.4: mutiple invalid inputs', () => {
      const invalidToken: string = 'invalid';
      const invalidEmail: string = 'invalid';
      const invalidName: string = '';
      test('test2.4.1: invalid token and email', () => {
        result = requestUserDetailsUpdate(invalidToken, invalidEmail, nameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.4.2: invalid token and nameLast', () => {
        result = requestUserDetailsUpdate(invalidToken, email, nameFirst, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.4.3: invalid names', () => {
        result = requestUserDetailsUpdate(token, email, invalidName, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.4: invalid email and names', () => {
        result = requestUserDetailsUpdate(token, invalidEmail, invalidName, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.5: all invalid', () => {
        result = requestUserDetailsUpdate(invalidToken, invalidEmail, invalidName, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });
  });
});

describe('testing requestUserPasswordUpdate (PUT /v1/admin/user/details)', () => {
  let newPasswords: string[] = [];
  let password: string, newPassword: string;
  let result: EmptyObject | ResError;
  let token: string;

  beforeEach(() => {
    requestClear();
    newPasswords = [];
    password = 'haydensmith123';
    newPassword = '321haydensmith';
    token = authRegister(email, password, nameFirst, nameLast).token;
  });

  // user2
  const password2: string = 'vict078999';
  const email2: string = '0789@gmail.com';
  const nameFirst2: string = 'name';
  const nameLast2: string = 'vict';

  describe('test1: valid results', () => {
    describe('test1.1.0: valid token, valid newPassword', () => {
      newPasswords = ['haydensnewpassword0', 'haydenSmith123', 'h1ydensmithabc'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validId) => {
        result = requestUserPasswordUpdate(token, password, validId);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.1.0: valid newPassword, check substrings', () => {
      newPasswords = ['abcd1234', 'abcd123456', 'abcd12345'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validId) => {
        result = requestUserPasswordUpdate(token, password, validId);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.2.1: valid newPassword, change for mutiple times', () => {
      newPasswords = Array.from({ length: 8 }, (_, i) => 'haydensnewPassword' + i);
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = requestUserPasswordUpdate(token, password, validPassword);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.2.2: valid newPassword, just meet the requirement', () => {
      newPasswords = ['this8Len', 'only1number', '11111l11', 'C8PTICAL'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = requestUserPasswordUpdate(token, password, validPassword);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.2.3: valid newPassword, with special characters', () => {
      newPasswords = ['this passw0rd has spaces', 'passw0rd!!!!', '#d4af37ToDo',
        'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = requestUserPasswordUpdate(token, password, validPassword);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.2.4: valid token with mutiple users', () => {
      let token2: string;
      beforeEach(() => {
        token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;
      });

      test('token with 2 users', () => {
        result = requestUserPasswordUpdate(token, password, password2);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);

        result = requestUserPasswordUpdate(token2, password2, password);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      test('token with 3 users', () => {
        // user3
        const password3: string = 'user3!!!';
        const email3: string = '07899@gmail.com';
        const nameFirst3: string = 'name';
        const nameLast3: string = 'vict';
        const token3: string = authRegister(email3, password3, nameFirst3, nameLast3).token;

        result = requestUserPasswordUpdate(token3, password3, password);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });
  });

  describe('test2: invalid results', () => {
    describe('test2.1.0: invalid token, no user exist', () => {
      beforeEach(() => requestClear());
      const invalidTokens: string[] = ['0', '1', '2', '3', '9999', '-1', 'abc', ''];
      test.each(invalidTokens)('invalid token = %i', (invalidToken) => {
        result = requestUserPasswordUpdate(invalidToken, password, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test2.1.1: invalid tokens, incorrect token input', () => {
      const invalidTokens: string[] = ['0', '2', '3', '9999', '-1', 'abc', ''];
      test.each(invalidTokens)('invalid token = \'%s\'', (invalidToken) => {
        result = requestUserPasswordUpdate(invalidToken, password, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test2.2: invalid oldPasswords', () => {
      test('test2.2.1: old password is empty', () => {
        result = requestUserPasswordUpdate(token, '', newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.2.2: old password is the new password', () => {
        result = requestUserPasswordUpdate(token, newPassword, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.2.3: password is other user\'s', () => {
        authRegister(email2, password2, nameFirst2, nameLast2);
        result = requestUserPasswordUpdate(token, password2, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.3: invalid newPasswords', () => {
      test('test2.3.1: newPassword equals to oldPassword', () => {
        result = requestUserPasswordUpdate(token, password, password);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.2: newPassword used before', () => {
        requestUserPasswordUpdate(token, password, newPassword);
        result = requestUserPasswordUpdate(token, newPassword, password);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      describe('test2.3.4: mutiple newPasswords used before', () => {
        newPasswords = ['thisLen8', 'only1number', '1111111l', 'C8PTICAL', 'AAAA1AAAA',
          'this password has space0', 'password111!!!!!', 'a0!@#$%^&*()_+=[]',
          '     0V0    ', 'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-',
          '#d4af37ToDo'];

        test.each(newPasswords)('test2.3.3: newPassword = last changed = \'%s\'', (newPassword) => {
          result = requestUserPasswordUpdate(token, password, newPassword);
          expect(result).toMatchObject(VALID_EMPTY_RETURN);
          expect(result.status).toStrictEqual(OK);
          // newPassword as last changed
          result = requestUserPasswordUpdate(token, newPassword, password);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
          password = newPassword;
        });
      });

      describe('test2.3.5: new password length incorrect', () => {
        newPasswords = ['', 'a1', '!', 'its7Len', '012345', 'abc', ' ', 'abc123!'];
        test.each(newPasswords)('invalid newPassword = \'%s\'', (newPassword) => {
          result = requestUserPasswordUpdate(token, password, newPassword);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });
      });

      describe('test2.3.6: new password not as require', () => {
        newPasswords = ['12345678', 'abcdefghijk', '!@#$%^&*()_+=[]', 'EEEEEEEEE'];
        test.each(newPasswords)('invalid newPassword = \'%s\'', (newPassword) => {
          result = requestUserPasswordUpdate(token, password, newPassword);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });
      });
    });

    describe('test2.4: mutiple invalid inputs', () => {
      const invalidToken: string = 'invalid';
      test('test2.4.1: invalid token and incorrect oldPassword', () => {
        result = requestUserPasswordUpdate(invalidToken, newPassword, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.4.2: invalid token and invlaid newPassword', () => {
        // newPassword same as oldPassword
        result = requestUserPasswordUpdate(invalidToken, password, password);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);

        // newPassword not meet requirement
        result = requestUserPasswordUpdate(invalidToken, password, '1a');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);

        result = requestUserPasswordUpdate(invalidToken, password, 'invalid: expect to contain number(s)');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.4.3: invalid newPassword and oldPassword', () => {
        result = requestUserPasswordUpdate(token, 'invalid', 'invalid');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        requestUserPasswordUpdate(token, password, newPassword);
        result = requestUserPasswordUpdate(token, 'invalid', password);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.4: all invalid', () => {
        result = requestUserPasswordUpdate(invalidToken, newPassword, 'invalid');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });
  });
});

describe('testing adminUser', () => {
  let email1: string, password1: string, nameFirst1: string, nameLast1: string;
  let email2: string, password2: string, nameFirst2: string, nameLast2: string;
  let token1: string, token2: string;
  let userResult: ResUserDetail, updateResult: ResEmpty, errorResult: ResError;

  beforeEach(() => {
    requestClear();
    // user1
    email1 = 'haydensmith@gmail.com';
    password1 = 'haydensmith123';
    nameFirst1 = 'Hayden';
    nameLast1 = 'Smith';
    token1 = authRegister(email1, password1, nameFirst1, nameLast1).token;

    // user2
    password2 = 'vict078999';
    email2 = '0789@gmail.com';
    nameFirst2 = 'name';
    nameLast2 = 'vict';
    token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;
  });

  afterAll(() => {
    requestClear();
  });

  test('test1.0: check details, and then update details and password', () => {
    // check detail and update detail
    userResult = requestUserDetails(token1) as ResUserDetail;
    expect(userResult.user.email).toStrictEqual(email1);
    expect(userResult.user.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);

    email1 = 'haydensmith2@ad.unsw.edu.au';
    nameFirst1 = 'Hayden-new';
    nameLast1 = 'Smith-new';
    requestUserDetailsUpdate(token1, email1, nameFirst1, nameLast1);

    // (update detail) and check detail
    userResult = requestUserDetails(token1) as ResUserDetail;
    expect(userResult.user.email).toStrictEqual(email1);
    expect(userResult.user.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);

    // (update detail, check detail) and update password
    const newPassword: string = 'haydensnewpassword0';
    updateResult = requestUserPasswordUpdate(token1, password1, newPassword) as ResEmpty;
    expect(userResult).toMatchObject(VALID_EMPTY_RETURN);
    password1 = newPassword;

    // (update password) and update detail
    email1 = 'haydensmith3@ad.unsw.edu.au';
    nameFirst1 = 'Hayden-new-new';
    nameLast1 = 'Smith-new-new';
    requestUserDetailsUpdate(token1, email1, nameFirst1, nameLast1);

    // (update password, update detail) and check detail
    userResult = requestUserDetails(token1) as ResUserDetail;
    expect(userResult.user.email).toStrictEqual(email1);
    expect(userResult.user.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);
  });

  test('test1.1: failed on changing password and rechanging', () => {
    // update password
    const invalidnewPassword: string = 'abc';
    errorResult = requestUserPasswordUpdate(token1, password1, invalidnewPassword) as ResError;
    expect(errorResult).toMatchObject(ERROR);
    expect(errorResult.status).toStrictEqual(BAD_REQUEST);

    // update password
    const newPassword: string = 'haydensnewpassword0';
    updateResult = requestUserPasswordUpdate(token1, password1, newPassword) as ResEmpty;
    expect(updateResult as ResEmpty).toMatchObject(VALID_EMPTY_RETURN);
  });

  test('test1.2: fail to change details', () => {
    // check deatil
    userResult = requestUserDetails(token2) as ResUserDetail;
    expect(userResult.user.email).toStrictEqual(email2);
    expect(userResult.user.name).toStrictEqual(nameFirst2 + ' ' + nameLast2);

    // fail to update details with invalid nameFirst
    const nameFirst: string = 'a';
    errorResult = requestUserDetailsUpdate(token2, email2, nameFirst, nameLast2) as ResError;
    expect(errorResult).toMatchObject(ERROR);
    expect(errorResult.status).toStrictEqual(BAD_REQUEST);

    // check deatil
    userResult = requestUserDetails(token2) as ResUserDetail;
    expect(userResult.user.email).toStrictEqual(email2);
    expect(userResult.user.name).toStrictEqual(nameFirst2 + ' ' + nameLast2);
  });

  test('test1.3: changed password, fail to change details', () => {
    // update password
    const newPassword: string = 'ABc20240610!';
    updateResult = requestUserPasswordUpdate(token2, password2, newPassword) as ResEmpty;
    expect(updateResult).toMatchObject(VALID_EMPTY_RETURN);

    // fail to update detail
    const invalidnameLast2: string = 'a';
    errorResult = requestUserDetailsUpdate(token2, email2, nameFirst2, invalidnameLast2) as ResError;
    expect(errorResult).toMatchObject(ERROR);
    expect(errorResult.status).toStrictEqual(BAD_REQUEST);
  });

  test('test1.4: tokens for a user', () => {
    // user1: token1, token2, token3; user2
    token2 = (requestAuthLogin(email1, password1) as ResToken).token;
    const emailnew: string = 'newEmail@qq.com';
    const newPassword: string = 'new Passw0rd';

    // use token1 to update details, and use new email to login
    requestUserDetailsUpdate(token1, emailnew, nameFirst1 + 'new', nameLast1);
    const token3: string = (requestAuthLogin(emailnew, password1) as ResToken).token;

    // use token2 to update password, and use new password to login
    requestUserPasswordUpdate(token2, password1, newPassword);
    const token4: string = (requestAuthLogin(emailnew, newPassword) as ResToken).token;

    // use token 1, 2, 3 to check
    const userResult1: UserDetails = (requestUserDetails(token1) as ResUserDetail).user;
    const userResult2: UserDetails = (requestUserDetails(token2) as ResUserDetail).user;
    const userResult3: UserDetails = (requestUserDetails(token3) as ResUserDetail).user;
    const userResult4: UserDetails = (requestUserDetails(token4) as ResUserDetail).user;

    expect(userResult1.email).toStrictEqual(emailnew);
    expect(userResult1.name).toStrictEqual(nameFirst1 + 'new' + ' ' + nameLast1);

    expect(userResult1).toStrictEqual(userResult2);
    expect(userResult3).toStrictEqual(userResult2);
    expect(userResult3).toStrictEqual(userResult4);
  });
});
