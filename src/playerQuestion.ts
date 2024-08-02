import {
  getData, setData, Data, QuizSession,
  ErrorObject, States, QuestionSession,
  EmptyObject, INVALID, Answer
} from './dataStore';

import {
  PlayerIndices, findSessionPlayer, timeStamp,
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

  const session = data.quizSessions.find(session =>
    session.players.some(player => player.playerId === playerId));
  if (!session) {
    throw new Error(`Player ID ${playerId} does not exist.`);
  }

  if (questionPosition < 1 || questionPosition > session.questionSessions.length) {
    throw new Error(`Question position ${questionPosition} is invalid for the session.`);
  }

  if (session.state !== States.QUESTION_OPEN) {
    throw new Error(`Session is in an invalid state: ${session.state}`);
  }

  const question = session.metadata.questions[questionPosition - 1];

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

  if (answerIds.length < 1) {
    throw new Error('At least one answer ID must be submitted');
  }

  if (new Set(answerIds).size !== answerIds.length) {
    throw new Error('Duplicate answer IDs are not allowed');
  }

  const questionSession = session.questionSessions[questionPosition - 1];
  const answers = session.metadata.questions[questionPosition - 1].answers;

  const validIds = answers.filter(ans => answerIds.includes(ans.answerId));
  if (validIds.length !== answerIds.length) {
    throw new Error(`Answer ${answerIds} is not valid for this question`);
  }

  const correctAnswer = (answerIds: number[], answers: Answer[]) =>
    answerIds.every((id: number) =>
      answers.find(ans => ans.answerId === id).correct
    );
  const answerNum = answers.filter(ans => ans.correct === true).length;

  const answerIndex = questionSession.playerAnswers
    .findIndex(p => p.playerId === playerId);
  if (answerIndex !== INVALID) {
    questionSession.playerAnswers.splice(answerIndex, 1);
    session.players[isvalidPlayer.playerIndex].timeTaken -=
    questionSession.playerAnswers[answerIndex].timeTaken;
  }

  const timeTaken: number = timeStamp() - questionSession.timeStart;
  questionSession.playerAnswers.push({
    playerId,
    answerIds,
    correct: correctAnswer && answerNum === answerIds.length,
    timeTaken,
  });
  session.players[isvalidPlayer.playerIndex].timeTaken += timeTaken;
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
