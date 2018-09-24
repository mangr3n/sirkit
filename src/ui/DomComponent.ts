import { Component, Ticker, Mapper, Muxer, Guard, Demuxer, Counter } from '../index';
import { isNil, map, empty, is } from 'ramda';


import { h, init } from 'snabbdom';
// import { breadboard } from '../../graflow/components/index';
import { debugMessage } from '../util/debug';

declare var require;

const patch = init([
  require('snabbdom/modules/class'),
  require('snabbdom/modules/props'),
  require('snabbdom/modules/attributes'),
  require('snabbdom/modules/style'),
  require('snabbdom/modules/dataset'),
  require('snabbdom/modules/eventlisteners'),
]);


export const DomComponent = ({ view }) => {
  return Component((v, next) => {
    const { state } = v;
    next(view(state));
  });
};

// In component dom, and targetSelector
export const TargettedComponent = () => {
  let lastNode = null;
  return Component({
    inputs: ['node', 'target'],
    components: {
      inMux: Muxer('node', 'target'),
      toOutObj: Component(({ node, target }, next) => {
        if (isNil(lastNode)) {
          lastNode = node;
          next({ newNode: node, target });
        } else {
          let oldNode = lastNode;
          lastNode = node;
          next({ newNode: node, oldNode });
        }
      })
    },
    connections: [
      ['in', 'inMux'],
      ['inMux', 'toOutObj'],
      ['toOutObj', 'out']
    ]
  });
};


// UI Bus, register components
// Messages 
// DOM: {node, target}
const NodePatchSplitter = () => Guard({
  hasOldVNode: ({ oldNode }) => !isNil(oldNode),
  hasTarget: ({ target }) => !isNil(target) && is(String, target) && !empty(target),
  placeOnQueue: 'otherwise'
});

const VNodePatcher = () => Component((renderable, next) => {
  const DEBUG_LABEL = 'flow/ui/NodePatcher';
  debugMessage(DEBUG_LABEL, 'in:', { renderable });
  const { oldNode, newNode } = renderable;
  patch(oldNode, newNode);
});
const ElementPatcher = () => Component((renderable, next) => {
  const { target, newNode } = renderable;
  const element = document.querySelector(target);
  if (isNil(element)) {
    next(renderable)
  } else {
    patch(element, newNode);
  }
});

export const RenderQueue = () => {
  const unrendered = [];
  return Component({
    inputs: ['add', 'tick'],
    components: {
      adder: Component((v, next) => {
        console.log('RenderQueue, adding: ', v)
        unrendered.push(v);
      }),
      emitter: Component((_, next) => {
        console.log('Entered emitter');
        while (unrendered.length !== 0) {
          console.log('RenderQueue, emitting: ', { unrendered });
          next(unrendered.shift());
        }
      })
    },
    connections: [
      ['in.add', 'adder'],
      ['in.add', 'emitter'],
      ['in.tick', 'emitter'],
      ['emitter', 'out']
    ],
    debug: ['in'],
    name: 'RenderQueue'
  })
};

export const Renderer = () => {
  // ticker, patcher, adder, queue
  return Component({
    debug: ['renderQueue', 'in'],
    components: {
      inDmx: Demuxer('vdom', 'render'),
      renderQueue: RenderQueue(),
      splitter: NodePatchSplitter(),
      nodePatcher: VNodePatcher(),
      elementPatcher: ElementPatcher()
    },
    connections: [
      ['in', 'inDmx'],
      ['inDmx.vdom', 'renderQueue.add'],
      ['inDmx.render', 'renderQueue.tick'],
      ['renderQueue', 'splitter'],
      ['splitter.hasOldVNode', 'nodePatcher'],
      ['splitter.hasTarget', 'elementPatcher'],
      ['splitter.placeOnQueue', 'renderQueue'],
      ['elementPatcher', 'renderQueue']
    ],
    name: 'Renderer'
  });
};

export const testDOMComponent = () => {
  // const bb = breadboard('testNewDom');

  // bb.register({
  //   components: {
  //     testComponent: DomComponent({
  //       view: (state) => {
  //         console.log('DomComponent: ', { state });
  //         return h('span', state)
  //       }
  //     }),
  //     target: TargettedComponent(),
  //     renderer: Renderer(),
  //     ticker: Ticker(1000),
  //     counter: Counter()
  //   },
  //   connections: [
  //     ['testComponent', 'target.node'],
  //     ['target', 'renderer.vdom'],
  //     ['ticker', 'counter'],
  //     ['counter', 'testComponent.state']
  //   ],
  //   debug: ['target', 'renderer', 'ticker']
  // });
  // bb.send('target.target', '#nothing');
  // const el = document.createElement('div');
  // el.setAttribute('id', 'nothing');
  // document.body.appendChild(el);
  // bb.send('ticker', {});
  // bb.send('renderer.render', {});
}