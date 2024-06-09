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
import {getData} from './dataStore.js'
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
  test('test1.1: valid authUserId', () => {
    result = adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast);
    expect(result).toMatchObject(expectValid0);
  });

  // valid email (includes same email)
  test('test1.2: valid emails', () => {
    const emails = ['haydensmith@gmail.com', 'hay.s2@gmail.com', 'hayd@icloud.com',
      'z5411789@ad.unsw.edu.au', 'h_s@protonmail.com', 'hayden@au@yahoo.com'];
    
    emails.forEach((ele) => {
      result = adminUserDetailsUpdate(authUserId, ele, nameFirst, nameLast);
      expect(result).toMatchObject(expectValid0);
    });
  });

  // valid names
  test('test1.3: valid names', () => {
    const names = ['abc', 'thisNameNineteenLen', 'name has spaces ', '     ',
      'ALLUPPERCASE', 'hayden-Smith', 'Hayden\'sname', 'all Names\' Com-bo'];
    
    names.forEach((ele) => {
        result = adminUserDetailsUpdate(authUserId, email, ele, nameLast);
        expect(result).toMatchObject(expectValid0);
      });

    names.forEach((ele) => {
        result = adminUserDetailsUpdate(authUserId, email, nameFirst, ele);
        expect(result).toMatchObject(expectValid0);
    });
  });

  // invalid results
  // invalid Ids
  test('test2.1: invalid authUserId',() => {
    const invalidIds = [0, 2, 3, 9999, -1];
    invalidIds.forEach((ele) => {
      result = adminUserDetailsUpdate(ele, email, nameFirst, nameLast);
      expect(result).toMatchObject(expectError1);
    });
  });
  
  test('test2.1.2: no user (invalid authUserId)',() => {
    clear();
    const invalidIds = [0, 1, 2, 3];
    expect(result).toMatchObject(expectError1);
  });

  // invalid Emails
  test('test2.2: invalid emails',() => {
    const invalidEmails = ['', 'strings', '12345', 'hi!@mails', '@gmail.com'];
    invalidEmails.forEach((ele) => {
      result = adminUserDetailsUpdate(authUserId, ele, nameFirst, nameLast);
      expect(result).toMatchObject(expectError2);
    });
  });

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

  test('test2.3: invalid names', () => {
    // invalid Names
    const invalidNames = ['a', 'ab', ' ', 'includesnumber1', '123', 
      'abc! specail char', 'str?12', '!@#$%^&*()_+=[]', '{}\\|;:\'",.<>?/', 
      'this is twenty words', 'overoveroveroverLoooooooogName'];
    
    invalidNames.forEach((ele) => {
      result = adminUserDetailsUpdate(authUserId, email, ele, nameLast);
      expect(result).toMatchObject(expectError3);
    });

    invalidNames.forEach((ele) => {
      result = adminUserDetailsUpdate(authUserId, email, nameFirst, ele);
      expect(result).toMatchObject(expectError4);
    });
  });
});
