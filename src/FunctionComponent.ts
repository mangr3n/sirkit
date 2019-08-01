import {nextID} from "./ID";
import {debugMessage} from "./util/debug";
import {isSignal} from "./interfaces";
import {isNil} from "./util/funcs";

const csp = require('js-csp');

declare var require;

const capitalize = (x: string) => {
  if (x.length === 0) return x;
  if (x.length === 1) return x.toUpperCase();
  return x.substring(0, 1).toUpperCase() + x.substring(1);
};


export const FunctionComponent = (arg) => {
  const {name:portName, onNext, type} = arg;

  let {debug: _debug} = arg;

  let _debugId = null;
  let _handlerDisconnectChannels = {};

  const componentId = nextID();

  const _inChannel = csp.chan();
  const _outSource = csp.chan();
  const _outMult = csp.operations.mult(_outSource);

  let _currentOutput = null;

  const DEBUG_LABEL = `${capitalize(type)}(${portName}:${componentId}`;
  const _debugHandler = (v) => {
    debugMessage(DEBUG_LABEL, 'out',v);
  };

  // Value from the _inChannel
  const next = v => {
    _currentOutput = v;
    csp.putAsync(_outSource,v);
  };

  csp.go(function* () {
    while(true) {
      let inValue = yield csp.take(_inChannel);
      if (_debug) {
        debugMessage(DEBUG_LABEL, 'from _inChannel',inValue);
      }
      onNext(inValue,next);
    }
  });

  const send = v => {
    if (_debug) debugMessage(DEBUG_LABEL, 'send',v);
    csp.putAsync(_inChannel,v);
  };

  const on = (handler) => {
    if(_debug) debugMessage(DEBUG_LABEL,'on',{handler});
    const _id = nextID();
    const _onChan = csp.chan();
    const _offChan = csp.chan();
    _handlerDisconnectChannels[_id] = _offChan;

    csp.operations.mult.tap(_outMult,_onChan);

    csp.go(function* () {
      while(true) {
        let received = yield csp.alts([_onChan,_offChan]);
        if (received.channel == _offChan) {
          _offChan.close();
          delete _handlerDisconnectChannels[_id];
          csp.operations.mult.untap(_onChan);
          return null;
        } else {
          handler(received.value);
        }
      }
    });

    if (isSignal(type)) {
      handler(_currentOutput);
    }
    return _id;
  };

  const off = (id) => {
    const _offChan = _handlerDisconnectChannels[id];
    if (!isNil(_offChan)) {
      csp.putAsync(_offChan,true);
    }
  };

  const debug = (turnOn:boolean) => {
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

  const result = {
    send,
    on,
    off,
    debug,
    id: componentId,
    name: portName,
    inputs: {default:null},
    outputs: {default:null}
  };
  result.inputs.default = result;
  result.outputs.default = result;

  if (_debug) {
    debugMessage(DEBUG_LABEL,'created',result);
  }

  return result;
};
