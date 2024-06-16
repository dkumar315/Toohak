// requirement functions for testing adminUser
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { adminUserDetails, adminUserDetailsUpdate } from './auth.js';

// testing adminUserDetails

// testing adminUserDetailsUpdate
/**
  * adminUserDetailsUpdate
  * {authUserId, email, nameFirst, nameLast}
  * valid: {}
  * invalid: {error: 'specific error message here'}
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
      test.each(invalidIds)('test2.1: invalid authUserId = %i', (invalidId) => {
        result = adminUserDetailsUpdate(invalidId, email, nameFirst, nameLast);
        expect(result).toMatchObject(expectError1);
      });
    });

    // invalid Emails
    describe('test2.2: invalid emails',() => {
      const invalidEmails = ['', 'strings', '12345', 'hi!@mails', '@gmail.com'];
      test.each(invalidEmails)('test2.2: invalid emails = %i', (invalidEmail) => {
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
