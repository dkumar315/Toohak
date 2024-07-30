import {
  getData, Data, QuizSession, ErrorObject, States, QuestionSession
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

  const question: QuestionSession = session.metadata.questions[questionPosition - 1];
  return {
    questionId: question.questionId,
    playersCorrectList: question.playersCorrectList,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentCorrect
  };
};
