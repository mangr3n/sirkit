import { Component, Mapper, Demuxer } from '..';

export const Memorizer = () => {
  let memory;
  return Component({
    inputs: ['memory', 'value'],
    components: {
      memory: Component(v => { memory = v; }), // in.memory is saved
      mapper: Mapper(value => ({ value, memory })), // in.value fires both value and memory out
      demuxer: Demuxer('memory', 'value')
    },
    connections: [
      ['in.memory', 'memory'],
      ['in.value', 'mapper'],
      ['mapper', 'out'],
      ['in', 'demuxer'],
      ['demuxer.memory', 'memory'],
      ['demuxer.value', 'mapper']
    ]
  });
};