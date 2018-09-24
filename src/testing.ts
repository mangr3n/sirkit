const _log = (header) => (msg) => console.log(header, msg);
import {
  Accumulator, Chain, Checker, Component, Counter,
  Delayer, Demuxer, Guard, Hub, Iterator, Mapper,
  Memorizer, Muxer, Serializer, UniqueFilter
} from './index';
import { map, equals, keys } from 'ramda';

const PlusOne = () => Mapper(v => v + 1);
const TimesTwo = () => Mapper(x => x * 2);

const BasicGraphComponent = () => Component({
  components: {
    'plusOne': PlusOne(),
    'x2': TimesTwo()
  },
  connections: [
    ['in', 'plusOne'],
    ['plusOne', 'x2'],
    ['x2', 'out']
  ],
  name: "testComponent"
});

const testComp = (testComp, outMsg, values) => {
  const outputs = testComp.outputs;
  map((v) => {
    if (equals('default', v)) {
      testComp.on(_log(`TestOutput, ${outMsg}`))
    } else {
      testComp.on(v, _log(`TestOutput, Port(${v}), ${outMsg}`));
    }
  }, keys(outputs));
  map(v => testComp.send(v), values);
};

const TestGuard = () => Guard({
  lessThan5: (v) => v < 5,
  greaterThan20: (v) => v > 20,
  else: 'otherwise',
  another: 'otherwise'
});

export const runTests = () => {
  testComp(Component((v, next) => next(v)), 'Function', [1, 2]);
  testComp(BasicGraphComponent(), 'Graph', [1, 2, 3, 4]);
  testComp(PlusOne(), 'Mapper', [2, 3]);
  testComp(Chain(PlusOne(), TimesTwo()), 'Chain', [1, 2, 3, 4]);
  testComp(Demuxer('a', 'b'), 'Demuxer', [{ a: 1 }, { b: 2 }, { a: 1, b: 2 }, { c: 4 }]);
  testComp(Checker(v => v > 5), 'Checker', [1, 6, 5, 200]);
  testComp(Counter(), 'Counter', [2, 15, 18, 23]);
  testComp(Delayer(200), 'Delayer(200ms)', [1, 2, 3]);
  testComp(TestGuard(), 'Guard', [1, 21, 6, 12, 25, 3]);
  testComp(Serializer(), 'Serializer', [[1, 2, 3], "test", ['abc', 'def']]);
  testComp(UniqueFilter(0), 'UniqueFilter', [1, 1, 2, 3, 3, 4, 1, 4, 4]);
  testComp(Iterator('test', { cyclic: true }), 'Iterator', [1, 1, 1, 1, 1, 1, 1]);
  testComp(Hub('a', 'b', 'c'), 'Hub(a,b,c)', [{ a: 1 }, { b: 2 }, { c: 3 }]);
  testComp(Memorizer(), 'Memorizer', [{ memory: 2 }, { value: 1 }, { memory: 4 }, { value: 3 }]);
  testComp(Muxer('a', 'b', 'c'), 'Muxer', [{ a: 1 }, { b: 2 }, { c: 3 }, { b: 10 }]);
}