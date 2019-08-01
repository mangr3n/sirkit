import { Component } from "./interfaces";
import { isNil, uniq, append, fromPairs, map, keys } from 'nanoutils';
import { nextID } from './ID';
import { debugMessage } from './util/debug';
import { Identity } from './index';

interface ComponentMap {
  [index: string]: Component;
}

interface PortIDMap {
  [index: string]: number;
}

const selectNode = (name, components, io = 'inputs') => {
  const direction = io === 'inputs' ? 'inputs' : 'outputs';
  let [componentName, nodeName = 'default'] = name.split('.', 2);
  const component = components[componentName];
  if (isNil(component)) {
    throw new Error(`Component(${componentName}) not found!`);
  }
  const nodes = component[direction];
  if (isNil(nodes) || isNil(nodes[nodeName])) {
    throw new Error(`Port(${name}) not found!`);
  }
  return nodes[nodeName];
};

const _debugLabel = (name, id) => `Component(${name}:${id})`;

// Default inputs and outputs, 'in','out'
export const GraphComponent: (any) => Component = (arg) => {
  const {
    components,
    connections = [],
    inputs = [],
    outputs = [],
    debug = [],
    name = 'Anonymous',
  } = arg;

  const _debugMap: PortIDMap = {};
  const componentID = nextID();

  const DEBUG_LABEL = _debugLabel(name, componentID);


  const _inputNames = uniq(append('default', inputs));
  const _outputNames = uniq(append('default', outputs));

  const toNode = i => [i, Identity(i)];
  const inNodes: ComponentMap = fromPairs((map(toNode, _inputNames) as any));
  const outNodes: ComponentMap = fromPairs((map(toNode, _outputNames) as any));

  components.in = {
    inputs: inNodes,
    outputs: inNodes
  };

  components.out = {
    inputs: outNodes,
    outputs: outNodes
  };

  map(([from, to]) => {
    const outNode = selectNode(from, components, 'outputs');
    const inNode = selectNode(to, components, 'inputs');
    outNode.on(v => inNode.send(v));
  }, connections);

  map(debugPort => {
    let debugNode = selectNode(debugPort, components, 'outputs');
    let debugId = debugNode.on(v => debugMessage(DEBUG_LABEL, `.${debugPort} emit`, v));
    _debugMap[debugNode] = debugId;
  }, debug);

  const on = (...args) => {
    // console.log('GraphComponent/on', { args });
    const [handler, nodeName = 'default'] = args.splice(0, 2).reverse();
    // console.log('GraphComponent/on', { handler, nodeName });
    if (isNil(outNodes[nodeName])) throw new Error(`${DEBUG_LABEL}/on: outNodes[${nodeName}] not found`);
    return (outNodes[nodeName] as any).on(handler);
  };
  const off = (...args) => {
    const [id, nodeName = 'default'] = args.splice(0, 2).reverse();
    if (isNil(outNodes[nodeName])) throw new Error(`${DEBUG_LABEL}/off: outNodes[${nodeName}] not found`);
    return outNodes[nodeName].off(id);
  };

  const send = (...args) => {
    const [value = {}, nodeName = 'default'] = args.splice(0, 2).reverse();
    if (isNil(inNodes[nodeName])) throw new Error(`${DEBUG_LABEL}/off: outNodes[${nodeName}] not found`);
    inNodes[nodeName].send(value)
  };

  const _debug = (turnOn) => {
    if (turnOn) {
      map(v => off(v), keys(_debugMap));
    } else {
      map(
        (compName) => {
          _debugMap[compName] = components[compName].on(v => debugMessage(DEBUG_LABEL, `.${compName} emit`, v));
        },
        keys(components)
      )
    }
  };

  const description = () => ({
    name,
    id: componentID,
    inputs,
    outputs,
    connections,
    components: map(v => v.description, components)
  });
  const result = {
    // This is the Connection API
    send,
    on,
    off,
    inputs: inNodes,
    outputs: outNodes,
    id: componentID,
    name,
    description,
    debug: _debug
  };
  if (debug) {
    debugMessage(DEBUG_LABEL, 'created', result);
  }
  return result;
};
