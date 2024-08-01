import express, { json, Request, Response, NextFunction } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file),
  { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ====================
// ====================================================================
import { StatusCodes } from 'http-status-codes';
import { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import { newEcho } from './newecho';
import {
  adminAuthRegister, adminAuthLogin, adminAuthLogout,
  adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate
} from './auth';
import {
  adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo,
  adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizThumbnailUpdate,
  adminQuizTrashList, adminQuizRestore, adminQuizTransfer, adminQuizTrashEmpty
} from './quiz';
import {
  adminQuizQuestionCreate, adminQuizQuestionUpdate,
  adminQuizQuestionDelete, adminQuizQuestionMove, adminQuizQuestionDuplicate
} from './quizQuestion';
import {
  adminQuizSessionList, adminQuizSessionCreate, adminQuizSessionUpdate,
  adminQuizSessionStatus, adminQuizSessionResults, adminQuizSessionResultsCSV
} from './quizSession';
import { playerJoin, playerStatus, playerResults } from './player';
import { playerQuestionInfo, playerQuestionAnswer, playerQuestionResults } from './playerQuestion';
import { playerChatCreate, playerChatList } from './playerChat';
import { clear } from './other';

// ====================================================================
// ============= ROUTES ARE DEFINED BELOW THIS LINE ===================
// ====================================================================

// ====================================================================
//                        example echo
// ====================================================================
// Example get request with error handler (iter3)
app.get('/newecho', (req: Request, res: Response) => {
  res.json(newEcho(req.query.echo as string));
});

// Example get request (iter3)
// app.get('/newecho', (req: Request, res: Response) => {
//   let result: ReturnType<typeof newEcho>;
//   try {
//     result = newEcho(req.query.echo as string);
//     res.json(result);
//   } catch (error: unknown) {
//     res.status(BAD_REQUEST).json({ error: error.message });
//   }
// });

// Example get request (iter2)
app.get('/echo', (req: Request, res: Response) => {
  const result: ReturnType<typeof echo> = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(BAD_REQUEST).json(result);
  } else {
    res.json(result);
  }
});

// ====================================================================
//                          adminAuth
// ====================================================================

// Register an admin user (v1 only)
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(adminAuthRegister(email, password, nameFirst, nameLast));
});

// Login an admin user (v1 only)
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  res.json(adminAuthLogin(req.body.email, req.body.password));
});

// Logs out an admin user who has active user session (v1)
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  res.json(adminAuthLogout(req.body.token));
});

// Logs out an admin user who has active user session (v2)
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  res.json(adminAuthLogout(req.header('token')));
});

// ====================================================================
//                          adminUser
// ====================================================================

// Get the details of an admin user (v1)
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  res.json(adminUserDetails(req.query.token as string));
});

// Get the details of an admin user (v2)
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  res.json(adminUserDetails(req.header('token')));
});

// Update the details of an admin user (non-password) (v1)
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  res.json(adminUserDetailsUpdate(token, email, nameFirst, nameLast));
});

// Update the details of an admin user (non-password) (v2)
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email, nameFirst, nameLast } = req.body;
  res.json(adminUserDetailsUpdate(token, email, nameFirst, nameLast));
});

// Update the password of this admin user (v1)
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  res.json(adminUserPasswordUpdate(token, oldPassword, newPassword));
});

// Update the password of this admin user (v2)
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token');
  const { oldPassword, newPassword } = req.body;
  res.json(adminUserPasswordUpdate(token, oldPassword, newPassword));
});

// ====================================================================
//                          adminQuiz
// ====================================================================

// List all user's quizzes (v1)
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  res.json(adminQuizList(req.query.token as string));
});

// List all user's quizzes (v2)
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  res.json(adminQuizList(req.header('token')));
});

// Create a new quiz (v1)
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  res.json(adminQuizCreate(token, name, description));
});

// Create a new quiz (v2)
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, description } = req.body;
  res.json(adminQuizCreate(token, name, description));
});

