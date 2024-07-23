import express, { json, Request, Response, NextFunction } from 'express';
import { echo, newEcho } from './newecho';
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
  { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } })
);

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ====================
// ====================================================================
import { StatusCodes } from 'http-status-codes';
import { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';

// fixme check function order
import {
  adminAuthRegister, adminAuthLogin, adminAuthLogout,
  adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate
} from './auth';
import {
  adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo,
  adminQuizNameUpdate, adminQuizDescriptionUpdate,
  adminQuizViewTrash, adminQuizRestore, adminQuizTransfer, adminQuizTrashEmpty
} from './quiz';
import {
  adminQuizQuestionCreate, adminQuizQuestionUpdate,
  adminQuizQuestionDelete, adminQuizQuestionMove, adminQuizQuestionDuplicate
} from './quizQuestion';
import {
  adminQuizSessionCreate, adminQuizSessionUpdate
} from './quizSession';
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

// Register an admin user
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(adminAuthRegister(email, password, nameFirst, nameLast));
});

// Login an admin user
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  res.json(adminAuthLogin(req.body.email, req.body.password));
});

// Logs out an admin user who has active user session
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  res.json(adminAuthLogout(req.header('token')));
});

// ====================================================================
//                          adminUser
// ====================================================================

// Get the details of an admin user
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  res.json(adminUserDetails(req.header('token')));
});

// Update the details of an admin user (non-password)
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const { email, nameFirst, nameLast } = req.body;
  res.json(adminUserDetailsUpdate(token, email, nameFirst, nameLast));
});

// Update the password of this admin user
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const { oldPassword, newPassword } = req.body;
  res.json(adminUserPasswordUpdate(token, oldPassword, newPassword));
});

// ====================================================================
//                          adminQuiz
// ====================================================================

// List all user's quizzes
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  res.json(adminQuizList(req.header('token')));
});

// Create a new quiz
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const { name, description } = req.body;
  res.json(adminQuizCreate(token, name, description));
});

// Send a quiz to trash
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizRemove(req.header('token'), quizId));
});

// To view quizzes in trash
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  res.json(adminQuizViewTrash(req.header('token')));
});

// Get info about current quiz
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizInfo(req.header('token'), quizId));
});

// Update quiz name
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizNameUpdate(req.header('token'), quizId, req.body.name));
});

// Update quiz description
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizDescriptionUpdate(token, quizId, req.body.description));
});

// Restore a quiz from trash
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizRestore(token, quizId));
});

// Permanently delete specific quizzes currently sitting in the trash
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizIds: number[] = (req.query.quizIds as string[]).map(Number);
  return res.json(adminQuizTrashEmpty(token, quizIds));
});

// Transfer quiz ownership
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizTransfer(token, quizId, req.body.email));
});

// ====================================================================
//                          adminQuizQuestion
// ====================================================================

// Create quiz question
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizQuestionCreate(token, quizId, req.body.questionBody));
});

// Update quiz question
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  const questionId: number = parseInt(req.params.questionid as string);
  res.json(adminQuizQuestionUpdate(token, quizId, questionId, req.body.questionBody));
});

// Delete quiz question
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  const questionId: number = parseInt(req.params.questionid as string);
  res.json(adminQuizQuestionDelete(token, quizId, questionId));
});

// Move quiz question
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  const questionId: number = parseInt(req.params.questionid as string);
  res.json(adminQuizQuestionMove(token, quizId, questionId, req.body.newPosition));
});

// Duplicate quiz question
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  const questionId: number = parseInt(req.params.questionid as string);
  res.json(adminQuizQuestionDuplicate(token, quizId, questionId));
});

// ====================================================================
//                          adminQuizSession
// ====================================================================

// Start a new session for a quiz
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token: string = req.header('token');
  const quizId: number = parseInt(req.params.quizid as string);
  res.json(adminQuizSessionCreate(token, quizId, req.body.autoStartNum));
});

// ====================================================================
//                          other
// ====================================================================

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
  if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    console.error(`Error occurred: ${message}`);
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
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
