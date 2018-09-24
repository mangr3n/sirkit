import { isSignal, isEvent } from './interfaces';
import { syncInvoker, asyncInvoker } from './util/invoker';
import { nextID } from './ID';
import { length, map, values, isEmpty, isNil } from 'ramda';
import { debugMessage } from './util/debug';

export const getInvoker = (type) => {
  if (isSignal(type)) return syncInvoker;
  else return asyncInvoker;
};

const capitalize = (x: string) => {
  if (x.length === 0) return x;
  if (x.length === 1) return x.toUpperCase();
  return x.substring(0, 1).toUpperCase() + x.substring(1);
}

export const FunctionComponent = (arg) => {
  const { name: portName, onNext, type } = arg;
  let { debug: _debug } = arg;

  let _debugId = null;
  let _handlers = {};
  let _valueQueue = [];
  let _currentValue = null;
  let componentId = nextID();
  const DEBUG_LABEL = `${capitalize(type)}(${portName}:${componentId})`;

  const _handlerInvoker = getInvoker(type);

  const next = v => map(
    handler => _handlerInvoker(v, handler),
    values(_handlers)
  );

  const _processHandlers = () => {
    while (!isEmpty(_valueQueue)) {
      let _currentValue = _valueQueue.shift();
      onNext(_currentValue, next);
    }
  };

  const send = (v) => {
    if (_debug) debugMessage(DEBUG_LABEL, 'send', v);
    _valueQueue.push(v);
    _processHandlers();
  };

  const on = (handler) => {
    if (_debug) debugMessage(DEBUG_LABEL, 'on', { handler });
    const result = nextID();
    _handlers[result] = handler;
    if (isSignal(type)) handler(_currentValue);
    return result;
  };

  const off = (id) => {
    if (!isNil(_handlers[id])) {
      delete _handlers[id];
      return true;
    } else {
      return false;
    }
  };

  const _debugHandler = (v) => {
    debugMessage(DEBUG_LABEL, 'out', v);
  }

  const debug = (turnOn: boolean) => {
    if (turnOn && !isNil(_debugId)) return;
    if (!turnOn && isNil(_debugId)) return;
    if (turnOn) {
      _debugId = on(_debugHandler);
      _debug = true;
    } else {
      off(_debugId);
      _debug = false;
    }
  };

  const description = () => ({
    name: portName,
    id: componentId,
    send,
    on,
    off,
    debug,
    description
  });

  const result = {
    send,
    on,
    off,
    description,
    debug,
    id: componentId,
    name: portName,
    inputs: { default: null },
    outputs: { default: null }
  };

  result.inputs.default = result;
  result.outputs.default = result;

  if (_debug) {
    debugMessage(DEBUG_LABEL, 'created', result);
  }
  return result;
};
