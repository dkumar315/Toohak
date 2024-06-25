import { clear } from './other.js';
import {
  adminAuthRegister, adminAuthLogin,
  adminUserDetails, adminUserDetailsUpdate,
  adminUserPasswordUpdate
} from './auth.js';

const VALID_UPDATE_RETURN = {};
const ERROR = { error: expect.any(String) };

beforeAll(() => clear());
afterAll(() => clear());

describe('testing adminUserDetails', () => {
  describe('test1: with 0 registered user, no valid authUserId', () => {
    const invalidAuthUserIds = [0, 1, 2, 3, 9999, -1];
    test.each(invalidAuthUserIds)(
      'test1.0: invalid authUserId = %i', (invalidId) => {
        expect(adminUserDetails(invalidId)).toMatchObject(ERROR);
      }
    );
  });

  describe('test2: 1 registered user', () => {
    let email, password, nameFirst, nameLast, authUserId;
    beforeEach(() => {
      email = 'haydensmith@unsw.edu.au';
      password = 'haydensmith123';
      nameFirst = 'Hayden';
      nameLast = 'Smith';
      const user = adminAuthRegister(email, password, nameFirst, nameLast);
      authUserId = user.authUserId;
    });

    test('test2.1: valid authUserId', () => {
      const expectRes = {
        userId: authUserId,
        name: nameFirst + ' ' + nameLast,
        email: email,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };
      expect(adminUserDetails(authUserId).user).toMatchObject(expectRes);
    });

    test('test2.2: invalid authUserIds (non-existence)', () => {
      clear();
      expect(adminUserDetails(authUserId - 1)).toMatchObject(ERROR);
      expect(adminUserDetails(authUserId + 1)).toMatchObject(ERROR);
    });

    const invalidAuthUserIds = [0, 9999, -1];
    test.each(invalidAuthUserIds)(
      'test2.2: invalid authUserId = %i', (invalidId) => {
        expect(adminUserDetails(invalidId)).toMatchObject(ERROR);
      }
    );
  });

  describe('test3: multiple registered users', () => {
    let user1, email1, password1, nameFirst1, nameLast1, authUserId1;
    let user2, email2, password2, nameFirst2, nameLast2, authUserId2;
    let expectUser1, expectUser2;

    beforeEach(() => {
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

      // userId
      user1 = adminAuthRegister(email1, password1, nameFirst1, nameLast1);
      user2 = adminAuthRegister(email2, password2, nameFirst2, nameLast2);

      authUserId1 = user1.authUserId;
      authUserId2 = user2.authUserId;

      expectUser1 = {
        userId: authUserId1,
        name: nameFirst1 + ' ' + nameLast1,
        email: email1,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };
      expectUser2 = {
        userId: authUserId2,
        name: nameFirst2 + ' ' + nameLast2,
        email: email2,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };
    });

    test('test3.1: with valid authUserIds', () => {
      expect(adminUserDetails(authUserId1).user).toMatchObject(expectUser1);
      expect(adminUserDetails(authUserId2).user).toMatchObject(expectUser2);
    });

    test('test3.2: with invalid authUserIds', () => {
      expect(adminUserDetails(authUserId1 - 1)).toMatchObject(ERROR);
      expect(adminUserDetails(authUserId2 + 1)).toMatchObject(ERROR);
    });

    const invalidAuthUserIds = [0, 9999, -1];
    test.each(invalidAuthUserIds)('test3.2: invalid authUserId = %i', (inValidId) => {
      expect(adminUserDetails(inValidId)).toMatchObject(ERROR);
    });

    test('test3.2: with more authUserIds', () => {
      // user3
      const email3 = 'someone@gmail.com';
      const password3 = 'email1234';
      const nameFirst3 = 'Hello';
      const nameLast3 = 'World';
      const user3 = adminAuthRegister(email3, password3, nameFirst3, nameLast3);
      const authUserId3 = user3.authUserId;

      const expectUser3 = {
        userId: authUserId3,
        name: nameFirst3 + ' ' + nameLast3,
        email: email3,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      };

      expect(adminUserDetails(authUserId3).user).toMatchObject(expectUser3);
      expect(adminUserDetails(authUserId3 + 1)).toMatchObject(ERROR);
    });
  });

  describe('test4: test with authadminLogin', () => {
    let email, password, nameFirst, nameLast, userRegister, authUserId;
    let result;

    beforeEach(() => {
      clear();
      email = 'haydensmith@unsw.edu.au';
      password = 'haydensmith123';
      nameFirst = 'Hayden';
      nameLast = 'Smith';
      userRegister = adminAuthRegister(email, password, nameFirst, nameLast);
      authUserId = userRegister.authUserId;
    });

    test('test4.0: initial before authadminLogin', () => {
      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(1);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('test4.1: fail to login twice', () => {
      adminAuthLogin(email, password + 'invalid');
      adminAuthLogin(email, password + 'invalid');

      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(1);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(2);
    });

    test('test4.2: successfully login twice, then fail to login', () => {
      adminAuthLogin(email, password);
      adminAuthLogin(email, password);
      adminAuthLogin(email, password + 'invalid');

      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(3);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('test4.3: successful, fail the successful to login', () => {
      // successfully login
      adminAuthLogin(email, password);
      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(2);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

      // then fail to login
      adminAuthLogin(email, password + 'invalid');
      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(2);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(1);

      // then successfully login
      adminAuthLogin(email, password);
      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(3);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});

describe('testing adminUserDetailsUpdate', () => {
  let authUserId, email, password, nameFirst, nameLast;
  let result;

  beforeEach(() => {
    clear();
    // user1
    email = 'haydensmith@gmail.com';
    password = 'haydensmith123';
    nameFirst = 'Hayden';
    nameLast = 'Smith';
    const user = adminAuthRegister(email, password, nameFirst, nameLast);
    authUserId = user.authUserId;
  });

  // valid results
  describe('test1: valid results', () => {
    describe('test1.1: valid authUserIds', () => {
      test('test1.1: valid authUserId of single user', () => {
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });

      test('test1.2: valid authUserIds of mutiple users', () => {
        const email2 = 'haydensmith2@gmail.com';
        const psw2 = 'haydensmith2123';
        const nameFirst2 = 'HaydenTwo';
        const nameLast2 = 'SmithTwo';
        const userRegister2 = adminAuthRegister(email2, psw2, nameFirst2, nameLast2);
        const authUserId2 = userRegister2.authUserId;

        result = adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
        result = adminUserDetailsUpdate(authUserId2, email2, nameFirst2, nameLast2);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });
    });

    describe('test1.2: valid emails', () => {
      test('test1.2.1: update email is the same as current user email', () => {
        email = 'haydensmith@gmail.com';
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });

      const emails = ['hay.s2@gmail.com', 'hayd@icloud.com',
        'z5411789@ad.unsw.edu.au', 'h_s@protonmail.com', 'hayden@au@yahoo.com'];
      test.each(emails)('test1.2.2: valid email = \'%s\'', (validEmail) => {
        result = adminUserDetailsUpdate(authUserId, validEmail, nameFirst, nameLast);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });
    });

    describe('test1.3: valid names', () => {
      const names = ['ab', 'abc', 'thisNameNineteenLen', 'thisNameTwentyLength',
        'name has spaces ', '     ', 'ALLUPPERCASE', 'hayden-Smith', 'Hay\'s-name'];

      describe('test1.3.1: valid nameFirst', () => {
        test.each(names)('valid nameFirst = \'%s\'', (validNameFirst) => {
          result = adminUserDetailsUpdate(authUserId, email, validNameFirst, nameLast);
          expect(result).toMatchObject(VALID_UPDATE_RETURN);
        });
      });

      describe('test1.3.2: valid nameLast', () => {
        test.each(names)('valid nameLast = \'%s\'', (validNameLast) => {
          result = adminUserDetailsUpdate(authUserId, email, nameFirst, validNameLast);
          expect(result).toMatchObject(VALID_UPDATE_RETURN);
        });
      });
    });
  });

  describe('test2: invalid results', () => {
    describe('test2.1.1: no user no valid authUserId', () => {
      beforeEach(() => clear());
      const invalidIds = [0, 1, 2, 3];
      test.each(invalidIds)('invalid authUserId = %i', (invalidId) => {
        result = adminUserDetailsUpdate(invalidId, email, nameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
      });
    });

    describe('test2.1.2: invalid authUserIds', () => {
      const invalidIds = [0, 2, 3, 9999, -1];
      test.each(invalidIds)('invalid authUserId = \'%s\'', (invalidId) => {
        result = adminUserDetailsUpdate(invalidId, email, nameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
      });
    });

    // invalid Emails
    describe('test2.2: invalid emails', () => {
      const invalidEmails = ['', 'strings', '12345', 'hi!@mails', '@gmail.com'];
      test.each(invalidEmails)('test2.2.1: invalid email = \'%s\'', (invalidEmail) => {
        result = adminUserDetailsUpdate(authUserId, invalidEmail, nameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
      });

      test('test2.2.2: email used by other users', () => {
        // user2
        const email2 = '078999@gmail.com';
        const psw2 = 'vict078999';
        const nameFirst2 = 'myName';
        const nameLast2 = 'vict';

        const userRegister2 = adminAuthRegister(email2, psw2, nameFirst2, nameLast2);
        const authUserId2 = userRegister2.authUserId;

        result = adminUserDetailsUpdate(authUserId, email2, nameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
        const result2 = adminUserDetailsUpdate(authUserId2, email, nameFirst2, nameLast2);
        expect(result2).toMatchObject(ERROR);
      });
    });
  });

  describe('test2.3: invalid names', () => {
    const invalidNames = ['a', '1', ' ', 'includesnumber1', '123',
      'abc! specail char', 'str?12', '!@#$%^&*()_+=[]', '{}\\|;:\'",.<>?/',
      'there is twoOne words', 'overoveroveroverLoooooooogName'];

    describe('test2.3.1: invalid nameFirst', () => {
      test.each(invalidNames)('invalid nameFirst = \'%s\'', (invalidNameFirst) => {
        result = adminUserDetailsUpdate(authUserId, email, invalidNameFirst, nameLast);
        expect(result).toMatchObject(ERROR);
      });
    });

    describe('test2.3.2: invalid nameLast', () => {
      test.each(invalidNames)('invalid nameLast = \'%s\'', (invalidNameLast) => {
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, invalidNameLast);
        expect(result).toMatchObject(ERROR);
      });
    });
  });
});

describe('testing adminUserPasswordUpdate', () => {
  let authUserId, password, newPassword;
  let newPasswords = [];
  let result;

  beforeEach(() => {
    clear();

    // user1
    password = 'haydensmith123';
    newPassword = '321haydensmith';
    const email = 'haydensmith@gmail.com';
    const nameFirstirst = 'Hayden';
    const nameLastast = 'Smith';
    const user = adminAuthRegister(email, password, nameFirstirst, nameLastast);
    authUserId = user.authUserId;
  });

  describe('test1: valid results', () => {
    describe('test1.1.0: valid authUserId, valid newPassword', () => {
      newPasswords = ['haydensnewpassword0', 'haydenSmith123', 'h1ydensmithabc'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validId) => {
        result = adminUserPasswordUpdate(authUserId, password, validId);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });
    });

    describe('test1.1.0: valid newPassword, check substrings', () => {
      newPasswords = ['abcd1234', 'abcd123456', 'abcd12345'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validId) => {
        result = adminUserPasswordUpdate(authUserId, password, validId);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });
    });

    describe('test1.2.1: valid newPassword, change for mutiple times', () => {
      newPasswords = Array.from({ length: 8 }, (_, i) => 'haydensnewPassword' + i);
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = adminUserPasswordUpdate(authUserId, password, validPassword);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });
    });

    describe('test1.2.2: valid newPassword, just meet the requirement', () => {
      newPasswords = ['this8Len', 'only1number', '11111l', 'C8PTICAL'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = adminUserPasswordUpdate(authUserId, password, validPassword);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });
    });

    describe('test1.2.3: valid newPassword, with special characters', () => {
      newPasswords = ['this password has space', 'password!!!!', '#d4af37ToDo',
        'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-'];
      test.each(newPasswords)('valid newPassword = \'%s\'', (validPassword) => {
        result = adminUserPasswordUpdate(authUserId, password, validPassword);
        expect(result).toMatchObject(VALID_UPDATE_RETURN);
      });
    });

    describe('test1.2.4: valid authUserId with mutiple users', () => {
      // user2
      const password2 = 'vict078999';
      const email2 = '0789@gmail.com';
      const nameFirst2 = 'name';
      const nameLast2 = 'vict';
      const user2 = adminAuthRegister(email2, password2, nameFirst2, nameLast2);
      const authUserId2 = user2.authUserId;

      test('authUserId with 2 users', () => {
        const res1 = adminUserPasswordUpdate(authUserId, password, password2);
        expect(res1).toMatchObject(VALID_UPDATE_RETURN);

        const res2 = adminUserPasswordUpdate(authUserId2, password2, password);
        expect(res2).toMatchObject(VALID_UPDATE_RETURN);
      });

      test('authUserId with 3 users', () => {
        // user3
        const password3 = 'vict078999';
        const email3 = '07899@gmail.com';
        const nameFirst3 = 'name';
        const nameLast3 = 'vict';
        const user3 = adminAuthRegister(email3, password3, nameFirst3, nameLast3);
        const authUserId3 = user3.authUserId;

        const res3 = adminUserPasswordUpdate(authUserId3, password3, password2);
        expect(res3).toMatchObject(VALID_UPDATE_RETURN);
      });
    });
  });

  describe('test2: invalid results', () => {
    describe('test2.1.0: invalid authUserId, no user exist', () => {
      beforeEach(() => clear());
      const invalidIds = [0, 1, 2, 3, 9999, -1];
      test.each(invalidIds)('invalid authUserId = %i', (invalidId) => {
        result = adminUserPasswordUpdate(invalidId, password, newPassword);
        expect(result).toMatchObject(ERROR);
      });
    });

    describe('test2.1.1: invalid authUserIds, incorrect authUserId input', () => {
      const invalidIds = [0, 2, 3, 9999, -1];
      test.each(invalidIds)('invalid authUserId = \'%s\'', (invalidId) => {
        result = adminUserPasswordUpdate(invalidId, password, newPassword);
        expect(result).toMatchObject(ERROR);
      });
    });

    describe('test2.2: invalid oldPasswords', () => {
      test('test2.2.1: old password is empty', () => {
        result = adminUserPasswordUpdate(authUserId, '', newPassword);
        expect(result).toMatchObject(ERROR);
      });

      test('test2.2.2: old password is the new password', () => {
        result = adminUserPasswordUpdate(authUserId, newPassword, newPassword);
        expect(result).toMatchObject(ERROR);
      });

      test('test2.2.3: password match other user\'s', () => {
        // user2
        const password2 = 'vict078999';
        const email2 = '0789@gmail.com';
        const nameFirst2 = 'name';
        const nameLast2 = 'vict';
        adminAuthRegister(email2, password2, nameFirst2, nameLast2);
        result = adminUserPasswordUpdate(authUserId, password2, newPassword);
        expect(result).toMatchObject(ERROR);
      });
    });

    describe('test2.3: invalid newPasswords', () => {
      test('test2.3.1: newPassword equals to oldPassword', () => {
        result = adminUserPasswordUpdate(authUserId, password, password);
        expect(result).toMatchObject(ERROR);
      });

      test('test2.3.2: newPassword used before', () => {
        adminUserPasswordUpdate(authUserId, password, newPassword);
        result = adminUserPasswordUpdate(authUserId, newPassword, password);
        expect(result).toMatchObject(ERROR);
      });

      describe('test2.3.4: mutiple newPasswords used before', () => {
        newPasswords = ['thisLen8', 'only1number', '1111111l', 'C8PTICAL', 'AAAA1AAAA',
          'this password has space0', 'password111!!!!!', 'a0!@#$%^&*()_+=[]',
          '     0V0    ', 'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-',
          '#d4af37ToDo'];

        test.each(newPasswords)(
          'test2.3.3: newPassword = last changed = \'%s\'', (newPassword) => {
            result = adminUserPasswordUpdate(authUserId, password, newPassword);
            expect(result).toMatchObject(VALID_UPDATE_RETURN);
            // newPassword as last changed
            result = adminUserPasswordUpdate(authUserId, newPassword, password);
            expect(result).toMatchObject(ERROR);
            password = newPassword;
          }
        );
      });
    });
  });

  describe('test2.3.4: new password length incorrect', () => {
    newPasswords = ['', 'a1', '!', 'its7Len', '012345', 'abc', ' ', 'abc123!'];
    test.each(newPasswords)('invalid newPassword = \'%s\'', (newPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, newPassword);
      expect(result).toMatchObject(ERROR);
    });
  });

  describe('test2.3.5: new password not as require', () => {
    newPasswords = ['12345678', 'abcdefghijk', '!@#$%^&*()_+=[]', 'EEEEEEEEE'];
    test.each(newPasswords)('invalid newPassword = \'%s\'', (newPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, newPassword);
      expect(result).toMatchObject(ERROR);
    });
  });
});

describe('testing adminUser', () => {
  let email1, password1, nameFirst1, nameLast1, authUserId1;
  let email2, password2, nameFirst2, nameLast2, authUserId2;
  let result;

  beforeEach(() => {
    clear();
    // user1
    email1 = 'haydensmith@gmail.com';
    password1 = 'haydensmith123';
    nameFirst1 = 'Hayden';
    nameLast1 = 'Smith';
    const user1 = adminAuthRegister(email1, password1, nameFirst1, nameLast1);
    authUserId1 = user1.authUserId;

    // user2
    password2 = 'vict078999';
    email2 = '0789@gmail.com';
    nameFirst2 = 'name';
    nameLast2 = 'vict';
    const user2 = adminAuthRegister(email2, password2, nameFirst2, nameLast2);
    authUserId2 = user2.authUserId;
  });

  afterAll(() => {
    clear();
  });

  test('test1.0: check details, and then update details and password', () => {
    // check detail and update detail
    result = adminUserDetails(authUserId1).user;
    expect(result.userId).toStrictEqual(authUserId1);
    expect(result.email).toStrictEqual(email1);
    expect(result.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);

    email1 = 'haydensmith2@ad.unsw.edu.au';
    nameFirst1 = 'Hayden-new';
    nameLast1 = 'Smith-new';
    result = adminUserDetailsUpdate(authUserId1, email1, nameFirst1, nameLast1);

    // (update detail) and check detail
    result = adminUserDetails(authUserId1).user;
    expect(result.userId).toStrictEqual(authUserId1);
    expect(result.email).toStrictEqual(email1);
    expect(result.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);

    // (update detail, check detail) and update password
    const newPassword = 'haydensnewpassword0';
    result = adminUserPasswordUpdate(authUserId1, password1, newPassword);
    expect(result).toMatchObject(VALID_UPDATE_RETURN);
    password1 = newPassword;

    // (update password) and update detail
    email1 = 'haydensmith3@ad.unsw.edu.au';
    nameFirst1 = 'Hayden-new-new';
    nameLast1 = 'Smith-new-new';
    result = adminUserDetailsUpdate(authUserId1, email1, nameFirst1, nameLast1);

    // (update password, update detail) and check detail
    result = adminUserDetails(authUserId1).user;
    expect(result.userId).toStrictEqual(authUserId1);
    expect(result.email).toStrictEqual(email1);
    expect(result.name).toStrictEqual(nameFirst1 + ' ' + nameLast1);
  });

  test('test1.1: failed on changing password and rechanging', () => {
    // update password
    const invalidnewPassword = 'abc';
    result = adminUserPasswordUpdate(authUserId1, password1, invalidnewPassword);
    expect(result).toMatchObject(ERROR);

    // update password
    const newPassword = 'haydensnewpassword0';
    result = adminUserPasswordUpdate(authUserId1, password1, newPassword);
    expect(result).toMatchObject(VALID_UPDATE_RETURN);
  });

  test('test1.2: fail to change details', () => {
    // check deatil
    result = adminUserDetails(authUserId2);
    expect(result.user.userId).toStrictEqual(authUserId2);
    expect(result.user.email).toStrictEqual(email2);
    expect(result.user.name).toStrictEqual(nameFirst2 + ' ' + nameLast2);

    // fail to update details with invalid nameFirst
    const nameFirst = 'a';
    result = adminUserDetailsUpdate(authUserId2, email2, nameFirst, nameLast2);
    expect(result).toMatchObject(ERROR);

    // check deatil
    result = adminUserDetails(authUserId2);
    expect(result.user.userId).toStrictEqual(authUserId2);
    expect(result.user.email).toStrictEqual(email2);
    expect(result.user.name).toStrictEqual(nameFirst2 + ' ' + nameLast2);
  });

  test('test1.3: changed password, fail to change details', () => {
    // update password
    const newPassword = 'ABc20240610!';
    result = adminUserPasswordUpdate(authUserId2, password2, newPassword);
    expect(result).toMatchObject(VALID_UPDATE_RETURN);

    // fail to update detail
    const invalidnameLast2 = 'a';
    result = adminUserDetailsUpdate(authUserId2, email2, nameFirst2, invalidnameLast2);
    expect(result).toMatchObject(ERROR);
  });
});
