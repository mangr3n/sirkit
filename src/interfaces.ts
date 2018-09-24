import { ComponentID, ConnectionID, nextID } from './ID';
import { equals } from 'ramda';

export const EVENT = 'event';
export const SIGNAL = 'signal';
export interface Component {
  name: string;
  id: ComponentID;
  send: (...args) => void;
  on: (...args) => ConnectionID;
  off: (id: number) => void;
  description: () => Object;
  debug: (turnOn: boolean) => void;
}


export const isSignal = equals(SIGNAL);
export const isEvent = equals(EVENT);
