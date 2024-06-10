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
