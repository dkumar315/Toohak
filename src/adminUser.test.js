// requirement functions for testing adminUser
import { getData } from './dataStore';
// import { adminAuthRegister } from './auth.js';
import { clear } from './clear.js';
// test for adminUserDetails(authUserId)
import { adminUserDetails } from './auth.js';
/*
** changes: update for iteration1
** last commit: `git rev-parse @`
** 7147f046f85bafd955ad46089c253297cc951d72 (master)
*/

// todo: export function in auth.js
// ??? test helperfunctions?

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
    const expectError = {error: {'invalid authUserId'}};
  });

  afterAll(() => {
    clear();
  });

  test('test with 0 registered user, no valid authUserId', () => {
      const invalidIds = [0, 1, 2, 3, 9999];
      invalidIds.forEach((ele) => 
        expect(adminUserDetails(ele).toMatchObject(expectError));
  });
  
  test('test with 1 registered user', () => {
    const userData = {
      userId: 1,
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      email: 'hayden.smith@unsw.edu.au',
      password: 'haydensmith123',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1
    },
    const expect = {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      password: 'haydensmith123',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1
    }
    // ??? const authUserId = adminAuthRegister().authUserId;
  
    test('valid result', () => {
      const validId = 1;
      expect(adminUserDetails(validId).user).toMatchObject(expect);
    });

    test('invalid result', () => {
      const invalidIds = [0, 2, 9999];
      invalidIds.forEach((ele) => 
        expect(adminUserDetails(ele).toMatchObject(expectError));
    });
  });

  test('test with 2 registered user', () => {
    const exampleData = {
      users: [
        {
          // authuserId: number
          userId: 1,
          nameFirst: 'string1',
          nameLast: 'string2',
          email: 'string@gmail.com',
          password: 'string12345',
          numSuccessfulLogins: 0,
          numFailedPasswordsSinceLastLogin: 0,
        },
        {
          userId: 2,
          nameFirst: 'Hayden',
          nameLast: 'Smith',
          email: 'hayden.smith@unsw.edu.au',
          password: 'haydensmith123',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
        },
      ],
    }
    const expect = {
      users: [
        {
          userId: 1,
          name: 'string1 string2',
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
      validIds = [1, 2];
      validIds.forEach((ele, index) => 
        expect(adminUserDetails(ele).toMatchObject(expect.users(index)));
    });

    test('invalid result', () => {
      const invalidIds = [0, 3, 5, 9999];
      invalidIds.forEach((ele) => 
        expect(adminUserDetails(ele).toMatchObject(expectError));
    });
  });
});