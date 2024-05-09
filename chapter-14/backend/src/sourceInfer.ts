import type resolvers from './resolvers.js';

type RESOLVERS_TYPE = typeof resolvers;
export type SourceInfer = {
  [P in keyof RESOLVERS_TYPE]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [R in keyof RESOLVERS_TYPE[P]]: RESOLVERS_TYPE[P][R] extends (...args: any) => any
      ? ReturnType<RESOLVERS_TYPE[P][R]> extends Promise<infer X>
        ? X
        : ReturnType<RESOLVERS_TYPE[P][R]>
      : never;
  };
};