// Send a quiz to trash (v1)
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizRemove(req.query.token as string, quizId));
});

// Send a quiz to trash (v2)
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizRemove(req.header('token'), quizId));
});

// To view quizzes in trash (v1)
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  res.json(adminQuizTrashList(req.query.token as string));
});

// To view quizzes in trash (v2)
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  res.json(adminQuizTrashList(req.header('token')));
});

// Get info about current quiz (v1)
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizInfo(req.query.token as string, quizId));
});

// Get info about current quiz (v2)
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizInfo(req.header('token'), quizId));
});

// Update quiz name (v1)
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizNameUpdate(req.body.token, quizId, req.body.name));
});

// Update quiz name (v2)
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizNameUpdate(req.header('token'), quizId, req.body.name));
});

// Update quiz description (v1)
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token: string = req.body.token;
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizDescriptionUpdate(token, quizId, req.body.description));
});

// Update quiz description (v2)
app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizDescriptionUpdate(token, quizId, req.body.description));
});

// Restore a quiz from trash (v1)
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token: string = req.body.token;
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizRestore(token, quizId));
});

// Restore a quiz from trash (v2)
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizRestore(token, quizId));
});

// Permanently delete specific quizzes currently sitting in the trash (v1)
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token: string = req.query.token as string;
  const quizIds: number[] = (req.query.quizIds as string[]).map(Number);
  return res.json(adminQuizTrashEmpty(token, quizIds));
});

// Permanently delete specific quizzes currently sitting in the trash (v2)
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizIds: number[] = (req.query.quizIds as string[]).map(Number);
  return res.json(adminQuizTrashEmpty(token, quizIds));
});

// Transfer quiz ownership (v1)
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token: string = req.body.token;
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizTransfer(token, quizId, req.body.email));
});

// Transfer quiz ownership (v2)
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizTransfer(token, quizId, req.body.email));
});

// Update the quiz thumbnail
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.header('token') || '';
  const quizId = parseInt(req.params.quizid);
  res.json(adminQuizThumbnailUpdate(quizId, req.body.imgUrl, token));
});

// ====================================================================
//                          adminQuizQuestion
// ====================================================================

// Create quiz question (v1)
app.post('/v1/admin/quiz/:quizid/question',
  (req: Request, res: Response) => {
    const token: string = req.body.token;
    const quizId: number = parseInt(req.params.quizid as string);
    res.json(adminQuizQuestionCreate(token, quizId, req.body.questionBody));
  });

// Create quiz question (v2)
app.post('/v2/admin/quiz/:quizid/question',
  (req: Request, res: Response) => {
    const token: string = req.header('token');
    const quizId: number = parseInt(req.params.quizid as string);
    res.json(adminQuizQuestionCreate(token, quizId, req.body.questionBody));
  });

// Update quiz question (v1)
app.put('/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const token: string = req.body.token;
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionUpdate(token, quizId, questionId, req.body.questionBody));
  });

// Update quiz question (v2)
app.put('/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const token: string = req.header('token');
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionUpdate(token, quizId, questionId, req.body.questionBody));
  });

// Delete quiz question (v1)
app.delete('/v1/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const token: string = req.query.token as string;
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionDelete(token, quizId, questionId));
  });

// Delete quiz question (v2)
app.delete('/v2/admin/quiz/:quizid/question/:questionid',
  (req: Request, res: Response) => {
    const token: string = req.header('token');
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionDelete(token, quizId, questionId));
  });

// Move quiz question (v1)
app.put('/v1/admin/quiz/:quizid/question/:questionid/move',
  (req: Request, res: Response) => {
    const token: string = req.body.token;
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionMove(token, quizId, questionId, req.body.newPosition));
  });

// Move quiz question (v2)
app.put('/v2/admin/quiz/:quizid/question/:questionid/move',
  (req: Request, res: Response) => {
    const token: string = req.header('token');
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionMove(token, quizId, questionId, req.body.newPosition));
  });

