export type SourceInfer<T> = {
  [P in keyof T]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [R in keyof T[P]]: T[P][R] extends (...args: any) => any
      ? ReturnType<T[P][R]> extends Promise<infer X>
        ? X
        : ReturnType<T[P][R]>
      : never;
  };
};
