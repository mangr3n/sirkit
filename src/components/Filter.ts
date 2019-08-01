import {Component} from "../Component";

export const Filter = (cond) => Component((v, next) => { if (cond(v)) next(v) });
