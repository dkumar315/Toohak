import {
    adminAuthRegister,
    adminAuthLogin,
    isValidPassword
  } from './auth.js';
 
import {
    clear
} from './other.js'

beforeEach(()=> {
  clear();
  const result1 = adminAuthRegister("jane@example.com", "MyPassw0rd",
                                    "Jane", "Smith");

  expect(result1).toStrictEqual({authUserId: expect.any(Number)});
});

describe('adminAuthLogin', () => {
  describe('Email input', () => {
    test('Test for non-existent email', () => {
      const result2 = adminAuthLogin(" ", "MyPassw0rd");
      expect(result2).toStrictEqual({error: 'Invalid email.'});
    });

    test('Test for wrong email', () => {
      const result2 = adminAuthLogin("fakejane@example.com", "MyPassw0rd");
      expect(result2).toStrictEqual({error: 'Invalid email.'});
    });

    test('Test for email address success', () => {
      const result2 = adminAuthLogin("jane@example.com", "MyPassw0rd");
      expect(result2).toStrictEqual({authUserId: expect.any(Number)});
    });
  });

  describe('Password input', () => { 
    test('Test for invalid password', () => {
      const result2 = adminAuthLogin("jane@example.com", "Invalid Password");
      expect(result2).toStrictEqual({error: 'Incorrect Password.'});
    });

    test('Test for password success', () => {
      const result2 = adminAuthLogin("jane@example.com", "MyPassw0rd");
      expect(result2).toStrictEqual({authUserId: expect.any(Number)});
    });

    test('Test for empty password input', () => {
      const result2 = adminAuthLogin("jane@example.com", " ")
      expect(result2).toStrictEqual({error: 'Incorrect Password.'});
    });
  });

});


