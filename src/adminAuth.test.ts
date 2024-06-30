test('delete it', () => {
  expect(1 + 1).toBe(2);
});

/* import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails
} from './auth.js';

import { clear } from './other.js';

let result;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
  result = adminAuthRegister('jane@example.com', 'MyPassw0rd', 'Jane', 'Smith');
});

describe('adminAuthRegister', () => {
  describe('Valid Registration', () => {
    test('Test for Single user', () => {
      expect(result).toMatchObject({ authUserId: expect.any(Number) });
    });

    test('Test for names conatins spaces, hyphens, and apostrophes', () => {
      const name = 'J a-n\'e';
      result = adminAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result).toMatchObject({ authUserId: expect.any(Number) });

      result = adminAuthRegister('test2@example.com', 'MyPassw0rd', 'jane', name);
      expect(result).toMatchObject({ authUserId: expect.any(Number) });
    });

    test('Test for names just meet require (name length = 2)', () => {
      const name = 'Ja';
      result = adminAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result).toStrictEqual({ authUserId: expect.any(Number) });

      result = adminAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', name);
      expect(result).toStrictEqual({ authUserId: expect.any(Number) });
    });

    test('Test for names just meet require (name length = 20)', () => {
      const name = 'JJJJJJJJJJJJJJJJJJJJ';
      result = adminAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result).toMatchObject({ authUserId: expect.any(Number) });

      result = adminAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', name);
      expect(result).toMatchObject({ authUserId: expect.any(Number) });
    });

    test('Test for password just meet require (length = 8)', () => {
      const password = 'passw0rd';
      result = adminAuthRegister('test@example.com', password, 'Jane', 'Smith');
      expect(result).toMatchObject({ authUserId: expect.any(Number) });
    });

    test('Test for password with specail characters', () => {
      const password = 'passw0rd@#&/?><|';
      result = adminAuthRegister('test@example.com', password, 'Jane', 'Smith');
      expect(result).toMatchObject({ authUserId: expect.any(Number) });
    });

    test('Test for mutiple users', () => {
      result = adminAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toMatchObject({ authUserId: expect.any(Number) });

      result = adminAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toMatchObject({ authUserId: expect.any(Number) });
    });
  });

  describe('inValid Registration', () => {
    describe('Email creation', () => {
      test('Email address is used by another user', () => {
        const email = 'test@example.com';
        result = adminAuthRegister(email, 'MyPassw0rd', 'Jane', 'Smith');
        expect(result).toMatchObject({ authUserId: expect.any(Number) });

        result = adminAuthRegister('jane@example.com', 'MyPassw0rd', 'Sarah', 'Parker');
        expect(result).toMatchObject(ERROR);

        result = adminAuthRegister(email, 'MyPassw0rd', 'Sarah', 'Parker');
        expect(result).toMatchObject(ERROR);
      });

      test('Email does not satisfy (email with string only)', () => {
        result = adminAuthRegister('123', 'MyPassw0rd', 'Jane', 'Smith');
        expect(result).toMatchObject(ERROR);
      });
    });

    describe('Username creation', () => {
      // NameFirst
      test('Test for invalid nameFirst input (number)', () => {
        const nameFirst = 'Jan3';
        result = adminAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result).toMatchObject(ERROR);
      });

      test('Test for invalid nameFirst input (@#&/?><|)', () => {
        const nameFirst = 'J@#&/?><|ne';
        result = adminAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result).toMatchObject(ERROR);
      });

      test('Test for nameFirst length less than 2 characters', () => {
        const nameFirst = 'J';
        result = adminAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result).toMatchObject(ERROR);
      });

      test('Test for nameFirst length exceeding 20 characters', () => {
        const nameFirst = 'JaneJaneJaneJaneJanee';
        result = adminAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result).toMatchObject(ERROR);
      });

      // nameLast
      test('Test for invalid nameLast input (number)', () => {
        const result = adminAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', '5mith');
        expect(result).toMatchObject(ERROR);
      });

      test('Test for invalid nameLast input (@@#&/?><|)', () => {
        const nameLast = 'Sm@#&/?><|th';
        result = adminAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result).toMatchObject(ERROR);
      });

      test('Test for nameLast length less than 2 characters', () => {
        const nameLast = 'S';
        result = adminAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result).toMatchObject(ERROR);
      });

      test('Test for nameLast length exceeding 20 characters', () => {
        const nameLast = 'SmithSmithSmithSmiths';
        result = adminAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result).toMatchObject(ERROR);
      });
    });

    describe('Password creation', () => {
      test('Test for password length less than 8 characters', () => {
        const password = 'Pass1';
        result = adminAuthRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result).toMatchObject(ERROR);
      });

      test('Test for password missing a number', () => {
        const password = 'MyPassword';
        result = adminAuthRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result).toMatchObject(ERROR);
      });

      test('Test for password missing a letter', () => {
        const password = '123456789';
        const result = adminAuthRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result).toMatchObject(ERROR);
      });
    });
  });
});

describe('adminAuthLogin', () => {
  describe('Successful Login', () => {
    test('Test for valid login', () => {
      adminAuthLogin('jane@example.com', 'MyPassw0rd');
      result = adminAuthLogin('jane@example.com', 'MyPassw0rd');
      expect(result).toMatchObject({ authUserId: expect.any(Number) });
    });
  });

  describe('Email input', () => {
    test('Test for non-existent email', () => {
      const result = adminAuthLogin(' ', 'MyPassw0rd');
      expect(result).toMatchObject(ERROR);
    });

    test('Test for wrong email', () => {
      const result = adminAuthLogin('fakejane@example.com', 'MyPassw0rd');
      expect(result).toMatchObject(ERROR);
    });
  });

  describe('Password input', () => {
    test('Test for invalid password', () => {
      const result = adminAuthLogin('jane@example.com', 'Invalid Password');
      expect(result).toMatchObject(ERROR);
    });

    test('Test for empty password input', () => {
      const result = adminAuthLogin('jane@example.com', '');
      expect(result).toMatchObject(ERROR);
    });
  });

  describe('Test with userDetail', () => {
    test('Test if userDetail is successfully set', () => {
      const authUserId = result.authUserId;

      const userDetail = adminUserDetails(authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(1);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('Test for login with invalid email', () => {
      const authUserId = result.authUserId;
      result = adminAuthLogin('invalid@example.com', 'MyPassw0rd');
      expect(result).toMatchObject(ERROR);

      const userDetail = adminUserDetails(authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(1);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('Test for login with invalid password', () => {
      const authUserId = result.authUserId;
      result = adminAuthLogin('jane@example.com', 'Passw0rd');
      expect(result).toMatchObject(ERROR);

      const userDetail = adminUserDetails(authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(1);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('Test successful login after invalid password', () => {
      adminAuthLogin('jane@example.com', 'Passw0rd');
      result = adminAuthLogin('jane@example.com', 'MyPassw0rd');
      expect(result).toStrictEqual({ authUserId: expect.any(Number) });

      let userDetail = adminUserDetails(result.authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(2);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

      result = adminAuthLogin('jane@example.com', 'MyPassw0rd');
      userDetail = adminUserDetails(result.authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(3);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
}); */
