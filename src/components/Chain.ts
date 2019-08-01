import { Component } from '..';
import { reduce, keys, map, concat, range } from 'nanoutils';

export const Chain = (...args) => {
  const lastIndex = args.length - 1;
  const [first, last] = [args[0], args[lastIndex]];

  let index = 0;
  const components = reduce((acc, value) => ({ ...acc, [`c${index++}`]: value }), {}, args);
  const inputs = keys(first.inputs);
  const outputs = keys(last.outputs);

  const componentKeys = range(0, lastIndex);
  const internalConnections = map(i => ([`c${i}`, `c${i + 1}`]), componentKeys);
  // console.log('component/Chain ', { internalConnections, componentKeys });

  const inputConnections = map(input => ([`in.${input}`, `c0.${input}`]), inputs);
  const outputConnections = map(output => ([`c${lastIndex}.${output}`, `out.${output}`]), outputs);

  const connections = concat(internalConnections, concat(inputConnections, outputConnections));
  const result = {
    components,
    connections,
    inputs,
    outputs,
    name: 'Chain'
  };
  // console.log('flow/component/Chain', result);
  return Component(result);
};
