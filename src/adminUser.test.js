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

  let psw;
  let newPsw;
  let newPsws;
  let result;
  let authUserId;

  beforeEach(() => {
    clear();

    // user1
    psw = 'haydensmith123';
    newPsw = '321haydensmith'
    const email = 'haydensmith@gmail.com';
    const nameF = 'Hayden';
    const nameL = 'Smith'
    authUserId = adminAuthRegister(email, psw, nameF, nameL).authUserId;

    newPsws = [];
  });

  afterAll(() => {
    clear();
  });

  // valid results
  test('test1.1: valid authUserId', () => {
    newPsws = ['haydensnewpassword0', 'haydenSmith123', 'h1ydensmithabc'];
    newPsws.forEach((ele) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
      expect(result).toMatchObject(expectValid0);
    });
  });

  test('test1.1.2: valid authUserId, keep changing psws 8 times', () => {
    newPsws = Array.from({ length: 8 }, (_, i) => 'haydensNewPsw' + i);
    newPsws.forEach((ele) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
      expect(result).toMatchObject(expectValid0);
    });
  });

  test('test1.1.3: valid authUserId, exactly meet the requirement', () => {
    newPsws = ['this8Len', 'only1number', '11111l', 'C8PTICAL'];
    newPsws.forEach((ele) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
      expect(result).toMatchObject(expectValid0);
    });
  });

  test('test1.1.4: valid authUserId, special characters', () => { // fixme
    newPsws = ['this psw has space', 'psw!!!!', 'a0!@#$%^&*()_+=[]',
     'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-', '#d4af37ToDo'];
    newPsws.forEach((ele) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
      expect(result).toMatchObject(expectValid0);
    });
  });

  test('test1.1.5: valid authUserId with 2 users', () => {
    // user2
    const psw2 = 'vict078999';
    const email2 = '0789@gmail.com';
    const nameF2 = 'name';
    const nameL2 = 'vict';
    const authUserId2 = adminAuthRegister(email2, psw2, nameF2, nameL2).authUserId;

    const res2 = adminUserPasswordUpdate(authUserId2, psw2, psw);
    expect(res2).toMatchObject(expectValid0);
  });

  // invalid results
  // invalid Ids
  test('test2.1: (invalid authUserId) incorrect authUserId input',() => {
    const invalidIds = [0, 2, 3, 9999, -1];
    invalidIds.forEach((ele) => {
      result = adminUserPasswordUpdate(ele, psw, newPsw);
      expect(result).toMatchObject(expectError1);
    });
  });
  
  test('test2.1.2: (invalid authUserId) no user',() => {
    clear();
    const invalidIds = [0, 1, 2, 3, 9999, -1];
    invalidIds.forEach((ele) => {
      result = adminUserPasswordUpdate(ele, psw, newPsw);
      expect(result).toMatchObject(expectError1);
    });
  });

  test('test2.2: (invalid oldPassword) old password not match user password',() => {
    result = adminUserPasswordUpdate(authUserId, undefined, newPsw);
    expect(result).toMatchObject(expectError2);

    result = adminUserPasswordUpdate(authUserId, '', newPsw);
    expect(result).toMatchObject(expectError2);

    result = adminUserPasswordUpdate(authUserId, newPsw, newPsw);
    expect(result).toMatchObject(expectError2);
  });

  test('test2.2.1: (invalid oldPassword) password match other user\'s',() => {
    // user2
    const psw2 = 'vict078999';
    const email2 = '0789@gmail.com';
    const nameF2 = 'name';
    const nameL2 = 'vict';
    const user2 = adminAuthRegister(email2, psw2, nameF2, nameL2).authUserId;

    result = adminUserPasswordUpdate(authUserId, psw2, newPsw);
    expect(result).toMatchObject(expectError2);
  });

  test('test2.3: (invalid newPassword) new password same as the old',() => {
    result = adminUserPasswordUpdate(authUserId, psw, psw);
    expect(result).toMatchObject(expectError3);
  });

  test('test2.3.1: (invalid newPassword) new password used before',() => {
    adminUserPasswordUpdate(authUserId, psw, newPsw);
    result = adminUserPasswordUpdate(authUserId, newPsw, psw);
    expect(result).toMatchObject(expectError3);
  });

  test('test2.3.1.2: (invalid newPassword) new passwords used before',() => {
    newPsws = ['this8Len', 'only1number', '1111111l', 'C8PTICAL', 'AAAA1AAAA',
      'this psw has space0', 'psw111!!!!!', 'a0!@#$%^&*()_+=[]', '     0V0    ',
     'cats on keyboard 55Len !@#$%^&*()_+=[]{}\\|;:\'",.<>?/-', '#d4af37ToDo'];

    // new password is same as last changed password
    newPsws.forEach((ele) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
      expect(result).toMatchObject(expectValid0);
      result = adminUserPasswordUpdate(authUserId, ele, psw);
      expect(result).toMatchObject(expectError3);
      psw = ele;
    });

    // new password is same as pervious passwords
    newPsws.forEach((ele, index) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
      expect(result).toMatchObject(expectError3);
    });
  });

  test('test2.3.2: (invalid newPassword) new password length incorrect',() => {
    newPsws = ['', 'a1', '!', 'its7Len', '012345', 'abc', '       ', 'abc123!'];
    newPsws.forEach((ele) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
      expect(result).toMatchObject(expectError3);
    });
  });

  // invalid: when new psw not contains at least (one number and one letter)
  test('test2.3.3: (invalid newPassword) new password not as require',() => {
    newPsws = ['12345678', 'abcdefghijk', '!@#$%^&*()_+=[]', 'EEEEEEEEE'];
    newPsws.forEach((ele) => {
      result = adminUserPasswordUpdate(authUserId, psw, ele);
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
  let email1, psw1, nameF1, nameL1, userId1, authUserId1, res1;
  let email2, psw2, nameF2, nameL2, userId2, authUserId2, res2;

  const expectUpdateValid = {};
  const expectAuthIdError = {error:'invalid authUserId'};
  const expectEmaillError = {error:'invalid email'};
  const expectNameF1Error = {error:'invalid nameFirst'};
  const expectNameLaError = {error:'invalid nameLast'};
  const expectOldPswError = {error:'invalid oldPassword'};
  const expectNewPswError = {error:'invalid newPassword'};

  let result;

  beforeEach(() => {
    clear();

    // user1
    email1 = 'haydensmith@gmail.com';
    psw1 = 'haydensmith123';
    nameF1 = 'Hayden';
    nameL1 = 'Smith';
    userId1 = adminAuthRegister(email1, psw1, nameF1, nameL1).authUserId;
    authUserId1 = userId1;

    // user2
    psw2 = 'vict078999';
    email2 = '0789@gmail.com';
    nameF2 = 'name';
    nameL2 = 'vict';
    userId2 = adminAuthRegister(email2, psw2, nameF2, nameL2).authUserId;
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
    expect(result.user.name).toBe(nameF1 + ' ' + nameL1);

    let email1New = 'haydensmith2@ad.unsw.edu.au';
    let nameF1New = 'Hayden-new';
    let nameL1New = 'Smith-new';
    result = adminUserDetailsUpdate(authUserId1, email1New, nameF1New, nameL1New);

    // (update detail) and check detail
    result = adminUserDetails(userId1);
    expect(result.user.userId).toBe(authUserId1);
    expect(result.user.email).toBe(email1New);
    expect(result.user.name).toBe(nameF1New + ' ' + nameL1New);

    // (update detail, check detail) and update password
    const newPsw = 'haydensnewpassword0';
    result = adminUserPasswordUpdate(authUserId1, psw1, newPsw);
    expect(result).toMatchObject(expectUpdateValid);
    psw1 = newPsw;

    // (update password) and update detail
    email1New = 'haydensmith3@ad.unsw.edu.au';
    nameF1New = 'Hayden-new-new';
    nameL1New = 'Smith-new-new';
    result = adminUserDetailsUpdate(authUserId1, email1New, nameF1New, nameL1New);

    // (update password, update detail) and check detail
    result = adminUserDetails(userId1);
    expect(result.user.userId).toBe(authUserId1);
    expect(result.user.email).toBe(email1New);
    expect(result.user.name).toBe(nameF1New + ' ' + nameL1New);
  });

  test('test1.1: failed on changing password and rechanging', () => {
    // update password
    const invalidNewPsw = 'abc';
    result = adminUserPasswordUpdate(authUserId1, psw1, invalidNewPsw);
    expect(result).toMatchObject(expectNewPswError);

    // update password
    const newPsw = 'haydensnewpassword0';
    result = adminUserPasswordUpdate(authUserId1, psw1, newPsw);
    expect(result).toMatchObject(expectUpdateValid);
  });

  test('test1.2: fail to change details', () => {
    // check deatil
    result = adminUserDetails(userId2);
    expect(result.user.userId).toBe(authUserId2);
    expect(result.user.email).toBe(email2);
    expect(result.user.name).toBe(nameF2 + ' ' + nameL2);

    // fail to update details
    const invalidNameFirst = 'ab';
    result = adminUserDetailsUpdate(userId2, email2, invalidNameFirst, nameL2);
    expect(result).toMatchObject(expectNameF1Error);

    // check deatil
    result = adminUserDetails(userId2);
    expect(result.user.userId).toBe(authUserId2);
    expect(result.user.email).toBe(email2);
    expect(result.user.name).toBe(nameF2 + ' ' + nameL2);
  });


  test('test1.3: changed password, fail to change details', () => {
    // update password
    const newPassword = 'ABc20240610!';
    result = adminUserPasswordUpdate(authUserId2, psw2, newPassword);
    expect(result).toMatchObject(expectUpdateValid);

    // fail to update detail
    const invalidNameL2 = 'ab';
    result = adminUserDetailsUpdate(userId2, email2, nameF2, invalidNameL2);
    expect(result).toMatchObject(expectNameLaError);

  });
});
