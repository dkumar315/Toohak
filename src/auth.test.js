import {
    adminAuthRegister,
    adminAuthLogin,
    clear
  } from './auth.js';
  
beforeEach(()=> {
    clear();
});

describe('clear', () => {
  test('has the correct return type, {}', () => {
      expect(clear()).toStrictEqual({});
    });
});  

describe('adminAuthLogin', () => {
  
  describe('Email input', () => {
    test('Test for non-existent email', () => {
      const result = adminAuthLogin("nonexistent@example.com", "MyPassw0rd")
      expect(result).toHaveProperty('error', 'Email address does not exist');
    });

    test('Test for empty email input', () => {
      const result = adminAuthLogin("", "MyPassw0rd")
      expect(result).toHaveProperty('error', 'Email address required')
    });
  });

  describe('Password input', () => { 
    test('Test for invalid password', () => {
      const result = adminAuthLogin("test@example.com", "Invalid Password");
      expect(result).toHaveProperty('error', 'Incorrect Password.');
    });

    test('Test for valid password', () => {
      const result = adminAuthLogin("test@example.com", "MyPassw0ordValid");
      expect(result).toHaveProperty('authUserId');
    });

    test('Test for empty password input', () => {
      const result = adminAuthLogin("test@example.com", "")
      expect(result).toHaveProperty('error', 'Password required')
    });

  });
});


