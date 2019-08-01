import { merge } from '../../src/util/funcs';

declare var test;
declare var expect;

test('merge overwrites into result with second object', () => {
  const first = { a: 1 };
  const second = { a: 2 };
  const expected = { a: 2 };
  expect(merge(first, second)).toMatchObject(expected);
});

test('merge contains all props', () => {
  const first = { a: 1 };
  const second = { b: 2 };
  const expected = {a:1,b:2};
  expect(merge(first,second)).toMatchObject(expected);
});
