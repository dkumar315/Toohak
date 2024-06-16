// requirement functions for testing adminUser
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';
import { adminUserDetails, adminUserDetailsUpdate } from './auth.js';
import { adminUserPasswordUpdate } from './auth.js';

// testing adminUserDetails

// testing adminUserDetailsUpdate

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

  // afterAll(() => clear());

  describe('test1: with 0 registered user, no valid authUserId', () => {
    const invalidAuthUserIds = [0, 1, 2, 3, 9999, -1];
    test.each(invalidAuthUserIds)(
      'test1.0: with invalid authUserId = %i', (invalidId) => {
        expect(adminUserDetails(invalidId)).toMatchObject(expectError);
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
      const result2 = adminUserDetailsUpdate(authUserId2, email, nameFirst2, nameLast2);
      expect(result2).toMatchObject(expectError2);
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
