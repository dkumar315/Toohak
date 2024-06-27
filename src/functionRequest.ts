import request, { HttpVerb } from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// ============== helper function ====================================================
const requestHelper = (method: HttpVerb, path: string, payload: object, token?: string) => {
  let res;
  const header = { token: token };
  if (['GET', 'DELETE'].includes(method)) {
    res = request(method, SERVER_URL + path, { qs: { payload }, header });
  } else {// ['PUT', 'POST']
    res = request(method, SERVER_URL + path, { json: { payload }, header });
  }
  const bodyObject = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, body: bodyObject };
}

// ============== adminAuth ====================================================
export const requestAdminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
}

export const requestAdminAuthLogin = (email: string, password: string) => {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
}

// ============== adminUser ====================================================
export const requestAdminUserDetails = (token: string) => {
  return requestHelper('GET', '/v1/admin/user/details', {}, token);
}

// ============== other ========================================================
export const requestClear = () => {
  return requestHelper('DELETE', '/v1/admin/user/password', {});
}
