// import { setData, getData, COLORS } from './dataStore';
import { Question } from './dataStore';
export interface QuestionBody {
	QuestionBody: 
}

interface Question {
  question: string;
  points: number;
  answers: Answer[];
}

interface Answer {
  answer: string;
  correct: boolean;
}

/**
 * Create a new stub question for a particular quiz,
 * the timeLastEdited is set as the same as the created time, 
 * and the colours of all answers of that question are randomly generated.
 *
 * @param {string} token - a unique identifier for a login user
 * @param {number} quizId - a unique identifier for a valid quiz
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 *
 * @return {number} authUserId - unique identifier for a user
 * @return {object} returns error if email, password, nameFirst, nameLast invalid
 */
export function adminQuizQuestionCreate(token: string, quizId: number, questionBody: QuestionBody) {
	return { questionId: 5546 }
}

/**
 * Randomly generate a colour for an answer of a question
 * when a quiz question is created or updated
 * 
 * @return {string} a name of a random color
 */
function generateRandomColor(): string {
  // index = Math.floor(Math.random() * colorRange.length);
  // return COLORS[index];
}