
export const asyncInvoker = (v, handler) => {
  setTimeout(
    () => handler(v),
    0
  );
};
export const syncInvoker = (v, handler) => handler(v);