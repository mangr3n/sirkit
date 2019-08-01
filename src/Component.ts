import { isNil } from 'nanoutils';
import { toArgsObject } from './args';
import { FunctionComponent } from './FunctionComponent';
import { GraphComponent } from './GraphComponent';


/** 
 * Args can be:
 * String : name,
 * Func: onNext (v,next) => void
 * Boolean: debug,
 * Array : [name: string,onNext: func, boolean, otherArgs: obj],  in any order
 * Object: args 
 * { 
 *  name: string,
 *  debug: boolean,
 * 
 *  ONE OF:
 *    (
 *     onNext: (v,next) => void, default (v,next) => next(v),
 *     and
 *     type: string 'signal' | 'event'
 *    )
 *    (
 *      components: { componentName: component } : {string:Component},
 *      connections: [
 *        [ 'componentInName(.port?)', 'componentOutName(.port?)' ] |
 *      ]
 *    )
 * }
 */
// 
export const Component = (...args) => {
  const argsObj = toArgsObject(args);
  if (!isNil(argsObj.onNext)) return FunctionComponent(argsObj);
  else return GraphComponent(argsObj);
};
