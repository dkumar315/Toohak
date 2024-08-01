import {
  getData, setData, Data, QuizSession,
  ErrorObject, States, QuestionSession,
  EmptyObject
} from './dataStore';

import {
  PlayerIndices, findSessionPlayer
} from './helperFunctions';

const QUESTION_POSITION_START = 1;

export type PlayerQuestionResults = {
  questionId: number,
  playersCorrectList: string[],
  averageAnswerTime: number,
  percentCorrect: number
}

export const playerQuestionInfo = (playerId: number, questionPosition: number) => {
  const data = getData();

  const session = data.quizSessions.find(session => session.players.some(player => player.playerId === playerId));
  if (!session) {
    throw new Error(`Player ID ${playerId} does not exist`);
  }

  if (questionPosition < 1 || questionPosition > session.questionSessions.length) {
    throw new Error(`Question position ${questionPosition} is not valid for the session`);
  }

  const invalidStates: State[] = [States.LOBBY, States.QUESTION_COUNTDOWN, States.FINAL_RESULTS, States.END];
  if (invalidStates.includes(session.state)) {
    throw new Error(`Session is in an invalid state: ${session.state}`);
  }

  const questionSession = session.questionSessions[questionPosition - 1];
  const quiz = data.quizzes.find(quiz => quiz.quizId === session.metadata.quizId);
  const question = quiz.questions.find(q => q.questionId === questionSession.questionId);

  return {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: question.answers.map(answer => ({
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour,
    })),
  };
};

export const playerQuestionAnswer = (
  playerId: number,
  questionPosition: number,
  answerIds: number[]
): EmptyObject | ErrorObject => {
  const isvalidPlayer: PlayerIndices | ErrorObject = findSessionPlayer(playerId);
  if ('error' in isvalidPlayer) throw new Error(isvalidPlayer.error);

  const data: Data = getData();
  const session: QuizSession = data.quizSessions[isvalidPlayer.sessionIndex];

  if (session.state !== States.QUESTION_OPEN) {
    throw new Error(`Session is not in the correct state: ${session.state}`);
  }

  if (questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw new Error(`Question position ${questionPosition} is not valid for the session`);
  }

  const questionSession = session.questionSessions[questionPosition - 1];
  const quiz = data.quizzes.find(quiz => quiz.quizId === session.metadata.quizId);
  const question = quiz.questions.find(q => q.questionId === questionSession.questionId);

  const validAnswerIds = new Set(question.answers.map(answer => answer.answerId));
  if (answerIds.length < 1) {
    throw new Error('At least one answer ID must be submitted');
  }

  if (new Set(answerIds).size !== answerIds.length) {
    throw new Error('Duplicate answer IDs are not allowed');
  }

  for (const id of answerIds) {
    if (!validAnswerIds.has(id)) {
      throw new Error(`Answer ID ${id} is not valid for this question`);
    }
  }

  const existingAnswer = questionSession.playerAnswers.find(pa => pa.playerId === playerId);
  if (existingAnswer) {
    existingAnswer.answerIds = answerIds;
    existingAnswer.timeSent = Math.floor(Date.now() / 1000);
    existingAnswer.correct = answerIds.some(id => question.answers.find(a => a.answerId === id).correct);
  } else {
    questionSession.playerAnswers.push({
      playerId,
      answerIds,
      correct: answerIds.some(id => question.answers.find(a => a.answerId === id).correct),
      timeSent: Math.floor(Date.now() / 1000)
    });
  }

  setData(data);
  return {};
};

export const playerQuestionResults = (
  playerId: number,
  questionPosition: number
): PlayerQuestionResults => {
  const isvalidPlayer: PlayerIndices | ErrorObject = findSessionPlayer(playerId);
  if ('error' in isvalidPlayer) throw new Error(isvalidPlayer.error);

  const data: Data = getData();
  const session: QuizSession = data.quizSessions[isvalidPlayer.sessionIndex];

  if (questionPosition < QUESTION_POSITION_START ||
    questionPosition > session.metadata.numQuestions) {
    throw new Error(`QuestionPosition ${questionPosition} invalid.`);
  }

  if (session.state !== States.ANSWER_SHOW) {
    throw new Error(`Results are not available in state: ${session.state}.`);
  }

  const question: QuestionSession = session.questionSessions[questionPosition - 1];
  return {
    questionId: question.questionId,
    playersCorrectList: question.playersCorrectList,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentCorrect
  };
};
