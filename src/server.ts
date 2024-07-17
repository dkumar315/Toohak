import express, { json, Request, Response } from 'express';
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
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
import { BAD_REQUEST, UNAUTHORIZED, FORBIDDEN } from './dataStore';
import {
  adminAuthRegister, adminAuthLogin, adminAuthLogout,
  adminUserDetails, adminUserDetailsUpdate,
  adminUserPasswordUpdate
} from './auth';
import {
  adminQuizList, adminQuizCreate, adminQuizRemove,
  adminQuizInfo, adminQuizNameUpdate,
  adminQuizDescriptionUpdate, adminQuizViewTrash,
  adminQuizRestore, adminQuizTransfer
} from './quiz';
import {
  adminQuizQuestionCreate, adminQuizQuestionUpdate,
  adminQuizQuestionDelete, adminQuizQuestionMove, adminQuizQuestionDuplicate
} from './quizQuestion';
import { clear } from './other';

// Routes
// Errors are thrown in the following order:
// 401 (UNAUTHORIZED), then 403 (FORBIDDEN), then 400 (BAD_REQUEST)
//
// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(BAD_REQUEST).json(result);
  } else {
    res.json(result);
  }
});

// adminAuth
// Register an admin user
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = adminAuthRegister(email, password, nameFirst, nameLast);
  if ('error' in result) {
    return res.status(BAD_REQUEST).json(result);
  }
  return res.json(result);
});

// Login an admin user
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);
  if ('error' in result) {
    return res.status(BAD_REQUEST).json(result);
  }
  return res.json(result);
});

// Logs out an admin user who has active user session
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminAuthLogout(token);
  if ('error' in result) {
    return res.status(UNAUTHORIZED).json(result);
  }
  return res.json(result);
});

// adminUser
// Get the details of an admin user
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminUserDetails(token);
  if ('error' in result) {
    return res.status(UNAUTHORIZED).json(result);
  }
  return res.json(result);
});

// Update the details of an admin user (non-password)
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email, nameFirst, nameLast } = req.body;
  const result = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// Update the password of this admin user
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token');
  const { oldPassword, newPassword } = req.body;
  const result = adminUserPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// adminQuiz
// List all user's quizzes
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminQuizList(token);
  if ('error' in result) {
    res.status(UNAUTHORIZED);
  }
  return res.json(result);
});

// Create a new quiz
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, description } = req.body;
  const result = adminQuizCreate(token, name, description);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// Send a quiz to trash
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizRemove(token, quizId);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('QuizId')) {
      return res.status(FORBIDDEN).json(result);
    }
  }
  return res.json(result);
});

// To view quizzes in trash
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminQuizViewTrash(token);
  if ('error' in result) {
    return res.status(UNAUTHORIZED).json(result);
  }
  return res.json(result);
});

// Get info about current quiz
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizInfo(token, quizId);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('QuizId')) {
      return res.status(FORBIDDEN).json(result);
    }
  }
  return res.json(result);
});

// Update quiz name
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizNameUpdate(token, quizId, name);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('QuizId')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// Update quiz description
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token = req.header('token');
  const { description } = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizDescriptionUpdate(token, quizId, description);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('QuizId')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// Restore a quiz from trash
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid as string);
  const result = adminQuizRestore(token, quizId);
  if ('error' in result) {
    if (result.error.includes('Invalid token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('does not own')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// Transfer quiz ownership
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;
  const transferData = { token, quizId, userEmail };
  const result = adminQuizTransfer(transferData);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('owner')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// adminQuizQuestion
// Create quiz question
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid as string);
  const { questionBody } = req.body;

  const result = adminQuizQuestionCreate(token, quizId, questionBody);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('quizId')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// Update quiz question
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const { questionBody } = req.body;

  const result = adminQuizQuestionUpdate(token, quizId, questionId, questionBody);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('quizId')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// Delete quiz question
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const result = adminQuizQuestionDelete(token, quizId, questionId);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('quizId')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }

  return res.json(result);
});

// Move quiz question
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const { newPosition } = req.body;

  const result = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('quizId')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }

  return res.json(result);
});

// Duplicate quiz question
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);

  const result = adminQuizQuestionDuplicate(token, quizId, questionId);
  if ('error' in result) {
    if (result.error.includes('token')) {
      return res.status(UNAUTHORIZED).json(result);
    } else if (result.error.includes('quizId')) {
      return res.status(FORBIDDEN).json(result);
    } else {
      return res.status(BAD_REQUEST).json(result);
    }
  }
  return res.json(result);
});

// other
// Reset the state of the application back to the start
app.delete('/v1/clear', (req: Request, res: Response) => {
  return res.json(clear());
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
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
