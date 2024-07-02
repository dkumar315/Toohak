import { requestAuthRegister, requestAuthLogin } from "./functionRequest";
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails
} from "./auth";

import { clear } from "./other";
import { OK, BAD_REQUEST } from "./dataStore";

let result: any;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
  result = adminAuthRegister('jane@example.com', 'MyPassw0rd', 'Jane', 'Smith');
});

describe('adminAuthRegister', () => {
  describe('Valid Registration', () => {
    test('Test for Single user', () => {
      expect(result.status).toStrictEqual(OK);
    });

    test('Test for names containing spaces, hyphens, and apostrophes', () => {
      const name = 'J a-n\'e';
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result.status).toStrictEqual(OK);

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'jane', name);
      expect(result.status).toStrictEqual(OK);
    });

    test('Test for names just meet require (name length = 2)', () => {
      const name = 'Ja';
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result.status).toStrictEqual(OK);

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', name);
      expect(result.status).toStrictEqual(OK);
    });

    test('Test for names just meet require (name length = 20)', () => {
      const name = 'JJJJJJJJJJJJJJJJJJJJ';
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', name, 'Smith');
      expect(result.status).toStrictEqual(OK);

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', name);
      expect(result.status).toStrictEqual(OK);
    });

    test('Test for password just meet require (length = 8)', () => {
      const password = 'passw0rd';
      result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
      expect(result.status).toStrictEqual(OK);
    });

    test('Test for password with specail characters', () => {
      const password = 'passw0rd@#&/?><|';
      result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
      expect(result.status).toStrictEqual(OK);
    });

    test('Test for mutiple users', () => {
      result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result.status).toStrictEqual(OK);

      result = requestAuthRegister('test2@example.com', 'MyPassw0rd', 'Jane', 'Smith');
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('Invalid Registration', () => {
    describe('Email creation', () => {
      test('Email address is used by another user', () => {
        const email = 'test@example.com';
        result = requestAuthRegister(email, 'MyPassw0rd', 'Jane', 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestAuthRegister('jane@example.com', 'MyPassw0rd', 'Sarah', 'Parker');
        expect(result.status).toStrictEqual(BAD_REQUEST);

        result = requestAuthRegister(email, 'MyPassw0rd', 'Sarah', 'Parker');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Email does not satisfy (email with string only)', () => {
        result = requestAuthRegister('123', 'MyPassw0rd', 'Jane', 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('Username creation', () => {
      // nameFirst
      test('Test for invalid nameFirst input (number)', () => {
        const nameFirst = 'Jan3';
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for invalid nameFirst input (@#&/?><|)', () => {
        const nameFirst = 'J@#&/?><|ne';
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for nameFirst length less than 2 characters', () => {
        const nameFirst = 'J';
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for nameFirst length exceeding 20 characters', () => {
        const nameFirst = 'JaneJaneJaneJaneJanee';
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', nameFirst, 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      // nameLast
      test('Test for invalid nameLast input (number)', () => {
        const result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', '5mith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for invalid nameLast input (@@#&/?><|)', () => {
        const nameLast = 'Sm@#&/?><|th';
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for nameLast length less than 2 characters', () => {
        const nameLast = 'S';
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for nameLast length exceeding 20 characters', () => {
        const nameLast = 'SmithSmithSmithSmiths';
        result = requestAuthRegister('test@example.com', 'MyPassw0rd', 'Jane', nameLast);
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });

    describe('Password creation', () => {
      test('Test for password length less than 8 characters', () => {
        const password = 'Pass1';
        result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for password missing a number', () => {
        const password = 'MyPassword';
        result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });

      test('Test for password missing a letter', () => {
        const password = '123456789';
        const result = requestAuthRegister('test@example.com', password, 'Jane', 'Smith');
        expect(result.status).toStrictEqual(BAD_REQUEST);
      });
    });
  });
});
