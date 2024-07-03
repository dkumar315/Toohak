import { setData, Data } from './dataStore';

/**
 * Reset the state of the application back to the start.
 *
 * @return {object} empty object
 */
export function clear() {
  const data: Data = {
    users: [],
    quizzes: [],
    sessions: {
      globalCounter: 0,
      questionCounter: 0,
      sessionIds: [],
    },
  };

  setData(data);
  return {};
}
