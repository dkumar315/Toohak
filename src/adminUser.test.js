import { clear } from './other.js';
import { 
  adminAuthRegister, adminAuthLogin, 
  adminUserDetails, adminUserDetailsUpdate,
  adminUserPasswordUpdate 
} from './auth.js';


// testing adminUserDetails
/**
  * adminUserDetails
  * { authUserId }
  * valid: { object }
  * invalid: { object }
**/
describe('testing adminUserDetails', () => {
  let expectError;

  beforeAll(() => clear());
  
  beforeEach(() => {
    expectError = {error:'invalid authUserId'};
  });

  // afterAll(() => clear());

  describe('test1: with 0 registered user, no valid authUserId', () => {
    const invalidAuthUserIds = [0, 1, 2, 3, 9999, -1];
    test.each(invalidAuthUserIds)(
      'test1.0: with invalid authUserId = %i', (invalidId) => {
        expect(adminUserDetails(invalidId)).toMatchObject(expectError);
    });
  });

  describe('test2: with 1 registered user', () => {
    let email, password, nameFirst, nameLast, userRegister, authUserId;

    beforeEach(() => {
      email = 'haydensmith@unsw.edu.au';
      password = 'haydensmith123';
      nameFirst = 'Hayden';
      nameLast = 'Smith';
      userRegister = adminAuthRegister(email, password, nameFirst, nameLast);
      authUserId = userRegister.authUserId;
    });

    test('test2.1: with valid authUserId', () => {
      const expectRes = {
        userId: authUserId,
        name: nameFirst + ' ' + nameLast,
        email: email,
        numSuccessfulLogins: 0,
        numFailedPasswordsSinceLastLogin: 0
      };
      expect(adminUserDetails(authUserId).user).toMatchObject(expectRes);
    });

    test('test2.2: with invalid authUserId', () => {
      expect(adminUserDetails(authUserId - 1)).toMatchObject(expectError);
      expect(adminUserDetails(authUserId + 1)).toMatchObject(expectError);
    });

    const invalidAuthUserIds = [0, 9999, -1];
    test.each(invalidAuthUserIds)(
      `test2.2: with non-existent (invalid) authUserId = %i`, (invalidId) => {
        expect(adminUserDetails(invalidId)).toMatchObject(expectError);
    });
  });

  describe('test3: with 2 registered users (multiple users)', () => {
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
        numSuccessfulLogins: 0,
        numFailedPasswordsSinceLastLogin: 0,
      };
      expectUser2 = {
        userId: authUserId2,
        name: nameFirst2 + ' ' + nameLast2,
        email: email2,
        numSuccessfulLogins: 0,
        numFailedPasswordsSinceLastLogin: 0,
      };
    });

    test('test3.1: with valid authUserIds', () => {
      expect(adminUserDetails(authUserId1).user).toMatchObject(expectUser1);
      expect(adminUserDetails(authUserId2).user).toMatchObject(expectUser2);
    });

    test('test3.2: with invalid authUserIds', () => {
      expect(adminUserDetails(authUserId1 - 1)).toMatchObject(expectError);
      expect(adminUserDetails(authUserId2 + 1)).toMatchObject(expectError);
    });

    const invalidAuthUserIds = [0, 9999, -1];
    test.each(invalidAuthUserIds)(
      'test3.2: with invalid authUserId = %i', (inValidId) => {
      expect(adminUserDetails(inValidId)).toMatchObject(expectError);
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
      expect(result.numSuccessfulLogins).toStrictEqual(0);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('test4.1: fail to login twice', () => {
      adminAuthLogin(email, password + 'invalid');
      adminAuthLogin(email, password + 'invalid');

      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(0);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(2);
    });
    
    test('test4.2: successfully login twice, then fail to log in once', () => {
      adminAuthLogin(email, password);
      adminAuthLogin(email, password);
      adminAuthLogin(email, password + 'invalid');

      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(2);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('test4.3: successfully login once, fail to login once and successfully login', () => {
      // successfully login
      adminAuthLogin(email, password);
      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(1);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

      // then fail to login
      adminAuthLogin(email, password + 'invalid');
      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(1);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(1);

      // then successfully login
      adminAuthLogin(email, password);
      result = adminUserDetails(authUserId).user;
      expect(result.numSuccessfulLogins).toStrictEqual(2);
      expect(result.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

    });
  });
});


// testing adminUserDetailsUpdate
/**
  * adminUserDetailsUpdate
  * {authUserId, email, nameFirst, nameLast}
  * valid: {}
  * invalid: {error: 'specific error message here'}
**/
describe('testing adminUserDetailsUpdate', () => {
  const expectValid0 = {};
  const expectError1 = {error:'invalid authUserId'};
  const expectError2 = {error:'invalid email'};
  const expectError3 = {error:'invalid nameFirst'};
  const expectError4 = {error:'invalid nameLast'};

  let authUserId;
  let email;
  let psw;
  let nameFirst;
  let nameLast;
  let result;

  beforeEach(() => {
    clear();

    // user1
    email = 'haydensmith@gmail.com';
    psw = 'haydensmith123';
    nameFirst = 'Hayden';
    nameLast = 'Smith';
    const userRegister = adminAuthRegister(email, psw, nameFirst, nameLast);
    authUserId = userRegister.authUserId;
  });

  afterAll(() => {
    clear();
  });

  // valid results
  describe('test1: valid results', () => {
    // valid authUserId
    describe('test1.1: valid authUserId', () => {
      test('test1.1: valid authUserId', () => {
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast);
        expect(result).toMatchObject(expectValid0);
      });
      test('test1.2: valid authUserId of mutiple user', () => {
        const email2 = 'haydensmith2@gmail.com';
        const psw2 = 'haydensmith2123';
        const nameFirst2 = 'HaydenTwo';
        const nameLast2 = 'SmithTwo';
        const userRegister2 = adminAuthRegister(email2, psw2, nameFirst2, nameLast2);
        const authUserId2 = userRegister2.authUserId;
        
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast);
        expect(result).toMatchObject(expectValid0);
        result = adminUserDetailsUpdate(authUserId2, email2, nameFirst2, nameLast2);
        expect(result).toMatchObject(expectValid0);
      });
    });

    describe('test1.2: valid emails (includes same email of current user)', () => {
      const emails = ['haydensmith@gmail.com', 'hay.s2@gmail.com', 'hayd@icloud.com',
        'z5411789@ad.unsw.edu.au', 'h_s@protonmail.com', 'hayden@au@yahoo.com'];
      
      test.each(emails)('test1.2: valid emails %s', (validEmail) => {
        result = adminUserDetailsUpdate(authUserId, validEmail, nameFirst, nameLast);
        expect(result).toMatchObject(expectValid0);
      });
    });

    // valid names
    describe('test1.3: valid names', () => {
      const names = ['ab', 'abc', 'thisNameNineteenLen', 'thisNameTwentyLength',
        'name has spaces ', '     ', 'ALLUPPERCASE', 'hayden-Smith', 'Hay\'s-name'];

      describe('test1.3.1: valid nameFirst', () => {
        test.each(names)('test1.3.1: valid nameFirst = %s', (validNameFirst) => {
          result = adminUserDetailsUpdate(authUserId, email, validNameFirst, nameLast);
          expect(result).toMatchObject(expectValid0);
        });
      });

      describe('test1.3.1: valid nameLast', () => {
        test.each(names)('test1.3: valid nameLast = %s', (validNameLast) => {
          result = adminUserDetailsUpdate(authUserId, email, nameFirst, validNameLast);
          expect(result).toMatchObject(expectValid0);
        });
      });
    });
  });

  describe('test2: invalid results', () => {
    // invalid Ids
    describe('test2.1.1: no user (invalid authUserId)',() => {
      beforeEach(() => clear());
      const invalidIds = [0, 1, 2, 3];
      test.each(invalidIds)(
        'test2.1.2: no user (invalid authUserId = %i)', (invalidId) => {
        result = adminUserDetailsUpdate(invalidId, email, nameFirst, nameLast);
        expect(result).toMatchObject(expectError1);
      });
    });

    describe('test2.1.2: invalid authUserId',() => {
      const invalidIds = [0, 2, 3, 9999, -1];
      test.each(invalidIds)('test2.1: invalid authUserId = %s', (invalidId) => {
        result = adminUserDetailsUpdate(invalidId, email, nameFirst, nameLast);
        expect(result).toMatchObject(expectError1);
      });
    });

    // invalid Emails
    describe('test2.2: invalid emails',() => {
      const invalidEmails = ['', 'strings', '12345', 'hi!@mails', '@gmail.com'];
      test.each(invalidEmails)('test2.2: invalid emails = %s', (invalidEmail) => {
        result = adminUserDetailsUpdate(authUserId, invalidEmail, nameFirst, nameLast);
        expect(result).toMatchObject(expectError2);
      });
    });
    // invalid used email
    test('test2.2.2: (invalid) Email Used by other users', () => {
      // user2
      const email2 = '078999@gmail.com';
      const psw2 = 'vict078999';
      const nameFirst2 = 'myName';
      const nameLast2 = 'vict';
      let userRegister2;

      userRegister2 = adminAuthRegister(email2, psw2, nameFirst2, nameLast2);
      const authUserId2 = userRegister2.authUserId;

      result = adminUserDetailsUpdate(authUserId, email2, nameFirst, nameLast);
      expect(result).toMatchObject(expectError2);
      const result2 = adminUserDetailsUpdate(authUserId2, email, nameFirst2, nameLast2);
      expect(result2).toMatchObject(expectError2);
    });

    // invalid Names
    describe('test2.3: invalid names', () => {
      const invalidNames = ['a', '1', ' ', 'includesnumber1', '123', 
        'abc! specail char', 'str?12', '!@#$%^&*()_+=[]', '{}\\|;:\'",.<>?/', 
        'there is twoOne words', 'overoveroveroverLoooooooogName'];

      describe('test1.3.1: invalid nameFirst', () => {
        test.each(invalidNames)('test2.3: invalid nameFirst = %s', (invalidNameFirst) => {
          result = adminUserDetailsUpdate(authUserId, email, invalidNameFirst, nameLast);
          expect(result).toMatchObject(expectError3);
        });
      });
      
      describe('test1.3.1: invalid nameLast', () => {
        test.each(invalidNames)('test2.3: invalid nameLast = %s', (invalidNameLast) => {
          result = adminUserDetailsUpdate(authUserId, email, nameFirst, invalidNameLast);
          expect(result).toMatchObject(expectError4);
        });
      });
    });
  });
});


