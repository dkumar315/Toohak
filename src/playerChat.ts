import {
  setData, getData, Data, QuizSession, Player, INVALID,
  EmptyObject, ErrorObject,
  Message
} from './dataStore';
import { timeStamp } from './helperFunctions';
export interface MessageBody { message: { messageBody: string } }

export enum MessageLimits {
  MIN_MSGBODY_LEN = 1,
  MAX_MSGBODY_LEN = 100
}

export enum MessageEncrypt {
  VIGENERE_KEY = 'sEcReT',
  ASCII_OFFSET = 32,
  MAX_PRINTABLE_ASCII = 95,
  ASCII_BASE_OFFSET = 0
}

export type PlayerIndices = {
  sessionIndex: number;
  playerIndex: number;
};

export type Messages = { messages: Message[] };

export const findSessionPlayer = (playerId: number): PlayerIndices | ErrorObject => {
  const data: Data = getData();
  const sessionIndex: number = data.quizSessions
    .findIndex((session: QuizSession) => session
      .players.some((player: Player) => player.playerId === playerId));

  if (sessionIndex === INVALID) {
    return { error: `Invalid playerId number: ${playerId} not exist.` };
  }

  const playerIndex: number = data.quizSessions[sessionIndex]
    .players.findIndex(player => player.playerId === playerId);

  return { sessionIndex, playerIndex };
};

const shiftChar = (char: string, shift: number): string => {
  const start: number = MessageEncrypt.ASCII_OFFSET;
  const range: number = MessageEncrypt.MAX_PRINTABLE_ASCII;
  const code: number = char.charCodeAt(MessageEncrypt.ASCII_BASE_OFFSET);
  return String.fromCharCode((code - start + shift + range) % range + start);
};

const vigenereChar = (char: string, keyChar: string, decode: boolean): string => {
  const shift: number = keyChar.charCodeAt(MessageEncrypt.ASCII_BASE_OFFSET) -
   MessageEncrypt.ASCII_OFFSET;
  return decode ? shiftChar(char, -shift) : shiftChar(char, shift);
};

const encrypt = (plaintext: string, shift: number): string => {
  // caesar
  const shiftedText: string = plaintext
    .split('')
    .map((char, index) => shiftChar(char, shift + index))
    .join('');

  // vigenère
  const key: string = MessageEncrypt.VIGENERE_KEY;
  return shiftedText
    .split('')
    .map((char, index) => vigenereChar(char, key[index % key.length], false))
    .join('');
};

const decrypt = (ciphertext: string, shift: number): string => {
  const key: string = MessageEncrypt.VIGENERE_KEY;
  const unvigenered: string = ciphertext
    .split('')
    .map((char, index) => vigenereChar(char, key[index % key.length], true))
    .join('');

  // Reverse Caesar cipher
  return unvigenered
    .split('')
    .map((char, index) => shiftChar(char, -(shift + index)))
    .join('');
};

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
  const isvalidPlayer: PlayerIndices | ErrorObject = findSessionPlayer(playerId);
  if ('error' in isvalidPlayer) throw new Error(isvalidPlayer.error);

  const messageBody: string = message.message.messageBody;
  const messageBodyLen: number = messageBody.length;
  if (messageBodyLen < MessageLimits.MIN_MSGBODY_LEN ||
    messageBodyLen > MessageLimits.MAX_MSGBODY_LEN) {
    throw new Error(`Invalid messageBody length: ${messageBodyLen}.`);
  }

  const data: Data = getData();
  const session: QuizSession = data.quizSessions[isvalidPlayer.sessionIndex];
  session.messages.push({
    messageBody: encrypt(messageBody, playerId),
    playerId,
    playerName: session.players[isvalidPlayer.playerIndex].name,
    timeSent: timeStamp()
  });
  setData(data);

  return {};
};

/**
 * Get all chat messages in the session of the player
 *
 * @param {number} playerId - identifier of a player
 *
 * @return {object} - Returns an object with all messages in the session
 * @throws {Error} - if the playerId is invalid
 */
export const playerChatMessages = (playerId: number): Messages => {
  const isvalidPlayer: PlayerIndices | ErrorObject = findSessionPlayer(playerId);
  if ('error' in isvalidPlayer) throw new Error(isvalidPlayer.error);

  const data: Data = getData();
  const session: QuizSession = data.quizSessions[isvalidPlayer.sessionIndex];

  const decryptedMessages = session.messages.map(
    (message) => ({
      ...message,
      messageBody: decrypt(message.messageBody, message.playerId)
    })
  );

  return { messages: decryptedMessages };
};
