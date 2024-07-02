import { requestAuthRegister, requestAuthLogin, requestUserDetails } from "./functionRequest";
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

describe('adminAuthLogin', () => {
  describe('Successful Login', () => {
    test('Test for valid login', () => {
      adminAuthLogin('jane@example.com', 'MyPassw0rd');
      result = requestAuthLogin('jane@example.com', 'MyPassw0rd');
      expect(result.status).toStrictEqual(OK);
    });
  });

  describe('Email input', () => {
    test('Test for non-existent email', () => {
      result = requestAuthLogin(' ', 'MyPassw0rd');
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Test for wrong email', () => {
      result = requestAuthLogin('fakejane@example.com', 'MyPassw0rd');
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });
  });

  describe('Password input', () => {
    test('Test for invalid password', () => {
      result = requestAuthLogin('jane@example.com', 'Invalid Password');
      expect(result.status).toStrictEqual(BAD_REQUEST);
    });

    test('Test for empty password input', () => {
      result = requestAuthLogin('jane@example.com', '');
      expect(result.status).toStrictEqual(BAD_REQUEST);
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
      result = requestAuthLogin('invalid@example.com', 'MyPassw0rd');
      expect(result.status).toStrictEqual(BAD_REQUEST);

      const userDetail = adminUserDetails(authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(1);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('Test for login with invalid password', () => {
      const authUserId = result.authUserId;
      result = requestAuthLogin('jane@example.com', 'Passw0rd');
      expect(result.status).toStrictEqual(BAD_REQUEST);

      const userDetail = adminUserDetails(authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(1);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('Test successful login after invalid password', () => {
      adminAuthLogin('jane@example.com', 'Passw0rd');
      result = requestAuthLogin('jane@example.com', 'MyPassw0rd');
      expect(result.status).toStrictEqual(OK);

      let userDetail = adminUserDetails(result.authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(2);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

      result = adminAuthLogin('jane@example.com', 'MyPassw0rd');
      userDetail = adminUserDetails(result.authUserId).user;
      expect(userDetail.numSuccessfulLogins).toStrictEqual(3);
      expect(userDetail.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});