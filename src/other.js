import {
  setData,
} from './dataStore.js';

/**
 * Reset the state of the application back to the start.
 *
 * @return {object} empty object
 */
export function clear() {
  let data = {
    users: [],
    quizzes: [],
  };
  
  setData(data);
  
  return {};
}