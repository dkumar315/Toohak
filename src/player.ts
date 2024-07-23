import { setData, getData } from './dataStore';
import {
  Data, Quiz, Session, INVALID, ErrorObject, EmptyObject, States
} from './dataStore';

export type PlayerId = { playerId: number };

export function playerJoin(sessionId: number, name: string): PlayerId {
  return { playerId: 0 };
}
