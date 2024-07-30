// npx ts-node src/checkRoutes.ts
import request, { HttpVerb, Response } from 'sync-request-curl';
const config = require('./config.json');
const SERVER_URL: string = `${config.url}:${config.port}`;
import { StatusCodes } from 'http-status-codes';
import { EmptyObject } from './dataStore';

import {
  authRegister, quizCreate, questionCreate,
  playerJoin, quizSessionCreate, requestClear
} from './functionRequest';

function requestHelper (
  method: HttpVerb,
  path: string,
  payload: object
) {
  let qs = {};
  let json = {};
  let headers = {};
  if ('token' in payload) {
    headers = { token: payload.token };
    delete payload.token;
  }
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const res: Response = request(method, SERVER_URL + path, { qs, json, headers });
  try {
    const bodyObject = JSON.parse(res.body.toString());
    return { status: res.statusCode, ...bodyObject };
  } catch (error: unknown) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: ''
    };
  }
}
requestClear();
const token = authRegister('email@email.com', 'Password1', 'first', 'last').token;
const imgUrl = 'https://image.png';
const quizid = quizCreate(token, 'quiz', '').quizId;
const questionBody = {
  question: `question of quiz ${quizid}`,
  duration: 10,
  points: 8,
  answers: [
    {
      answer: '1 right answer at least',
      correct: true
    },
    {
      answer: '2 answers minimum',
      correct: true
    }],
  thumbnailUrl: 'https://image.png'
};
questionCreate(token, quizid, questionBody);
const autoStartNum = 0;
const action = 'NEXT_QUESTION';
const name = '';
const questionposition = 1;
const sessionid: number = quizSessionCreate(token, quizid, autoStartNum).sessionId;
const playerid = playerJoin(sessionid, '').playerId;
const message = {
  message: {
    messageBody: 'msg'
  }
};
const answerIds: number[] = [];

const routes: { method: HttpVerb, route: string, payload: object }[] = [
  { method: 'PUT', route: '/v1/admin/quiz/{quizid}/thumbnail', payload: { token, imgUrl } },
  { method: 'GET', route: '/v1/admin/quiz/{quizid}/sessions', payload: { token } },
  { method: 'POST', route: '/v1/admin/quiz/{quizid}/session/start', payload: { token, autoStartNum } },
  { method: 'PUT', route: '/v1/admin/quiz/{quizid}/session/{sessionid}', payload: { token, action } },
  { method: 'GET', route: '/v1/admin/quiz/{quizid}/session/{sessionid}', payload: { token } },
  { method: 'GET', route: '/v1/admin/quiz/{quizid}/session/{sessionid}/results', payload: { token } },
  { method: 'GET', route: '/v1/admin/quiz/{quizid}/session/{sessionid}/results/csv', payload: { token } },
  { method: 'POST', route: '/v1/player/join', payload: { sessionId: sessionid, name } },
  { method: 'GET', route: '/v1/player/{playerid}', payload: {} },
  { method: 'GET', route: '/v1/player/{playerid}/question/{questionposition}', payload: {} },
  { method: 'PUT', route: '/v1/player/{playerid}/question/{questionposition}/answer', payload: { answerIds } },
  { method: 'GET', route: '/v1/player/{playerid}/question/{questionposition}/results', payload: {} },
  { method: 'GET', route: '/v1/player/{playerid}/results', payload: {} },
  { method: 'GET', route: '/v1/player/{playerid}/chat', payload: {} },
  { method: 'POST', route: '/v1/player/{playerid}/chat', payload: { message } }
];
let failed = 0;
routes.forEach(route => {
  try {
    const path = route.route.replace(/{quizid}/g, String(quizid))
      .replace(/{sessionid}/g, String(sessionid))
      .replace(/{playerid}/g, String(playerid))
      .replace(/{questionposition}/g, String(questionposition));
    const result = requestHelper(route.method, path, route.payload);
    if (result.status === 404) {
      throw new Error(`${route.method} ${route.route}`);
    }
  } catch (err) {
    failed++;
    console.log(`\x1b[33m${err.message}\x1b[0m not exist.`);
  }
});
if (failed !== 0) console.log(`${routes.length - failed} out of ${routes.length} passed.`);
