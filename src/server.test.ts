import { StatusCodes } from 'http-status-codes';
import request from 'sync-request-curl';
const config = require('./config.json');
const SERVER_URL: string = `${config.url}:${config.port}`;

describe('server functional', () => {
  test('non eist route', () => {
    const res = request('GET', SERVER_URL + '/invalid');
    expect(res.statusCode).toStrictEqual(StatusCodes.NOT_FOUND);
  });
});
