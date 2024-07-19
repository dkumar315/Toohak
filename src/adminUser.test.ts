import { OK, BAD_REQUEST, UNAUTHORIZED, EmptyObject } from './dataStore';
import { UserDetails } from './auth';
import {
  authRegister, requestAuthLogin, requestAuthLogout,
  requestUserDetails, requestUserDetailsUpdate,
  requestUserPasswordUpdate, requestClear,
  VALID_EMPTY_RETURN, ERROR, ResToken,
  ResError, ResEmpty, ResUserDetail
} from './functionRequest';

// user1
let email1: string, password1: string, nameFirst1: string, nameLast1: string;
let email2: string, password2: string, nameFirst2: string, nameLast2: string;
let token1: string, token2: string;

beforeEach(() => {
  requestClear();
  // user1
  email1 = 'stringab@gmail.com';
  password1 = 'PasswordStr8';
  nameFirst1 = 'stringa';
  nameLast1 = 'stringb';
  token1 = authRegister(email1, password1, nameFirst1, nameLast1).token;

  // user2
  email2 = 'haydensmith@gmail.com';
  password2 = 'haydensmith123';
  nameFirst2 = 'Hayden';
  nameLast2 = 'Smith';
});

afterAll(() => requestClear());

describe('testing adminUserDetails (GET /v1/admin/user/details)', () => {
  let result: ResUserDetail | ResError;
  test('test1: route and type check', () => {
    result = requestUserDetails(token1);
    expect(
      typeof result === 'object' && 'user' in result &&
      typeof result.user === 'object' && 'userId' in result.user &&
      typeof result.user.userId === 'number' && 'email' in result.user &&
      result.user.email === email1 && 'name' in result.user &&
      result.user.name === nameFirst1 + ' ' + nameLast1 &&
      'numSuccessfulLogins' in result.user &&
      result.user.numSuccessfulLogins === 1 &&
      'numFailedPasswordsSinceLastLogin' in result.user &&
      result.user.numFailedPasswordsSinceLastLogin === 0
    ).toBe(true);
  });

  describe('test2: single registered user', () => {
    test('test2.1: valid input', () => {
      const expectRes: UserDetails = {
        userId: expect.any(Number),
        name: nameFirst1 + ' ' + nameLast1,
        email: email1,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };
      result = requestUserDetails(token1) as ResUserDetail;
      expect(result.status).toStrictEqual(OK);
      expect(result.user).toMatchObject(expectRes);
    });

    test('test2.2: invalid tokens (non-existence)', () => {
      let invalidToken: string = (parseInt(token1) - 1).toString();
      result = requestUserDetails(invalidToken) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      invalidToken = (parseInt(token1) + 1).toString();
      result = requestUserDetails(invalidToken) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      invalidToken = 'invalidToken';
      result = requestUserDetails(invalidToken) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      requestClear();
      result = requestUserDetails(token1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;
      result = requestUserDetails(token1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });

    test('test2.3: invalid tokens (user Logout)', () => {
      requestAuthLogout(token1);
      result = requestUserDetails(token1) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);
    });
  });

  describe('test3: multiple registered users', () => {
    beforeEach(() => {
      token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;
    });

    test('test3.1: with valid tokens', () => {
      const expectUser1: UserDetails = {
        userId: expect.any(Number),
        name: nameFirst1 + ' ' + nameLast1,
        email: email1,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };

      const expectUser2: UserDetails = {
        userId: expect.any(Number),
        name: nameFirst2 + ' ' + nameLast2,
        email: email2,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };

      result = requestUserDetails(token1) as ResUserDetail;
      expect(result.user).toMatchObject(expectUser1);
      expect(result.status).toStrictEqual(OK);

      result = requestUserDetails(token2) as ResUserDetail;
      expect(result.user).toMatchObject(expectUser2);
      expect(result.status).toStrictEqual(OK);
    });

    test('test3.2: with invalid tokens', () => {
      let invalidToken: string = (parseInt(token1) - 1).toString();
      result = requestUserDetails(invalidToken) as ResError;
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(UNAUTHORIZED);

      invalidToken = (parseInt(token2) + 1).toString();
      result = requestUserDetails(invalidToken) as ResError;
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
      userResult = (requestUserDetails(token1) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(1);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('test4.1: fail to login twice', () => {
      requestAuthLogin(email1, password1 + 'invalid');
      requestAuthLogin(email1, password1 + 'invalid');

      userResult = (requestUserDetails(token1) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(1);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(2);
    });

    test('test4.2: successfully login twice, then fail to login', () => {
      requestAuthLogin(email1, password1);
      requestAuthLogin(email1, password1);
      requestAuthLogin(email1, password1 + 'invalid');

      userResult = (requestUserDetails(token1) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(3);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('test4.3: successful, fail the successful to login', () => {
      // successfully login
      requestAuthLogin(email1, password1);
      userResult = (requestUserDetails(token1) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(2);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

      // then fail to login
      requestAuthLogin(email1, password1 + 'invalid');
      userResult = (requestUserDetails(token1) as ResUserDetail).user;
      expect(userResult.numSuccessfulLogins).toStrictEqual(2);
      expect(userResult.numFailedPasswordsSinceLastLogin).toStrictEqual(1);

      // then successfully login
      requestAuthLogin(email1, password1);
      userResult = (requestUserDetails(token1) as ResUserDetail).user;
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
        result = requestUserDetailsUpdate(token1, 'new' + email1, 'new' + nameFirst1, 'new' + nameLast1);
        expect(result.status).toStrictEqual(OK);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      test('test1.2: valid inputs of single and mutiple user(s), nothing update', () => {
        result = requestUserDetailsUpdate(token1, email1, nameFirst1, nameLast1);
        expect(result.status).toStrictEqual(OK);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);

        token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;
        result = requestUserDetailsUpdate(token2, email2, nameFirst2, nameLast2);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      test('test1.4: mutiple tokens of single user', () => {
        const newEmail: string = '1' + email1;
        const newName: string = 'newName';
        requestUserDetailsUpdate(token1, newEmail, nameFirst1, nameLast1);

        const token2: string = (requestAuthLogin(newEmail, password1) as ResToken).token;
        requestUserDetailsUpdate(token2, email1, newName, nameLast1);

        const token3: string = (requestAuthLogin(email1, password1) as ResToken).token;
        requestUserDetailsUpdate(token3, newEmail, nameFirst1, newName);

        const result1: UserDetails = (requestUserDetails(token3) as ResUserDetail).user;
        expect(result1.email).toStrictEqual(newEmail);
        expect(result1.name).toStrictEqual(nameFirst1 + ' ' + newName);
        expect(result1.numSuccessfulLogins).toStrictEqual(3);
        expect(result1.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

        const token4: string = (requestAuthLogin(newEmail, password1) as ResToken).token;
        const result2: UserDetails = (requestUserDetails(token4) as ResUserDetail).user;
        expect(result2.email).toStrictEqual(newEmail);
        expect(result2.name).toStrictEqual(result1.name);
        expect(result2.numSuccessfulLogins).toStrictEqual(4);
        expect(result2.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
      });
    });

    describe('test1.3: valid inputs', () => {
      const emails: string[] = ['hay.2@gmail.com', 'hay@icloud.com',
        'z5411789@ad.unsw.edu.au', 'h_s@protonmail.com', 'hayden@au@yahoo.com'];
      test.each(emails)('email = \'%s\'', (validEmail) => {
        result = requestUserDetailsUpdate(token1, validEmail, nameFirst1, nameLast1);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      const names: string[] = ['ab', 'abc', 'thisNameNineteenLen', 'thisNameTwentyLength',
        'name has spaces ', '     ', 'ALLUPPERCASE', 'hayden-Smith', 'Hay\'s-name'];
      test.each(names)('nameFirst = \'%s\'', (validNameFirst) => {
        result = requestUserDetailsUpdate(token1, email1, validNameFirst, nameLast1);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });

      test.each(names)('nameLast = \'%s\'', (validNameLast) => {
        result = requestUserDetailsUpdate(token1, email1, nameFirst1, validNameLast);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
      });
    });
  });

  describe('test2: invalid results', () => {
    describe('test2.1: invalid tokens', () => {
      const emailnew: string = 'haydensmithNew@123.com';
      const invalidTokens: string[] = ['0', '2', '3', '10', '111', '9999', '-1'];
      test.each(invalidTokens)('invalid token = \'%s\'', (invalidToken) => {
        result = requestUserDetailsUpdate(invalidToken, emailnew, nameFirst1, nameLast1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test2.2: invalid emails', () => {
      const invalidEmails: string[] = ['', 'strings', '12345', 'hi!@mails', '@gmail.com'];
      test.each(invalidEmails)('test2.2.1: invalid email = \'%s\'', (invalidEmail) => {
        result = requestUserDetailsUpdate(token1, invalidEmail, nameFirst1, nameLast1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.2.2: email used by other users', () => {
        token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;

        result = requestUserDetailsUpdate(token1, email2, nameFirst1, nameLast1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestUserDetailsUpdate(token2, email1, nameFirst2, nameLast2);
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
        result = requestUserDetailsUpdate(token1, email1, invalidNameFirst, nameLast1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.3.2: invalid nameLast', () => {
      test.each(invalidNames)('invalid nameLast = \'%s\'', (invalidNameLast) => {
        result = requestUserDetailsUpdate(token1, email1, nameFirst1, invalidNameLast);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    // Errors are thrown in the following order: 401, then 403, then 400
    describe('test2.4: mutiple invalid inputs', () => {
      const invalidToken: string = 'invalid';
      const invalidEmail: string = 'invalid';
      const invalidName: string = '';

      test('test2.4.1: invalid token', () => {
        result = requestUserDetailsUpdate(invalidToken, invalidEmail, nameFirst1, nameLast1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);

        result = requestUserDetailsUpdate(invalidToken, email1, nameFirst1, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.4.2: invalid names', () => {
        result = requestUserDetailsUpdate(token1, invalidEmail, invalidName, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestUserDetailsUpdate(token1, email1, invalidName, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.3: all invalid', () => {
        result = requestUserDetailsUpdate(invalidToken, invalidEmail, invalidName, invalidName);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });
  });
});

describe('testing requestUserPasswordUpdate (PUT /v1/admin/user/details)', () => {
  let newPassword: string;
  let newPasswords: string[] = [];
  let result: EmptyObject | ResError;

  beforeEach(() => {
    newPasswords = [];
    newPassword = '321haydensmith';
  });

  describe('test1: valid results', () => {
    describe('test1.2.1: valid newPassword, change for mutiple times', () => {
      newPasswords = Array.from({ length: 8 }, (_, i) => 'haydensnewPassword' + i);
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = requestUserPasswordUpdate(token1, password1, validPassword);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.2.2: valid newPassword, just meet the requirement', () => {
      newPasswords = ['this8Len', 'only1number', '11111l11', 'C8PTICAL'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = requestUserPasswordUpdate(token1, password1, validPassword);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });

    describe('test1.2.3: valid newPassword with specail cases', () => {
      newPasswords = ['haydensnewpassword0', 'haydenSmith123', 'h1ydensmithabc'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validId) => {
        result = requestUserPasswordUpdate(token1, password1, validId);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      // check substrings
      newPasswords = ['abcd1234', 'abcd123456', 'abcd12345'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validId) => {
        result = requestUserPasswordUpdate(token1, password1, validId);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });

      // with special characters
      newPasswords = ['this passw0rd has spaces', 'passw0rd!!!!', '#d4af37ToDo',
        'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = requestUserPasswordUpdate(token1, password1, validPassword);
        expect(result).toMatchObject(VALID_EMPTY_RETURN);
        expect(result.status).toStrictEqual(OK);
      });
    });
  });

  describe('test2: invalid results', () => {
    describe('test2.1.1: invalid tokens', () => {
      const invalidTokens: string[] = ['0', '2', '3', '9999', '-1', 'abc', '', '!'];
      test.each(invalidTokens)('invalid token = \'%s\'', (invalidToken) => {
        result = requestUserPasswordUpdate(invalidToken, password1, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });

    describe('test2.2: invalid oldPasswords', () => {
      test('test2.2.1: old password is empty', () => {
        result = requestUserPasswordUpdate(token1, '', newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.2.2: old password is the new password', () => {
        result = requestUserPasswordUpdate(token1, newPassword, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.2.3: password is other user\'s', () => {
        authRegister(email2, password2, nameFirst2, nameLast2);
        result = requestUserPasswordUpdate(token1, password2, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('test2.3: invalid newPasswords', () => {
      test('test2.3.1: newPassword equals to oldPassword', () => {
        result = requestUserPasswordUpdate(token1, password1, password1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.3.2: newPassword used before', () => {
        requestUserPasswordUpdate(token1, password1, newPassword);
        result = requestUserPasswordUpdate(token1, newPassword, password1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      describe('test2.3.4: mutiple newPasswords used before', () => {
        newPasswords = ['thisLen8', 'only1number', '1111111l', 'C8PTICAL', 'AAAA1AAAA',
          'this password has space0', 'password111!!!!!', 'a0!@#$%^&*()_+=[]',
          '     0V0    ', 'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-',
          '#d4af37ToDo'];

        test.each(newPasswords)('test2.3.3: newPassword = \'%s\'', (newPassword) => {
          result = requestUserPasswordUpdate(token1, password1, newPassword);
          expect(result).toMatchObject(VALID_EMPTY_RETURN);
          expect(result.status).toStrictEqual(OK);
          // newPassword as last changed
          result = requestUserPasswordUpdate(token1, newPassword, password1);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
          password1 = newPassword;
        });
      });

      describe('test2.3.5: new password length incorrect', () => {
        newPasswords = ['', 'a1', '!', 'its7Len', '012345', 'abc', ' ', 'abc123!'];
        test.each(newPasswords)('invalid newPassword = \'%s\'', (newPassword) => {
          result = requestUserPasswordUpdate(token1, password1, newPassword);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });
      });

      describe('test2.3.6: new password not as require', () => {
        newPasswords = ['12345678', 'abcdefghijk', '!@#$%^&*()_+=[]', 'EEEEEEEEE'];
        test.each(newPasswords)('invalid newPassword = \'%s\'', (newPassword) => {
          result = requestUserPasswordUpdate(token1, password1, newPassword);
          expect(result).toMatchObject(ERROR);
          expect(result.status).toStrictEqual(BAD_REQUEST);
        });
      });
    });

    describe('test2.4: mutiple invalid inputs', () => {
      const invalidToken: string = 'invalid';
      test('test2.4.1: invalid token and incorrect passwords', () => {
        result = requestUserPasswordUpdate(invalidToken, newPassword, newPassword);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });

      test('test2.4.2: invalid newPassword and oldPassword', () => {
        result = requestUserPasswordUpdate(token1, 'invalid', 'invalid');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);

        requestUserPasswordUpdate(token1, password1, newPassword);
        result = requestUserPasswordUpdate(token1, 'invalid', password1);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('test2.4.3: all invalid', () => {
        result = requestUserPasswordUpdate(invalidToken, newPassword, 'invalid');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(UNAUTHORIZED);
      });
    });
  });
});

describe('testing adminUser', () => {
  let result: ResUserDetail | ResEmpty | ResError;
  beforeEach(() => {
    token2 = authRegister(email2, password2, nameFirst2, nameLast2).token;
  });

  test('test1.0: check details, and then update details and password', () => {
    // check detail and update detail
    result = requestUserDetails(token1) as ResUserDetail;
    expect(result.user.email).toStrictEqual(email1);
    expect(result.user.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);

    email1 = 'haydensmith2@ad.unsw.edu.au';
    nameFirst1 = 'Hayden-new';
    nameLast1 = 'Smith-new';
    requestUserDetailsUpdate(token1, email1, nameFirst1, nameLast1);

    // (update detail) and check detail
    result = requestUserDetails(token1) as ResUserDetail;
    expect(result.user.email).toStrictEqual(email1);
    expect(result.user.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);

    // (update detail, check detail) and update password
    const newPassword: string = 'haydensnewpassword0';
    result = requestUserPasswordUpdate(token1, password1, newPassword) as ResEmpty;
    expect(result).toMatchObject(VALID_EMPTY_RETURN);
    password1 = newPassword;

    // (update password) and update detail
    email1 = 'haydensmith3@ad.unsw.edu.au';
    nameFirst1 = 'Hayden-new-new';
    nameLast1 = 'Smith-new-new';
    requestUserDetailsUpdate(token1, email1, nameFirst1, nameLast1);

    // (update password, update detail) and check detail
    result = requestUserDetails(token1) as ResUserDetail;
    expect(result.user.email).toStrictEqual(email1);
    expect(result.user.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);
  });

  test('test1.1: failed on changing password and rechanging', () => {
    // update password
    const invalidnewPassword: string = 'abc';
    result = requestUserPasswordUpdate(token1, password1, invalidnewPassword) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);

    // update password
    const newPassword: string = 'haydensnewpassword0';
    result = requestUserPasswordUpdate(token1, password1, newPassword) as ResEmpty;
    expect(result as ResEmpty).toMatchObject(VALID_EMPTY_RETURN);
  });

  test('test1.2: fail to change details', () => {
    // check deatil
    result = requestUserDetails(token2) as ResUserDetail;
    expect(result.user.email).toStrictEqual(email2);
    expect(result.user.name).toStrictEqual(nameFirst2 + ' ' + nameLast2);

    // fail to update details with invalid nameFirst
    const nameFirst: string = 'a';
    result = requestUserDetailsUpdate(token2, email2, nameFirst, nameLast2) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);

    // check deatil
    result = requestUserDetails(token2) as ResUserDetail;
    expect(result.user.email).toStrictEqual(email2);
    expect(result.user.name).toStrictEqual(nameFirst2 + ' ' + nameLast2);
  });

  test('test1.3: changed password, fail to change details', () => {
    // update password
    const newPassword: string = 'ABc20240610!';
    result = requestUserPasswordUpdate(token2, password2, newPassword) as ResEmpty;
    expect(result).toMatchObject(VALID_EMPTY_RETURN);

    // fail to update detail
    const invalidnameLast2: string = 'a';
    result = requestUserDetailsUpdate(token2, email2, nameFirst2, invalidnameLast2) as ResError;
    expect(result).toMatchObject(ERROR);
    expect(result.status).toStrictEqual(BAD_REQUEST);
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
