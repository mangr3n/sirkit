// import { equals } from "ramda";

const _functionTypes = ['[object Function]', '[object AsyncFunction]', '[object GeneratorFunction]', '[object AsyncGeneratorFunction]'];

const _toString = (x) => Object.prototype.toString.call(x);

export const contains = (v, arr) => indexOf(v, arr) !== -1;
export const empty = (x) => isArray(x) ? [] : isString(x) ? '' : isObject(x) ? ({}) : void 0;
export const eq = (x, y) => x === y;
export const indexOf = (x, arr) => arr.indexOf(x);
export const isArray = (val) => val != null && val.length >= 0 && Object.prototype.toString.call(x) === '[object Array]';
export const isFunction = (x) => contains(_toString(x), _functionTypes);
export const isInteger = x => _toString(x) === '[]'
export const isNumber = x => _toString(x) === '[object Number]';
export const isObject = (x) => _toString(x) === '[object Object]';
export const isRegExp = x => _toString(x) === '[object Regexp]';
export const isString = (x) => type(x) == '[object String]';
export const merge = (oldObject, newObject) => ({ ...oldObject, ...newObject });
export const type = (x) => x === null ? 'Null' : x === undefined ? 'Undefined' : _toString(x).slice(8, -1);