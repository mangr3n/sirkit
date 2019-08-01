import {
  Identity,
  Mapper,
  Component,
  Chain,
  Demuxer,
  Checker,
  Counter,
  Delayer,
  Guard,
  Serializer,
  UniqueFilter, Iterator, Hub, Memorizer, Muxer, Filter
} from "../src";
import {isObject} from "../src/util/funcs";

const INITIAL_DELAY = 50;
const DEFAULT_DELAY=20;

declare var test;
declare var expect;
declare var jest;

const SINGLE_PORT = 1;
const MULTI_PORT = 2;
const DEFAULT_PORT = 3;

const PlusOne = () => Mapper(v => v + 1);
const TimesTwo = () => Mapper( v=> v*2);

const sendValues = ({comp,strategy=null,port=null,values=null}) => {
  if (strategy == null) {
    strategy = port == null ? DEFAULT_PORT : SINGLE_PORT;
  }

  if (strategy == DEFAULT_PORT) {
    values.forEach(v => {
      comp.send(v);
    });
  } else if( strategy == SINGLE_PORT) {
    values.forEach(v => {
      comp.send(port,v);
    });
  } else if (strategy == MULTI_PORT) {
    values.forEach(v => {
      for(let _port in v) {
        comp.send(_port,v[_port]);
      }
    });
  }


};

const checkHandler = (handler,outputs,done,delay = DEFAULT_DELAY) => {
  const expected = outputs.map((v) => [v]);
  setTimeout(() => {
    expect(handler.mock.calls).toEqual(expected);
    done();
  },delay);
};

export const testComponent = ({factory,inputs,outputs,delay=DEFAULT_DELAY,inputStrategy=null}) => {
  return (done) => {
    if (!isObject(outputs)) {
      const comp = factory();
      const handler = jest.fn();
      handler.mockClear();
      comp.on(handler);
      sendValues({comp, values:inputs,strategy:inputStrategy});
      checkHandler(handler, outputs, done, delay);
    } else {
      for(let outputPort in outputs) {
        if (outputPort == "default") testComponent({factory,inputs,outputs:outputs['default'],delay});
        else {
          const comp = factory();
          const handler = jest.fn();
          handler.mockClear();
          comp.on(outputPort, handler);
          sendValues({comp, values:inputs,strategy:inputStrategy});
          checkHandler(handler, outputs[outputPort], done);
        }
      }
    }
  };
};

export const testSimpleComponent = (factory,inputs,outputs,delay=DEFAULT_DELAY) => {
  return testComponent({factory,inputs,outputs,delay,inputStrategy:null});
};

test(
  'Identity should return each value sent in',
  testSimpleComponent(Identity,[1,2],[1,2],INITIAL_DELAY)
);

const AGraphComponent = () => Component({
  components: {
    'plusOne': Mapper(v => v + 1),
    'timesTwo': Mapper(v => v * 2)
  },
  connections: [
    ['in','plusOne'],
    ['plusOne','timesTwo'],
    ['timesTwo','out']
  ]
});

test(
  'A Graph Component should take a graph and execute that produce the outputs described by the Graph',
  testSimpleComponent(AGraphComponent,[1,2,3,4],[4,6,8,10])
);

test(
  'A Mapper should emit the application of the function to the an input',
  testSimpleComponent(()=>Mapper(v => v + 1),[1,2,3,4],[2,3,4,5])
);

test(
  'A Chain should pass the results through a pipeline',
  testSimpleComponent(() => Chain(PlusOne(),TimesTwo()),[1,2,3,4],[4,6,8,10])
);


// Demuxer Tests

const demuxerInput = [{a:1},{b:2},{a:3,b:4}];
test(
  'A Demuxer should emit keyed values on named output ports, and the input on the default output port',
  testSimpleComponent(
    () => Demuxer('a','b'),
    demuxerInput,
    {
      a: [1,3],
      b: [2,4],
      default: demuxerInput
    }
  )
);



// Checker Tests
const isEven = (v) => v % 2 === 0;
const EvenChecker = () => Checker(isEven);

test(
  'A Checker should emit failing values on port "false" and passing values on port "true"',
  testSimpleComponent(
    EvenChecker,
    [1,2,3,4],
    {'true':[2,4],'false':[1,3]}
  )
);


