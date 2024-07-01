import { OK, BAD_REQUEST, UNAUTHORIZED, EmptyObject, ErrorObject } from './dataStore';
import { requestAuthRegister, requestAuthLogin, requestAuthLogout } from './functionRequest';
const ERROR: ErrorObject = { error: expect.any(String) };
interface ResError {
  status: typeof BAD_REQUEST | typeof UNAUTHORIZED;
  error: string;
}

const VALID_RETURN: EmptyObject = {};

// /v1/admin/auth/logout
describe('testing /v1/admin/auth/logout adminAuthLogout', () => {
	describe('test1.0 valid returns', () => {
		test.todo('test 1.1 single user successfully logout');
		test.todo('test 1.2 mutilple logout for different tokens of a same user');
		test.todo('test 1.3 user1 login, user2 login, user1 logout and user1 login');
	});
	describe('test2.0 valid returns', () => {
		test.todo('test 2.1 token is empty');
		test.todo('test 2.2 token is invalid, non-existent token');
		test.todo('test 2.3 token is invalid, user log out twice');
	});
	describe('test3.0 test with other function', () => {
		test.todo('test 3.1 logout user1 not affect user2');
		test.todo('test 3.2 logout after email change');
		test.todo('test 3.3 logout after password change');
	})
});