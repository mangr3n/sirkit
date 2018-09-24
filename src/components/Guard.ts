import { Component, Chain, Demuxer } from '..';
import { keys, toPairs, map, is } from 'ramda';

const sendName = (name: string, value: any, next: (v: any) => void) => {
  next({ [name]: value });
};

export const Guard = conds => Chain(
  Component((v, next) => {
    console.log('flow/component/Guard entered', { v });
    let matches: string[] = []
    let others: string[] = [];
    let match = false;
    const processConds = ([name, cond]) => {
      console.log('flow/component/Guard/processConds: ', { name, cond });
      if (cond === 'otherwise') {
        others.push(name);
      } else if (is(Function, cond) && cond(v)) {
        matches.push(name);
        match = true;
      }
    };
    map(processConds, toPairs(conds));
    console.log('flow/component/Guard', { matches, others });
    map((name: string) => next({ [name]: v }), match ? matches : others);
  }),
  Demuxer(...keys(conds))
);