// Duplicate quiz question (v1)
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate',
  (req: Request, res: Response) => {
    const token: string = req.body.token;
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionDuplicate(token, quizId, questionId));
  });

// Duplicate quiz question (v2)
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate',
  (req: Request, res: Response) => {
    const token: string = req.header('token');
    const quizId: number = parseInt(req.params.quizid as string);
    const questionId: number = parseInt(req.params.questionid as string);
    res.json(adminQuizQuestionDuplicate(token, quizId, questionId));
  });

// ====================================================================
//                          adminQuizSession
// ====================================================================

// Get active and inactive session ids for a quiz
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizSessionList(token, quizId));
});

// Start a new session for a quiz
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizSessionCreate(token, quizId, req.body.autoStartNum));
});

// Update a quiz session state
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  const sessionId: number = parseInt(req.params.sessionid as string);
  res.json(adminQuizSessionUpdate(token, quizId, sessionId, req.body.action));
});

// Get quiz session status
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  const sessionId: number = parseInt(req.params.sessionid as string);
  res.json(adminQuizSessionStatus(token, quizId, sessionId));
});

// Get the final results for a completed quiz session
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  const sessionId: number = parseInt(req.params.sessionid as string);
  res.json(adminQuizSessionResults(token, quizId, sessionId));
});

// Get qizsession final results in CSV format
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv',
  (req: Request, res: Response) => {
    const token: string = req.header('token');
    const quizId: number = parseInt(req.params.quizid as string);
    const sessionId: number = parseInt(req.params.sessionid as string);
    res.json(adminQuizSessionResultsCSV(token, quizId, sessionId));
  });

// ====================================================================
//                          player
// ====================================================================

// Allow a guest player to join a session
app.post('/v1/player/join', (req: Request, res: Response) => {
  res.json(playerJoin(req.body.sessionId, req.body.name));
});

// Get the status of a guest player in a session
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerid as string);
  res.json(playerStatus(playerId));
});

// Session Result
app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerid as string);
  res.json(playerResults(playerId));
});

// ====================================================================
//                          playerQuestion
// ====================================================================

// Get information about a question for a player
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerid as string);
  const questionPosition: number = parseInt(req.params.questionposition as string);
  res.json(playerQuestionInfo(playerId, questionPosition));
});

// Allow the current player to submit answer(s)
app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerid as string);
  const questionPosition: number = parseInt(req.params.questionposition as string);
  res.json(playerQuestionAnswer(playerId, questionPosition, req.body));
});

// Get Question Results
app.get('/v1/player/:playerid/question/:questionposition/results',
  (req: Request, res: Response) => {
    const playerId: number = parseInt(req.params.playerid as string);
    const questionPosition: number = parseInt(req.params.questionposition as string);
    res.json(playerQuestionResults(playerId, questionPosition));
  });

// ====================================================================
//                          playerChat
// ====================================================================

// Get chat messages for a player in a session
app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerid as string);
  res.json(playerChatList(playerId));
});

// Send chat message in session
app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId: number = parseInt(req.params.playerid as string);
  res.json(playerChatCreate(playerId, req.body.message));
});

// ====================================================================
//                          other
// ====================================================================

// other
// Reset the state of the application back to the start
app.delete('/v1/clear', (req: Request, res: Response) => {
  res.json(clear());
});

// ====================================================================
//           Errors are thrown in the following order:
//   401 (UNAUTHORIZED), then 403 (FORBIDDEN), then 400 (BAD_REQUEST)
// ====================================================================

// errorHandler
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let message = `Unknown error: ${error}`;
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  if (error instanceof Error) {
    message = error.message;
    if (message.includes('token')) {
      statusCode = UNAUTHORIZED;
    } else if (message.includes('quizId')) {
      statusCode = FORBIDDEN;
    } else {
      statusCode = BAD_REQUEST;
    }
  }

  res.status(statusCode).json({ error: message });
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ====================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
