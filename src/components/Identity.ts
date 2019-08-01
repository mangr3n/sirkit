import {Component} from "../Component";

export const Identity = (name = "Identity",debug=false) => Component(name, (v, next) => next(v),debug);
