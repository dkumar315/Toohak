import { setData, getData, Data, Message, EmptyObject } from './dataStore';
export interface MessageBody {
  message: {
    messageBody: string
  }
}

export enum MessageLimits {
  MIN_MSGBODY_LEN = 1,
  MAX_MSGBODY_LEN = 100
}

// findplayer(playerId)
// QuizSession.messages

/**
 * Send chat message in session
 *
 * @param {number} playerId - identifier of a player
 * @param {object} message - player message sent in a chat
 *
 * @return {object} - Returns an empty object
 * @throws {Error} - if the playerId or message is invalid
 */
export const playerChatCreate = (
  playerId: number,
  message: MessageBody
): EmptyObject => {
  // If player ID does not exist
  // If message body is less than 1 character or more than 100 characters
  console.log(playerId, message);
  return {};
};
