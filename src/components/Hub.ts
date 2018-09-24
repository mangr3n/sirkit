import { Component, Mapper } from '..';
import { map } from 'ramda';


export const Hub = (...inputs) => {
  let components = {};
  let connections = [['in', 'out']];
  map(
    i => {
      components[i] = Mapper(v => ({ [i]: v }));
      connections.push([`in.${i}`, i], [i, 'out']);
    },
    inputs
  );
  return Component({ components, connections, inputs });
};