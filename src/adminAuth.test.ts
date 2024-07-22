import {
  requestAuthRegister, requestAuthLogin, requestClear,
  ResToken, ResError
} from './functionRequest';
import { OK, BAD_REQUEST } from './dataStore';

const ERROR = { status: BAD_REQUEST, error: expect.any(String) };
let result: ResToken | ResError;

beforeEach(() => {
  requestClear();
  result = requestAuthRegister('jane@example.com', 'MyPassw0rd', 'Jane', 'Smith');
});

afterAll(() => requestClear());

describe('adminAuthRegister', () => {
  describe('Valid Registration', () => {
    test('Test for Single user', () => {
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // emails
    const emails = ['test@example.com', 'sarah@example.com'];
    test.each(emails)('Test for valid email', (email) => {
      result = requestAuthRegister(email, 'MyPassw0rd', 'Sarah', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // nameFirst
    const nameFirsts = ['J a-n\'e', 'Ja', 'JJJJJJJJJJJJJJJJJJJJ'];
    test.each(nameFirsts)('Test for valid nameFirst', (nameFirst) => {
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // nameLast
    const nameLasts = ['S m-i\'th', 'Sm', 'SSSSSSSSSSSSSSSSSSSS'];
    test.each(nameLasts)('Test for valid nameFirst', (nameLast) => {
      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', nameLast);
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    // password
    const passwords = ['passw0rd', 'passw0rd@#&/?><|'];
    test.each(passwords)('Test for valid nameFirst', (password) => {
      result = requestAuthRegister('test2@example.com', password, 'Jane', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    test('Test for mutiple users', () => {
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });
  });

  describe('Invalid Registration', () => {
    describe('Email creation', () => {
      const emails = ['jane@example.com', '123'];
      test.each(emails)('Test for invalid email', (email) => {
        result = requestAuthRegister(email, 'MyPassw0rd', 'Jane', 'Smith');
        expect(result).toStrictEqual(ERROR);
        if ('error' in result) {
          expect(result.error).toBe(`Email invalid format or already in use ${email}.`);
        }
      });
    });

    describe('Username creation', () => {
      // nameFirst
      const nameFirsts = ['Jan3', 'J@#&/?><|ne', 'J', 'JaneJaneJaneJaneJanee'];
      test.each(nameFirsts)('Test for invalid namefirst', (nameFirst) => {
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result).toStrictEqual(ERROR);
        if ('error' in result) {
          expect(result.error).toStrictEqual(`Firstname does not meet requirements ${nameFirst}.`);
        }
      });

      // nameLast
      const nameLasts = ['5mith', 'Sm@#&/?><|th', 'S', 'SmithSmithSmithSmiths'];
      test.each(nameLasts)('Test for invalid namelast', (nameLast) => {
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result).toStrictEqual(ERROR);
        if('error' in result) {
          expect(result.error).toStrictEqual(`Lastname does not meet requirements ${nameLast}.`);
        }
      });
    });

    describe('Password creation', () => {
      const passwords = ['Pass1', 'MyPassword', '123456789'];
      test.each(passwords)('Test for invalid password', (password) => {
        result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result).toStrictEqual(ERROR);
        if ('error' in result) {
          expect(result.error).toStrictEqual(`Invalid password ${password}.`);
        }
      });
    });
  });
});

describe('adminAuthLogin', () => {
  test('Test for Valid Login', () => {
    result = requestAuthLogin('jane@example.com', 'MyPassw0rd');
    expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
  });

  // emails
  const emails = [' ', '123', 'fakejane@example.com'];
  test.each(emails)('Test for invalid email', (email) => {
    result = requestAuthLogin(email, 'MyPassw0rd');
    expect(result).toStrictEqual(ERROR);
    if ('error' in result) {
      expect(result.error).toStrictEqual(`Invalid email ${email}.`);
    }
  });

  // passwords
  const passwords = ['Pass1', 'MyPassword', '123456789', 'Invalid Password', ' '];
  test.each(passwords)('Test for invalid password', (password) => {
    result = requestAuthLogin('jane@example.com', password);
    expect(result).toStrictEqual(ERROR);
    if ('error' in result) {
      expect(result.error).toStrictEqual(`Invalid password ${password}.`);
    }
  });
});
