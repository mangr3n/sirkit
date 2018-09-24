type ID = number;
type ConnectionID = ID;
type ComponentID = ID;

let _nextId: ID = 0;

const nextID: () => ID = () => {
  return _nextId++;
};

export { ID, ConnectionID, ComponentID, nextID };