// Counter Tests
test('A Counter should emit an incrementing value',
  testSimpleComponent(
    Counter,
    [1,1,1,1],
    [1,2,3,4]
  )
);

// Delayer Tests
test(
  'A Delayer should not emit a value before it\'s delay',
  testSimpleComponent(
    () => Delayer(20),
    [1],
    [],
    10
  )
);

test(
  'A Delayer should have emitted a value after the delay period has elapsed',
  testSimpleComponent(
    () => Delayer(20),
    [1],
    [1],
    30
  )
);

// Guard Tests
const TestGuard = () => Guard({
  lessThan5: (v) => v < 5,
  greaterThan20: (v) => v > 20,
  else: 'otherwise',
  another: 'otherwise'
});
const guardInput = [1,21,6,12,25,3];
const lessThan5Output = [1,3];
const greaterThan20Output = [21,25];
const elseOutput = [6,12];
const anotherOutput = [6,12];

test('TestGuard should emit values to ports for named conditions, or else...',testComponent({
  factory: TestGuard,
  inputs: guardInput,
  outputs: {
    lessThan5:lessThan5Output,
    greaterThan20: greaterThan20Output,
    else: elseOutput,
    another: anotherOutput
  },
  delay:30
}));

// Serializaer Tests
test('Serializer should serialize an iterable', testSimpleComponent(
  Serializer,
  [[1,2,3],'abc',['abc','def']],
  [1,2,3,'a','b','c','abc','def'],
  20
));

// UniqueFilter Tests
test('UniqueFilter should eliminate sequential duplicates from the input',testSimpleComponent(
  UniqueFilter,
  [1,1,2,3,3,4,1,4,4],
  [1,2,3,4,1,4]
));

// Iterator tests
test('A cyclic Iterator emits elements of an iterable and then cycles back to the start',testSimpleComponent(
  () => Iterator('test',{cyclic:true}),
  [1,1,1,1,1,1],
  ['t','e','s','t','t','e']
));

test('A non-cyclic Iterator stops emitting when it reaches the end',testSimpleComponent(
  () => Iterator('test'),
  [1,1,1,1,1,1],
  ['t','e','s','t']
));

// Hub Tests
test('A Hub emits an object with the value keyed by the input port',testComponent({
  factory: () => Hub('a','b','c'),
  inputs: [{a:1},{b:2},{c:3}],
  outputs: [{a:1},{b:2},{c:3}],
  inputStrategy:MULTI_PORT
}));

// Memorizer Tests
test('A Memorizer has a memory and a value',testComponent({
  factory: Memorizer,
  inputs: [{memory:2},{value:1},{memory:4},{value:3}],
  outputs: [{memory:2,value:1},{memory:4, value:3}],
  inputStrategy:MULTI_PORT
}));

test('A Memorizer only updates memory once a value is received',testComponent({
  factory:Memorizer,
  inputs:[{memory:1},{memory:2},{memory:3},{value:4},{value:5}],
  outputs:[{memory:1,value:4},{memory:2,value:5}],
  inputStrategy: MULTI_PORT
}));

test('A Memorizer only emits when it has a pair, it emits the pair, and waits for a new pair.',testComponent({
  factory:() => Memorizer(0),
  inputs: [{value:1},{value:2},{memory:3},{memory:4},{memory:5},{value:6}],
  outputs:[{value:1,memory:0},{value:2,memory:3},{memory:4,value:6}],
  inputStrategy: MULTI_PORT
}));

// Muxer Tests
test("A Muxer should emit a value when it has received all of it's inputs and not before.",testComponent({
  factory: () => Muxer('a','b','c'),
  inputs: [{a:1},{b:2},{c:3}],
  outputs: [{a:1,b:2,c:3}],
  inputStrategy: MULTI_PORT
}));

test("A Muxer should replace an existing value with a newly supplied value.",testComponent({
  factory: () => Muxer('a','b','c'),
  inputs: [{a:1},{b:2},{c:3},{b:10}],
  outputs: [{a:1,b:2,c:3},{a:1,b:10,c:3}],
  inputStrategy: MULTI_PORT
}));

// Filter Tests
test("A Filter should emit values that produce true when passed through the supplied function",testComponent({
  factory:() => Filter(isEven),
  inputs: [1,2,3,4],
  outputs: [2,4]
}));

