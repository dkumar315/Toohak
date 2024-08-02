import {
  getData, setData, Data, States, Quiz, QuizSession, EmptyObject,
  State, Metadata, Player, INVALID, QuestionSession, PlayerScore,
  Answer, PlayerAnswer
} from './dataStore';
import { isValidIds, IsValid } from './helperFunctions';

export const resultsAnalysis = (sessionIndex: number): void => {
  const data: Data = getData();
  let session: QuizSession = data.quizSessions[sessionIndex];

  session = questionResults(session);
  setData(data);

  session.playerScores = playerQuestinResults(session);
  setData(data);
};

const questionResults = (session: QuizSession) => {
  session.questionSessions.forEach((questionSession: QuestionSession) => {
    const correctAnswers = questionSession.playerAnswers
      .filter((answer: PlayerAnswer) => answer.correct);
    const correctPlayers = correctAnswers.length;

    questionSession.playersCorrectList = correctAnswers
      .map((answer: PlayerAnswer) => {
        const player = session.players.find((p: Player) => p.playerId === answer.playerId);
        return player ? player.name : '';
      });

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
  const playerScores: Map<string, PlayerDetailedScore> = new Map();
  session.players.forEach((player: Player) => {
    playerScores.set(String(player.playerId), { name: player.name });
  });

  session.questionSessions.forEach(
    (questionSession: QuestionSession, questionIndex: number) => {
    const questionPoints = session.metadata.questions[questionIndex].points;
    const questionNumber = questionIndex + 1;

    playerScores.forEach(playerScore => {
      playerScore[`question${questionNumber}Score`] = 0;
      playerScore[`question${questionNumber}Rank`] = 0;
    });

    questionSession.playerAnswers
    .filter((ans: PlayerAnswer) => ans.correct === true)
    .forEach((answer: PlayerAnswer, index: number) => {
      const playerScore = playerScores.get(String(answer.playerId));
      if (playerScore) {
        const rank = index + 1;
        playerScore[`question${questionNumber}Rank`] = rank;
        playerScore[`question${questionNumber}Score`] = questionPoints / rank;
      }
    });
  });

  return Array.from(playerScores.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
