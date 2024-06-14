import {
  setData,
} from './dataStore.js';

/**
 * Reset the state of the application back to the start.
 *
 * @return {object} empty object
 */
export function clear() {
  const data = {
    users: [],
    quizzs:[],
  };
  setData(data);
  
  return {};
}