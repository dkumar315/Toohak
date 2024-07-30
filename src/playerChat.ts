import {
  setData, getData, Data, QuizSession, Player, INVALID,
  EmptyObject, ErrorObject
} from './dataStore';
import { timeStamp } from './helperFunctions';
export interface MessageBody { message: { messageBody: string } }

export enum MessageLimits {
  MIN_MSGBODY_LEN = 1,
  MAX_MSGBODY_LEN = 100
}

export enum MessageEncrypt {
  VIGENERE_KEY = 'sEcReCt'
}

type PlayerIndices = {
  sessionIndex: number;
  playerIndex: number;
};

const findSessionPlayer = (playerId: number): PlayerIndices | ErrorObject => {
  const data: Data = getData();
  const sessionIndex: number = data.quizSessions
    .findIndex((session: QuizSession) => session
      .players.some((player: Player) => player.playerId === playerId));

  if (sessionIndex === INVALID) {
    return { error: `Invalid playerId number: ${playerId} not exist.` };
  }

  const playerIndex = data.quizSessions[sessionIndex]
    .players.findIndex(player => player.playerId === playerId);

  return { sessionIndex, playerIndex };
};

const shiftChar = (char: string, shift: number): string => {
  const code = char.charCodeAt(0);
  return String.fromCharCode((code - 32 + shift + 95) % 95 + 32);
};

const vigenereChar = (char: string, keyChar: string, decode: boolean): string => {
  const shift = keyChar.charCodeAt(0) - 32;
  return decode ? shiftChar(char, -shift) : shiftChar(char, shift);
};

const encrypt = (plaintext: string, shift: number): string => {
  // caesar
  const shiftedText = plaintext
    .split('')
    .map((char, index) => shiftChar(char, shift + index))
    .join('');

  // vigenère
  const key: string = MessageEncrypt.VIGENERE_KEY;
  return shiftedText
    .split('')
    .map((char, i) => vigenereChar(char, key[i % key.length], false))
    .join('');
};

// const decrypt = (ciphertext: string, shift: number): string => {
//   const key: string = MessageEncrypt.VIGENERE_KEY;
//   const unvigenered = ciphertext
//     .split('')
//     .map((char, i) => vigenereChar(char, key[i % key.length], true))
//     .join('');

//   // Reverse Caesar cipher
//   return unvigenered
//     .split('')
//     .map((char, index) => shiftChar(char, -(shift + index)))
//     .join('');
// };

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
