import { setData } from './dataStore'
/**
 * Reset the state of the application back to the start.
 *
 * @return {object} empty object
 */
export function clear() {
  const data = {
    users: [],
    quizs: []
  }

  setData(data);

  return {};
}
