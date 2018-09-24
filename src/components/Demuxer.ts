import { Component } from '..';
import { flatten, reduce, map, concat, isNil } from 'ramda';

const outputReducer = (acc, output) => {
  acc[output] = Component((v, next) => {
    if (!isNil(v[output])) next(v[output]);
  });
  return acc;
}

export const Demuxer = (...outputs) => {
  const components = reduce(outputReducer, {}, outputs);
  const connections = reduce(concat,
    ([['in', 'out']] as any),
    map(out => [['in', out], [out, `out.${out}`]], outputs)
  );
  // console.log('Demuxer:', { outputs, components, connections });
  return Component({
    components,
    outputs,
    connections,
    // debug: ['in', 'out']
  });
}