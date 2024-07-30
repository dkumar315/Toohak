import { setData, Data, EmptyObject } from './dataStore';
import { clearAllTimers } from './quizSession';

/**
 * Reset the state of the application back to the start.
 *
 * @return {object} empty object
 */
export function clear(): EmptyObject {
  const data: Data = {
    users: [],
    quizzes: [],
    trashedQuizzes: [],
    sessions: {
      tokenCounter: 0,
      quizCounter: 0,
      quizSessionCounter: 0,
      playerCounter: 0,
      sessionIds: [],
    },
    quizSessions: []
  };

  clearAllTimers();

  setData(data);
  return {};
}
