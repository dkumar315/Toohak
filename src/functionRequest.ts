import request, { HttpVerb } from 'sync-request';
// import { port, url } from './config.json';
// const SERVER_URL = `${url}:${port}`;
const SERVER_URL = 'http://127.0.0.1:3209';

// ============== helper function ====================================================
function requestHelper(method: HttpVerb, path: string, payload: object, token?: string) {
  let res;
  const headers = { token: token };
  if (['GET', 'DELETE'].includes(method)) {
    res = request(method, SERVER_URL + path, { qs: payload, headers });
  } else { // ['PUT', 'POST']
    res = request(method, SERVER_URL + path, { json: payload, headers });
  }
  // if error at JSON.parse check if is undefined
  const bodyString = res.body.toString();
  if (bodyString === undefined) {
    return { status: res.statusCode, error: `Error in requestHelper ${res}.` };
  }
  const bodyObject = JSON.parse(bodyString);
  // const bodyObject = JSON.parse(res.body.toString());
  return { status: res.statusCode, ...bodyObject };
}

// ============== adminAuth ====================================================
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
}

// ============== adminUser ====================================================
export function requestUserDetails(token: string) {
  return requestHelper('GET', '/v1/admin/user/details', {}, token);
}

// ============== other ========================================================
export function requestClear() {
  return requestHelper('DELETE', '/v1/clear', {});
}
