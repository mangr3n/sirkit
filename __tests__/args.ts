declare var require;
const { toArgsObject } = require('../src/args');

declare var expect;
declare var test;

test('expect string to return a named Identity Component', () => {
  expect(toArgsObject(['test'])).toMatchObject({
    name: 'test',
  });
});

test('expect boolean to return a debug Component', () => {
  expect(toArgsObject([true])).toMatchObject({
    debug: true,
  });
});
test('expect function to return an ArgsObject with that Function', () => {
  const idFunc = (v, next) => next(v);
  expect(toArgsObject([idFunc])).toMatchObject({
    onNext: idFunc
  });
});
