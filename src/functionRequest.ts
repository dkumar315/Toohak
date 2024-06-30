import request, { HttpVerb } from 'sync-request-curl';
const config = require('./config.json')
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

// ============== adminUser ====================================================
export function requestUserDetails(token: string) {
  return requestHelper('GET', '/v1/admin/user/details', { token });
}

// ============== other ========================================================
export function requestClear() {
  return requestHelper('DELETE', '/v1/clear', {});
}
