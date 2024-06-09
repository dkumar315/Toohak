// requirement functions for testing adminUser
// import { getData } from './dataStore';
// import { adminAuthRegister } from './auth.js';
import { clear } from './clear.js';
// import function(s) to be tested
import { adminUserDetails } from './auth.js';
/**
  * changes: update for iteration1
  * last commit: `git rev-parse @`
  * 7147f046f85bafd955ad46089c253297cc951d72 (master)
  * 34e4dd0cb3c22b62a3e97e105c0ed557de057a45
*/

// todo: export functions in auth.js

// testing adminUserDetails
/**
  * adminUserDetails
  * { authUserId }
  * valid: { object }
  * invalid: { object }
**/
describe('testing adminUserDetails', () => {
  beforeEach(() => {
    clear();
    const expectError = {error:'invalid authUserId'};
  });

  afterAll(() => {
    clear();
  });

  describe('test with 0 registered user, no valid authUserId', () => {
      const invalidIds = [0, 1, 2, 3, 9999, -1];
      invalidIds.forEach((ele) => 
        expect(adminUserDetails(ele).toMatchObject(expectError));
  });

  describe('test with 1 registered user', () => {
    let authUserId;
    beforeEach(() => {
      const userRegister = adminAuthRegister('haydensmith@gmail.com', 'haydensmith123', 'Hayden', 'Smith');
      authUserId = userRegister.authUserId;
    });

    const expect = {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      password: 'haydensmith123',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1
    }

    test('valid result', () => {
      const result = adminUserDetails(authUserId);
      expect(result).toMatchObject(expect);
    });

    test('invalid result', () => {
      const invalidIds = [0, 2, 9999, -1];
      invalidIds.forEach((ele) => 
        expect(adminUserDetails(ele).toMatchObject(expectError));
    });
  });

  describe('test with 2 registered users', () => {
    beforeEach(() => {
      const userRegister1 = adminAuthRegister('stringab@gmail.com', 'string12345', 'stringa', 'stringb');
      const userRegister2 = adminAuthRegister('haydensmith@gmail.com', 'haydensmith123', 'Hayden', 'Smith');
      const authUserId1 = userRegister1.authUserId;
      const authUserId2 = userRegister2.authUserId;
    });
    const expect = {
      users: [
        {
          userId: 1,
          name: 'stringa stringb',
          email: 'string@gmail.com',
          password: 'string12345',
          numSuccessfulLogins: 0,
          numFailedPasswordsSinceLastLogin: 0,
        },
        {
          userId: 2,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
        },
      ],
    }

    test('valid result', () => {
      validIds = [authUserId1, authUserId2];
      validIds.forEach((ele, index) => 
        expect(adminUserDetails(ele).toMatchObject(expect.users(index)));
    });

    test('invalid result', () => {
      const invalidIds = [0, 3, 5, 9999, -1];
      invalidIds.forEach((ele) => 
        expect(adminUserDetails(ele).toMatchObject(expectError));
    });
  });
});