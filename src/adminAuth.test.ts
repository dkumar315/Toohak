import { requestAuthRegister, requestAuthLogin, requestUserDetails, requestClear } from './functionRequest';
import { OK, BAD_REQUEST } from './dataStore';

let result: any;
const ERROR = { status: BAD_REQUEST, error: expect.any(String) };

beforeEach(() => {
  requestClear();
  result = requestAuthRegister('jane@example.com', 'MyPassw0rd', 'Jane', 'Smith');
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
    expect(result.error).toStrictEqual(`Invalid email ${email}.`);
  });

  // passwords
  const passwords = ['Pass1', 'MyPassword', '123456789', 'Invalid Password', ' '];
  test.each(passwords)('Test for invalid password', (password) => {
    result = requestAuthLogin('jane@example.com', password);
    expect(result).toStrictEqual(ERROR);
    expect(result.error).toStrictEqual(`Invalid password ${password}.`);
  });
});

