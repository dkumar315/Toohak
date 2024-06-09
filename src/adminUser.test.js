// requirement functions for testing adminUser
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
// import function(s) to be tested
import { adminUserDetails, adminUserDetailsUpdate } from './auth.js';
/**
  * changes: update for iteration1
  * last commit: `git rev-parse @`
  * 7147f046f85bafd955ad46089c253297cc951d72 (master)
  * 34e4dd0cb3c22b62a3e97e105c0ed557de057a45
*

// todo: export functions in auth.js

/**
  * adminUserDetailsUpdate
  * {authUserId, email, nameFirst, nameLast}
  * valid: {}
  * invalid: {error: 'specific error message here'}
**/
// testing adminUserDetailsUpdate
describe('testing adminUserDetailsUpdate', () => {
  beforeEach(() => {
    clear();
    const expectValid0 = {};
    const expectError1 = {error:'invalid authUserId'};
    const expectError2 = {error:'invalid email'};
    const expectError3 = {error:'invalid nameFirst'};
    const expectError4 = {error:'invalid nameLast'};

    // user1
    const email = 'haydensmith@gmail.com';
    const psw = 'haydensmith123';
    const nameFirst = 'Hayden';
    const nameLast = 'Smith';
    const userRegister = adminAuthRegister(email, psw, nameFirst, nameLast);
    const authUserId = userRegister.authUserId;

    let result;
  });

  afterAll(() => {
    clear();
  });

  test('valid result', () => {
    // valid email (includes same email)
    const emails = ['haydensmith@gmail.com', 'hay.s2@gmail.com', 'hayd@icloud.com',
      'z5411789@ad.unsw.edu.au', 'h_s@protonmail.com', 'hayden@au@yahoo.com'];
    emails.forEach((ele) => {
      test('test with valid email ${ele}', () => {
        result = adminUserDetailsUpdate(authUserId, ele, nameFirst, nameLast);
        expect(result).toMatchObject(expectValid0);
      });
    });

    // valid name
    const names = ['abc', 'thisNameNineteenLen', 'name has spaces ', '     ',
      'ALLUPPERCASE', 'hayden-Smith', 'Hayden\'sname', 'all Names\' Com-bo'];
    names.forEach((ele) => {
      test('test with valid nameFirst ${ele}', () => {
        result = adminUserDetailsUpdate(authUserId, email, ele, nameLast);
        expect(result).toMatchObject(expectValid0);
      });
      test('test with valid nameLast ${ele}', () => {
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, ele);
        expect(result).toMatchObject(expectValid0);
      });
    });
  });

  test('invalid result',() => {
    // invalid Id
    const invalidIds = [0, 1, 2, 3, 9999, -1];
    invalidIds.forEach((ele) => {
      test('test with invalid invalidIds ${ele}', () => {
        result = adminUserDetailsUpdate(ele, email, nameFirst, nameLast);
        expect(result).toMatchObject(expectError1);
      });
    });

    // invalid Email
    const invalidEmails = ['', 'strings', '12345', 'hi!@mails', '@gmail.com'];
    invalidEmails.forEach((ele) => {
      test('test with invalid invalidEmails ${ele}', () => {
        result = adminUserDetailsUpdate(authUserId, ele, nameFirst, nameLast);
        expect(result).toMatchObject(expectError1);
      });
    });
    test('test with invalid Used Emails by other users ${ele}', () => {
      // user2
      const email2 = '078999@gmail.com';
      const psw2 = 'vict078999';
      const nameFirst2 = 'myName';
      const nameLast2 = 'vict';
      let userRegister2;
      
      userRegister2 = adminAuthRegister(email2, psw2, nameFirst2, nameLast2);
      const authUserId2 = userRegister2.authUserId;

      result1 = adminUserDetailsUpdate(authUserId, email2, nameFirst, nameLast);
      expect(result1).toMatchObject(expectError1);
      result2 = adminUserDetailsUpdate(authUserId2, email1, nameFirst2, nameLast2);
      expect(result2).toMatchObject(expectError1);
    });

    // invalid Names
    const invalidNames = ['a', 'ab', ' ', 'includesnumber1', '123', 
      'abc! specail char', 'str?12', '!@#$%^&*()_+=[]', '{}\\|;:\'",.<>?/', 
      'this is twenty words', 'overoveroveroverLoooooooogName'];
    invalidNames.forEach((ele) => {
      test('test with invalid nameFirst ${ele}', () => {
        result = adminUserDetailsUpdate(authUserId, email, ele, nameLast);
        expect(result).toMatchObject(expectError2);
      });
    });
    invalidNames.forEach((ele) => {
      test('test with invalid nameLast ${ele}', () => {
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, ele);
        expect(result).toMatchObject(expectError2);
      });
    });
  });
});
