import { EVENT } from './interfaces';
import { merge, reduce, is, length, isNil, dissoc } from 'ramda';

const fromNoArgs = () => ({
  name: 'Identity',
  onNext: (v, next) => next(v),
  debug: false,
  type: EVENT
});

// A String by itself in the arg list is the name of the Component
const fromStringArg = (original, arg) => merge(original, { name: arg });
// A Boolean value by itself in the arg list is the debug arg.
const fromBooleanArg = (original, arg) => merge(original, { debug: arg });
// A Function value by itself in the arg list is the function that takes value and the next function and invokes next with the resulting value.
const fromFunctionArg = (original, arg) => merge(original, { name: `Function{${arg.name}}`, onNext: arg });
// An Array value, 
const fromArrayArg = (original, argArray) => reduce((acc, v) => processArg(acc, v), original, argArray);
// 
const fromObjectArg = (original, argObject) => {
  if (!isNil(argObject.components)) original = dissoc('onNext', original);
  return merge(original, argObject);
}

const processArg = (original, arg) => {
  if (is(String, arg)) return fromStringArg(original, arg);
  else if (is(Boolean, arg)) return fromBooleanArg(original, arg);
  else if (is(Function, arg)) return fromFunctionArg(original, arg);
  else if (is(Array, arg)) return fromArrayArg(original, arg);
  else if (is(Object, arg)) return fromObjectArg(original, arg);
  else throw new Error(`Component/processOneArg, arg can't be processed: ${arg}`);
}

export const toArgsObject = (args: any[]) => length(args) === 0 ? fromNoArgs() : fromArrayArg(fromNoArgs(), args);
