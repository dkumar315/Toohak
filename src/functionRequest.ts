import request, { HttpVerb } from 'sync-request-curl';
const config = require('./config.json');
const SERVER_URL = `${config.url}:${config.port}`;

// ============== helper function ====================================================
function requestHelper(method: HttpVerb, path: string, payload: object) {
  let res;
  if (['GET', 'DELETE'].includes(method)) {
    res = request(method, SERVER_URL + path, { qs: payload });
  } else { // ['PUT', 'POST']
    res = request(method, SERVER_URL + path, { json: payload });
  }

  const bodyObject = JSON.parse(res.body.toString());
  return { status: res.statusCode, ...bodyObject };
}

// ============== adminAuth ====================================================
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
}

export function requestAuthLogout(token: string) {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
}

// ============== adminUser ====================================================
export function requestUserDetails(token: string) {
  return requestHelper('GET', '/v1/admin/user/details', { token });
}

export function requestUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });
}

export function requestUserPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  return requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });
}

// ============== other ========================================================
export function requestClear() {
  return requestHelper('DELETE', '/v1/clear', {});
}
