// requirement functions for testing adminUser
// import { getData } from './dataStore';
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
// import function(s) to be tested
import { adminUserDetails } from './auth.js';
/**
  * changes: update for iteration1
  * last commit: `git rev-parse @`
  * 7147f046f85bafd955ad46089c253297cc951d72 (master)
  * 34e4dd0cb3c22b62a3e97e105c0ed557de057a45
*

// todo: export functions in auth.js

// testing adminUserDetails
/**
  * adminUserDetails
  * { authUserId }
  * valid: { object }
  * invalid: { object }
**/
describe('testing adminUserDetails', () => {
  let expectError;
  
  beforeEach(() => {
    clear();
    expectError = {error:'invalid authUserId'};
  });

  afterAll(() => {
    clear();
  });

  test('test1: with 0 registered user, no valid authUserId', () => {
      const invalidIds = [0, 1, 2, 3, 9999, -1];
      invalidIds.forEach((ele) => {
        expect(adminUserDetails(ele)).toMatchObject(expectError);
      });
  });

  test('test2.1: with 1 registered user (valid)', () => {
    const userRegister = adminAuthRegister('haydensmith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const authUserId = userRegister.authUserId;

    const expectRes = {
      userId: 1,
      name: 'Hayden Smith',
      email: 'haydensmith@unsw.edu.au',
      numSuccessfulLogins: 0,
      numFailedPasswordsSinceLastLogin: 0
    }

    const result = adminUserDetails(authUserId);
    expect(result).toMatchObject({user:expectRes});
  });

  test('test2.2: with 1 registered user (invalid)', () => {
    const userRegister = adminAuthRegister('haydensmith@gmail.com', 'haydensmith123', 'Hayden', 'Smith');
    const authUserId = userRegister.authUserId;
    
    const invalidIds = [0, 2, 9999, -1];
    invalidIds.forEach((ele) => {
      expect(adminUserDetails(ele)).toMatchObject(expectError);
    });
  });

  test('test3.1: with 2 registered users (valid)', () => {
    const userRegister1 = adminAuthRegister('stringab@gmail.com', 'string12345', 'stringa', 'stringb');
    const userRegister2 = adminAuthRegister('haydensmith@gmail.com', 'haydensmith123', 'Hayden', 'Smith');
    const authUserId1 = userRegister1.authUserId;
    const authUserId2 = userRegister2.authUserId;
    
    const expectRes = {
      users: [
        {
          userId: 1,
          name: 'stringa stringb',
          email: 'stringab@gmail.com',
          numSuccessfulLogins: 0,
          numFailedPasswordsSinceLastLogin: 0,
        },
        {
          userId: 2,
          name: 'Hayden Smith',
          email: 'haydensmith@gmail.com',
          numSuccessfulLogins: 0,
          numFailedPasswordsSinceLastLogin: 0,
        },
      ],
    }

    const validIds = [authUserId1, authUserId2];
    validIds.forEach((ele, index) => {
      expect(adminUserDetails(ele)).toMatchObject({user:expectRes.users[index]});
    });
  });

  test('test3.2: with 2 registered user (invalid)', () => {
    const userRegister1 = adminAuthRegister('stringab@gmail.com', 'string12345', 'stringa', 'stringb');
    const userRegister2 = adminAuthRegister('haydensmith@gmail.com', 'haydensmith123', 'Hayden', 'Smith');
    const authUserId1 = userRegister1.authUserId;
    const authUserId2 = userRegister2.authUserId;

    const invalidIds = [0, 3, 5, 9999, -1];
    invalidIds.forEach((ele) => {
      expect(adminUserDetails(ele)).toMatchObject(expectError);
    });
  });
});