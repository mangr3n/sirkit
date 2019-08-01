import {Component} from "../Component";

export const Mapper = (fn) => Component((v, next) => next(fn(v)), { name: `Mapper(${fn.name})` });
