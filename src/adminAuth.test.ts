import { OK, BAD_REQUEST } from './dataStore';
import {
  authRegister, requestAuthLogin, requestClear,
  ResError, ResToken, ERROR
} from './functionRequest';

let result: ResToken | ResError;

beforeEach(() => {
  requestClear();
  result = authRegister('jane@example.com', 'MyPassw0rd', 'Jane', 'Smith');
});

afterAll(() => requestClear());

describe('authRegister', () => {
  describe('Valid Registration', () => {
    test('Test for Single user', () => {
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // emails
    const emails = ['test@example.com', 'sarah@example.com'];
    test.each(emails)('Test for valid email', (email) => {
      result = authRegister(email, 'MyPassw0rd', 'Sarah', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // nameFirst
    const nameFirsts = ['J a-n\'e', 'Ja', 'JJJJJJJJJJJJJJJJJJJJ'];
    test.each(nameFirsts)('Test for valid nameFirst', (nameFirst) => {
      result = authRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // nameLast
    const nameLasts = ['S m-i\'th', 'Sm', 'SSSSSSSSSSSSSSSSSSSS'];
    test.each(nameLasts)('Test for valid nameFirst', (nameLast) => {
      result = authRegister('test2@example.com', 'MyPassw0rd', 'Jane', nameLast);
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // password
    const passwords = ['passw0rd', 'passw0rd@#&/?><|'];
    test.each(passwords)('Test for valid nameFirst', (password) => {
      result = authRegister('test2@example.com', password, 'Jane', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    test('Test for mutiple users', () => {
      result = authRegister('test@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });

      result = authRegister('test2@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });
  });

  describe('Invalid Registration', () => {
    describe('Email creation', () => {
      const emails = ['jane@example.com', '123'];
      test.each(emails)('Test for invalid email', (email) => {
        result = authRegister(email, 'MyPassw0rd', 'Jane', 'Smith');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('Username creation', () => {
      // nameFirst
      const nameFirsts = ['Jan3', 'J@#&/?><|ne', 'J', 'JaneJaneJaneJaneJanee'];
      test.each(nameFirsts)('Test for invalid namefirst', (nameFirst) => {
        result = authRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      // nameLast
      const nameLasts = ['5mith', 'Sm@#&/?><|th', 'S', 'SmithSmithSmithSmiths'];
      test.each(nameLasts)('Test for invalid namelast', (nameLast) => {
        result = authRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('Password creation', () => {
      const passwords = ['Pass1', 'MyPassword', '123456789'];
      test.each(passwords)('Test for invalid password', (password) => {
        result = authRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });
  });
});

describe('adminAuthLogin', () => {
  describe('Valid Login', () => {
    test('Login with correct credentials', () => {
      result = requestAuthLogin('jane@example.com', 'MyPassw0rd');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    test('Login with another registered user', () => {
      authRegister('john@example.com', 'YourPassw0rd', 'John', 'Smith');
      result = requestAuthLogin('john@example.com', 'YourPassw0rd');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });
  });

  describe('Invalid Login', () => {
    test('Login with incorrect email', () => {
      result = requestAuthLogin('invalid@example.com', 'MyPassw0rd');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Login with incorrect password', () => {
      result = requestAuthLogin('jane@example.com', 'InvalidPass');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Login with empty password', () => {
      result = requestAuthLogin('jane@example.com', '');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Login with empty email', () => {
      result = requestAuthLogin('', 'MyPassw0rd');
      expect(result).toMatchObject(ERROR);
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });

  describe('Multiple Failed Logins', () => {
    test('Increment failed login attempts', () => {
      for (let i = 0; i < 3; i++) {
        result = requestAuthLogin('jane@example.com', 'InvalidPass');
        expect(result).toMatchObject(ERROR);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      }
    });
  });
});