// testing adminUserPasswordUpdate
/**
  * adminUserPasswordUpdate
  * {authUserId, oldPassword, newPassword}
  * valid: {}
  * invalid: {error: 'specific error message here'}
**/
describe('testing adminUserPasswordUpdate', () => {
  const expectValid0 = {};
  const expectError1 = {error:'invalid authUserId'};
  const expectError2 = {error:'invalid oldPassword'};
  const expectError3 = {error:'invalid newPassword'};

  let password;
  let newPassword;
  let newPasswords;
  let result;
  let authUserId;

  beforeAll(() => clear());
  
  beforeEach(() => {
    clear();

    // user1
    password = 'haydensmith123';
    newPassword = '321haydensmith'
    const email = 'haydensmith@gmail.com';
    const nameFirstirst = 'Hayden';
    const nameLastast = 'Smith'
    authUserId = adminAuthRegister(email, password, nameFirstirst, nameLastast).authUserId;

    newPasswords = [];
  });

  afterAll(() => clear());

  describe('test1: with 0 registered user, no valid authUserId', () => {
    beforeEach(() => clear());
    const invalidAuthUserIds = [0, 1, 2, 3, 9999, -1];
    test.each(invalidAuthUserIds)(
      'test1.0: with invalid authUserId = %i', (invalidId) => {
        expect(adminUserDetails(invalidId)).toMatchObject(expectError1);
    });
  });

  // valid results
  describe('test1.1.0: valid authUserId, valid newPassword', () => {
    newPasswords = ['haydensnewpassword0', 'haydenSmith123', 'h1ydensmithabc'];
    test.each(newPasswords)('(valid) authUserId = %s', (validId) => {
      result = adminUserPasswordUpdate(authUserId, password, validId);
      expect(result).toMatchObject(expectValid0);
    });
  });

  describe('test1.2.1: (valid) newPassword change for mutiple times', () => {
    newPasswords = Array.from({ length: 8 }, (_, i) => 'haydensnewPassword' + i);
    test.each(newPasswords)('(valid) newPassword = %s', (validPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, validPassword);
      expect(result).toMatchObject(expectValid0);
    });
  });

  describe('test1.2.2: (valid) newPassword exactly meet the requirement', () => {
    newPasswords = ['this8Len', 'only1number', '11111l', 'C8PTICAL'];
    test.each(newPasswords)('(valid) newPassword = %s', (validPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, validPassword);
      expect(result).toMatchObject(expectValid0);
    });
  });

  describe('test1.2.3: (valid) newPassword with special characters', () => {
    newPasswords = ['this password has space', 'password!!!!', 'a0!@#$%^&*()_+=[]',
     'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-', '#d4af37ToDo'];
    test.each(newPasswords)('(valid) newPassword = %s', (validPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, validPassword);
      expect(result).toMatchObject(expectValid0);
    });
  });

  describe('test1.2.4: valid authUserId with 2 users', () => {
    // user2
    const password2 = 'vict078999';
    const email2 = '0789@gmail.com';
    const nameFirstirst2 = 'name';
    const nameLastast2 = 'vict';
    const userId2 = adminAuthRegister(email2, password2, nameFirstirst2, nameLastast2).authUserId;

    test('test1.2.4: valid authUserId with 2 users', () => {
      const res2 = adminUserPasswordUpdate(userId2, password2, password);
      expect(res2).toMatchObject(expectValid0);
    })
  });

  // invalid results
  // invalid Ids
  describe('test2.1.0: (invalid authUserId) incorrect authUserId input',() => {
    const invalidIds = [0, 2, 3, 9999, -1];
    test.each(newPasswords)('(invalid) authUserId = %s', (invalidId) => {
      result = adminUserPasswordUpdate(invalidId, password, newPassword);
      expect(result).toMatchObject(expectError1);
    });
  });
  
  describe('test2.1.2: (invalid authUserId) no user',() => {
    beforeEach(() => clear());
    const invalidIds = [0, 1, 2, 3, 9999, -1];
    test.each(invalidIds)('(invalid) no user, authUserId = %i', (invalidId) => {
      result = adminUserPasswordUpdate(invalidId, password, newPassword);
      expect(result).toMatchObject(expectError1);
    });
  });

  describe('test2.2.0: (invalid oldPassword) old password not match user password',() => {
    test('test2.2.0: (invalid oldPassword) old password undefinded',() => {
      result = adminUserPasswordUpdate(authUserId, undefined, newPassword);
      expect(result).toMatchObject(expectError2);
    });
    test('test2.2.0: (invalid oldPassword) old password is empty',() => {
      result = adminUserPasswordUpdate(authUserId, '', newPassword);
      expect(result).toMatchObject(expectError2);
    });
    test('test2.2.0: (invalid oldPassword) old password is the new password',() => {
      result = adminUserPasswordUpdate(authUserId, newPassword, newPassword);
      expect(result).toMatchObject(expectError2);
    });
  });

  describe('test2.2.1: (invalid oldPassword) password match other user\'s',() => {
    // user2
    const password2 = 'vict078999';
    const email2 = '0789@gmail.com';
    const nameFirstirst2 = 'name';
    const nameLastast2 = 'vict';
    const user2 = adminAuthRegister(email2, password2, nameFirstirst2, nameLastast2).authUserId;

    test('test2.2.1: (invalid oldPassword) password match other user\'s', () => {
      result = adminUserPasswordUpdate(authUserId, password2, newPassword);
      expect(result).toMatchObject(expectError2);
    })
  });

  describe('test2.3.1: (invalid newPassword) password equal oldPassword',() => {
    test('test2.3.1: (invalid) newPassword equal oldPassword',() => {
      result = adminUserPasswordUpdate(authUserId, password, password);
      expect(result).toMatchObject(expectError3);
    });
  });

  describe('test2.3.2: (invalid newPassword) newPassword used before',() => {
    test('test2.3.2: (invalid) newPassword used before',() => {
      adminUserPasswordUpdate(authUserId, password, newPassword);
      result = adminUserPasswordUpdate(authUserId, newPassword, password);
      expect(result).toMatchObject(expectError3);
    });
  });

  describe('test2.3.3: (invalid) newPassword used before',() => {
    newPasswords = ['thisLen8', 'only1number', '1111111l', 'C8PTICAL', 'AAAA1AAAA',
      'this password has space0', 'password111!!!!!', 'a0!@#$%^&*()_+=[]', 
      '     0V0    ', 'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-', 
      '#d4af37ToDo'];

    test.each(newPasswords)(
      'test2.3.3: (invalid) newPassword as last changed = %s', (newPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, newPassword);
      expect(result).toMatchObject(expectValid0);
      // newPassword as last changed
      result = adminUserPasswordUpdate(authUserId, newPassword, password);
      expect(result).toMatchObject(expectError3);
      password = newPassword;
    });
  });

  describe('test2.3.4: (invalid newPassword) new password length incorrect',() => {
    newPasswords = ['', 'a1', '!', 'its7Len', '012345', 'abc', ' ', 'abc123!'];
    test.each(newPasswords)(
      '(invalid) newPassword = %s', (newPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, newPassword);
      expect(result).toMatchObject(expectError3);
    });
  });

  // invalid: when new password not contains at least (one number and one letter)
  describe('test2.3.5: (invalid newPassword) new password not as require',() => {
    newPasswords = ['12345678', 'abcdefghijk', '!@#$%^&*()_+=[]', 'EEEEEEEEE'];
    test.each(newPasswords)(
      '(invalid) newPassword = %s', (newPassword) => {
      result = adminUserPasswordUpdate(authUserId, password, newPassword);
      expect(result).toMatchObject(expectError3);
    });
  });
});


