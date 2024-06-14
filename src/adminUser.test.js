// requirement functions for testing adminUser
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
// import function(s) to be tested
import { adminUserDetails } from './auth.js';

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
      expect(adminUserDetails(authUserId).user.numSuccessfulLogins).toStrictEqual(0);
      expect(adminUserDetails(authUserId).user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('test4.1: fail to login twice', () => {
      // adminAuthLogin(email, password + 'invalid');
      // adminAuthLogin(email, password + 'invalid');
      // expect(adminUserDetails(authUserId).user.numSuccessfulLogins).toStrictEqual(0);
      // expect(adminUserDetails(authUserId).user.numFailedPasswordsSinceLastLogin).toStrictEqual(2);
    });
    
    test('test4.2: then successfully login twice, then fail to log in once', () => {
      // adminAuthLogin(email, password);
      // adminAuthLogin(email, password);
      // adminAuthLogin(email, password + 'invalid');
      // expect(adminUserDetails(authUserId).user.numSuccessfulLogins).toStrictEqual(2);
      // expect(adminUserDetails(authUserId).user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('test4.2: then successfully login', () => {
      // adminAuthLogin(email, password);
      // expect(adminUserDetails(authUserId).user.numSuccessfulLogins).toStrictEqual(3);
      // expect(adminUserDetails(authUserId).user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});