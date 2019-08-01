export type ID = number;
export type ConnectionID = ID;
export type ComponentID = ID;

let _nextId: ID = 0;

export const nextID: () => ID = () => {
  return _nextId++;
};
