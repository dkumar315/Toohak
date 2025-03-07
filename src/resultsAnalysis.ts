import {
  getData, setData, Data, QuizSession, Player,
  QuestionSession, PlayerScore, PlayerAnswer
} from './dataStore';

export const resultsAnalysis = (sessionIndex: number): void => {
  const data: Data = getData();
  let session: QuizSession = data.quizSessions[sessionIndex];

  session = questionResults(session);
  setData(data);

  session.playerScores = playerQuestinResults(session);
  setData(data);
};

const questionResults = (session: QuizSession): QuizSession => {
  session.questionSessions.forEach((questionSession: QuestionSession) => {
    const correctAnswers = questionSession.playerAnswers
      .filter((answer: PlayerAnswer) => answer.correct);
    const correctPlayers = correctAnswers.length;

    questionSession.playersCorrectList = correctAnswers
      .map((answer: PlayerAnswer) =>
        session.players.find((player: Player) =>
          player.playerId === answer.playerId).name
      );

    if (correctPlayers > 0) {
      const totalTime = correctAnswers
        .reduce((sum: number, answer: PlayerAnswer) =>
          sum + answer.timeTaken, 0);
      questionSession.averageAnswerTime = Math.round(totalTime / correctPlayers);
    } else {
      questionSession.averageAnswerTime = 0;
    }

    questionSession.percentCorrect = Math.round(
      (correctPlayers / questionSession.playerAnswers.length) * 100);
  });
  return session;
};

const playerQuestinResults = (session: QuizSession): PlayerScore[] => {
  const playerScores: Map<string, PlayerScore> = new Map();
  session.players.forEach((player: Player) => {
    playerScores.set(String(player.playerId), { name: player.name });
  });

  session.questionSessions.forEach(
    (questionSession: QuestionSession, questionIndex: number) => {
      const questionPoints = session.metadata.questions[questionIndex].points;
      const questionNumber = questionIndex + 1;

      playerScores.forEach(playerScore => {
        playerScore[`question${questionNumber}score`] = 0;
        playerScore[`question${questionNumber}rank`] = 0;
      });

      questionSession.playerAnswers
        .filter((ans: PlayerAnswer) => ans.correct === true)
        .forEach((answer: PlayerAnswer, index: number) => {
          const playerScore = playerScores.get(String(answer.playerId));
          const rank = index + 1;
          playerScore[`question${questionNumber}score`] =
          Math.round(questionPoints / rank);
          playerScore[`question${questionNumber}rank`] = rank;
        });
    });

  session.players.forEach((player: Player) => {
    const playerScore = playerScores.get(String(player.playerId));
    const totalScore = Object.keys(playerScore)
      .filter(key => key.endsWith('score'))
      .reduce((sum, key) => sum + Number(playerScore[key]), 0);
    player.score = totalScore;
  });

  return Array.from(playerScores.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};