// testing All adminUser
/**
  * adminUser
  * adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate
  * valid: {object}, {}, {}
  * invalid: {error: 'specific error message here'}
**/
describe('testing adminUser', () => {
  let email1, password1, nameFirst1, nameLast1, userId1, authUserId1, res1;
  let email2, password2, nameFirst2, nameLast2, userId2, authUserId2, res2;

  const expectUpdateValid = {};
  const expectAuthIdError = {error:'invalid authUserId'};
  const expectEmaillError = {error:'invalid email'};
  const expectnameFirstError = {error:'invalid nameFirst'};
  const expectnameLastError = {error:'invalid nameLast'};
  const expectOldpasswordError = {error:'invalid oldPassword'};
  const expectnewPasswordError = {error:'invalid newPassword'};

  let result;

  beforeEach(() => {
    clear();

    // user1
    email1 = 'haydensmith@gmail.com';
    password1 = 'haydensmith123';
    nameFirst1 = 'Hayden';
    nameLast1 = 'Smith';
    userId1 = adminAuthRegister(email1, password1, nameFirst1, nameLast1).authUserId;
    authUserId1 = userId1;

    // user2
    password2 = 'vict078999';
    email2 = '0789@gmail.com';
    nameFirst2 = 'name';
    nameLast2 = 'vict';
    userId2 = adminAuthRegister(email2, password2, nameFirst2, nameLast2).authUserId;
    authUserId2 = userId2;
  });

  afterAll(() => {
    clear();
  });

  test('test1.0: check details, and then update details and password', () => {
    // check detail and update detail
    result = adminUserDetails(userId1);
    expect(result.user.userId).toBe(authUserId1);
    expect(result.user.email).toBe(email1);
    expect(result.user.name).toBe(nameFirst1 + ' ' + nameLast1);

    let email1New = 'haydensmith2@ad.unsw.edu.au';
    let nameFirst1New = 'Hayden-new';
    let nameLast1New = 'Smith-new';
    result = adminUserDetailsUpdate(authUserId1, email1New, nameFirst1New, nameLast1New);

    // (update detail) and check detail
    result = adminUserDetails(userId1);
    expect(result.user.userId).toBe(authUserId1);
    expect(result.user.email).toBe(email1New);
    expect(result.user.name).toBe(nameFirst1New + ' ' + nameLast1New);

    // (update detail, check detail) and update password
    const newPassword = 'haydensnewpassword0';
    result = adminUserPasswordUpdate(authUserId1, password1, newPassword);
    expect(result).toMatchObject(expectUpdateValid);
    password1 = newPassword;

    // (update password) and update detail
    email1New = 'haydensmith3@ad.unsw.edu.au';
    nameFirst1New = 'Hayden-new-new';
    nameLast1New = 'Smith-new-new';
    result = adminUserDetailsUpdate(authUserId1, email1New, nameFirst1New, nameLast1New);

    // (update password, update detail) and check detail
    result = adminUserDetails(userId1);
    expect(result.user.userId).toBe(authUserId1);
    expect(result.user.email).toBe(email1New);
    expect(result.user.name).toBe(nameFirst1New + ' ' + nameLast1New);
  });

  test('test1.1: failed on changing password and rechanging', () => {
    // update password
    const invalidnewPassword = 'abc';
    result = adminUserPasswordUpdate(authUserId1, password1, invalidnewPassword);
    expect(result).toMatchObject(expectnewPasswordError);

    // update password
    const newPassword = 'haydensnewpassword0';
    result = adminUserPasswordUpdate(authUserId1, password1, newPassword);
    expect(result).toMatchObject(expectUpdateValid);
  });

  test('test1.2: fail to change details', () => {
    // check deatil
    result = adminUserDetails(userId2);
    expect(result.user.userId).toBe(authUserId2);
    expect(result.user.email).toBe(email2);
    expect(result.user.name).toBe(nameFirst2 + ' ' + nameLast2);

    // fail to update details
    const invalidNameFirst = 'a';
    result = adminUserDetailsUpdate(userId2, email2, invalidNameFirst, nameLast2);
    expect(result).toMatchObject(expectnameFirstError);

    // check deatil
    result = adminUserDetails(userId2);
    expect(result.user.userId).toBe(authUserId2);
    expect(result.user.email).toBe(email2);
    expect(result.user.name).toBe(nameFirst2 + ' ' + nameLast2);
  });

  test('test1.3: changed password, fail to change details', () => {
    // update password
    const newPassword = 'ABc20240610!';
    result = adminUserPasswordUpdate(authUserId2, password2, newPassword);
    expect(result).toMatchObject(expectUpdateValid);

    // fail to update detail
    const invalidnameLast2 = 'a';
    result = adminUserDetailsUpdate(userId2, email2, nameFirst2, invalidnameLast2);
    expect(result).toMatchObject(expectnameLastError);

  });
});
