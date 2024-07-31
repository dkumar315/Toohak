import { getData, States, State } from './dataStore';

export const playerQuestionPosition = (playerId: number, questionPosition: number) => {
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
