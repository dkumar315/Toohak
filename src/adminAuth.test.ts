import { requestAuthRegister, requestAuthLogin, requestClear } from "./functionRequest";
import { OK, BAD_REQUEST } from "./dataStore";

let result: any;
const ERROR = { status: BAD_REQUEST, error: expect.any(String) };

beforeEach(() => {
  requestClear();
  result = requestAuthRegister('jane@example.com', 'MyPassw0rd', 'Jane', 'Smith');
});

describe('adminAuthRegister', () => {
  describe('Valid Registration', () => {
    test('Test for Single user', () => {
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });
    });

    test('Test for names containing spaces, hyphens, and apostrophes', () => {
      const name = 'J a-n\'e';
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result).toStrictEqual({ status: OK, token: expect.any(String) });

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'jane', name);
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});
    });

    test('Test for names just meet require (name length = 2)', () => {
      const name = 'Ja';
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', name);
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});
    });

    test('Test for names just meet require (name length = 20)', () => {
      const name = 'JJJJJJJJJJJJJJJJJJJJ';
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', name);
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});
    });

    test('Test for password just meet require (length = 8)', () => {
      const password = 'passw0rd';
      result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});
    });

    test('Test for password with specail characters', () => {
      const password = 'passw0rd@#&/?><|';
      result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});
    });

    test('Test for mutiple users', () => {
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result).toStrictEqual({status: OK, token: expect.any(String)});
    });
  });

  describe('Invalid Registration', () => {
    describe('Email creation', () => {
      const emails = ["jane@example.com", "123"];
      test.each(emails)('Test for invalid email', (email) => {
        result = requestAuthRegister(email, 'MyPassw0rd', 'Jane', 'Smith');
        expect(result).toStrictEqual(ERROR);
        expect(result.error).toStrictEqual(`Email invalid format or already in use ${email}.`);
      });
    });

    describe('Username creation', () => {
      // nameFirst
      const nameFirsts = ['Jan3', 'J@#&/?><|ne', 'J', 'JaneJaneJaneJaneJanee'];
      test.each(nameFirsts)('Test for invalid namefirst', (nameFirst) => {
        result = requestAuthRegister("test@example.com", 'MyPassw0rd', nameFirst, 'Smith');
        expect(result).toStrictEqual(ERROR);
        expect(result.error).toStrictEqual(`Firstname does not meet requirements ${nameFirst}.`);
      });

      // nameLast
      const nameLasts = ['5mith', 'Sm@#&/?><|th', 'S', 'SmithSmithSmithSmiths'];
      test.each(nameLasts)('Test for invalid namelast', (nameLast) => {
        result = requestAuthRegister("test@example.com", 'MyPassw0rd', 'Jane', nameLast);
        expect(result).toStrictEqual(ERROR);
        expect(result.error).toStrictEqual(`Lastname does not meet requirements ${nameLast}.`);
      });
    });

    describe('Password creation', () => {
      const passwords = ['Pass1', 'MyPassword', '123456789'];
      test.each(passwords)('Test for invalid password', (password) => {
        result = requestAuthRegister("test@example.com", password, 'Jane', 'Smith');
        expect(result).toStrictEqual(ERROR);
        expect(result.error).toStrictEqual(`Invalid password ${password}.`);
      });
    });
  });
});
