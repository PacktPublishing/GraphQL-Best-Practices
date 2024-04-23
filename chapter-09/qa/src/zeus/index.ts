/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';
export const HOST = "http://localhost:4000/graphql"


export const HEADERS = {}
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query);
    const wsString = queryString.replace('http', 'ws');
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error('No websockets implemented');
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
  ) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: (Z & ValueTypes[R]) | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | 'enum'
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
    ? SCLR[T]['decode'] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]['decode']>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
          : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : Record<string, never>, SCLR>
        : never;
    }[keyof SRC] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['ID']: unknown;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariablesDeep<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariablesDeep<Query[K]>> }[keyof Query]>;

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariablesDeep<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = GraphQLTypes["Message"] | GraphQLTypes["StringId"] | GraphQLTypes["Dated"] | GraphQLTypes["Owned"]
export type ScalarCoders = {
}
type ZEUS_UNIONS = GraphQLTypes["ToAnswer"]

export type ValueTypes = {
    ["Message"]:AliasType<{
		content?:boolean | `@${string}`,
	score?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	user?:ValueTypes["User"],
	answers?:ValueTypes["Answer"];
		['...on Question']?: Omit<ValueTypes["Question"],keyof ValueTypes["Message"]>;
		['...on Answer']?: Omit<ValueTypes["Answer"],keyof ValueTypes["Message"]>;
		__typename?: boolean | `@${string}`
}>;
	["StringId"]:AliasType<{
		_id?:boolean | `@${string}`;
		['...on Message']?: Omit<ValueTypes["Message"],keyof ValueTypes["StringId"]>;
		['...on Question']?: Omit<ValueTypes["Question"],keyof ValueTypes["StringId"]>;
		['...on Answer']?: Omit<ValueTypes["Answer"],keyof ValueTypes["StringId"]>;
		['...on User']?: Omit<ValueTypes["User"],keyof ValueTypes["StringId"]>;
		__typename?: boolean | `@${string}`
}>;
	["Question"]: AliasType<{
	content?:boolean | `@${string}`,
	score?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	answers?:ValueTypes["Answer"],
	title?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	user?:ValueTypes["User"],
		__typename?: boolean | `@${string}`
}>;
	["Answer"]: AliasType<{
	content?:boolean | `@${string}`,
	score?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	to?:ValueTypes["ToAnswer"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	user?:ValueTypes["User"],
	answers?:ValueTypes["Answer"],
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
search?: [{	query: string | Variable<any, string>},ValueTypes["QuestionsResponse"]],
	top?:ValueTypes["QuestionsResponse"],
question?: [{	_id: string | Variable<any, string>},ValueTypes["Question"]],
	me?:ValueTypes["User"],
		__typename?: boolean | `@${string}`
}>;
	["QuestionsResponse"]: AliasType<{
	question?:ValueTypes["Question"],
	bestAnswer?:ValueTypes["Answer"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	user?:ValueTypes["UserMutation"],
	public?:ValueTypes["PublicMutation"],
		__typename?: boolean | `@${string}`
}>;
	["UserMutation"]: AliasType<{
postQuestion?: [{	createQuestion: ValueTypes["CreateQuestion"] | Variable<any, string>},boolean | `@${string}`],
postAnswer?: [{	createAnswer: ValueTypes["CreateAnswer"] | Variable<any, string>},boolean | `@${string}`],
vote?: [{	_id: string | Variable<any, string>},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["PublicMutation"]: AliasType<{
register?: [{	username: string | Variable<any, string>,	password: string | Variable<any, string>},ValueTypes["AuthPayload"]],
login?: [{	username: string | Variable<any, string>,	password: string | Variable<any, string>},ValueTypes["AuthPayload"]],
		__typename?: boolean | `@${string}`
}>;
	["ToAnswer"]: AliasType<{		["...on Question"] : ValueTypes["Question"],
		["...on Answer"] : ValueTypes["Answer"]
		__typename?: boolean | `@${string}`
}>;
	["User"]: AliasType<{
	username?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AuthPayload"]: AliasType<{
	token?:boolean | `@${string}`,
	user?:ValueTypes["User"],
		__typename?: boolean | `@${string}`
}>;
	["CreateQuestion"]: {
	content: string | Variable<any, string>,
	title: string | Variable<any, string>
};
	["CreateAnswer"]: {
	content: string | Variable<any, string>,
	title: string | Variable<any, string>,
	to: string | Variable<any, string>
};
	["Dated"]:AliasType<{
		createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`;
		['...on Message']?: Omit<ValueTypes["Message"],keyof ValueTypes["Dated"]>;
		['...on Question']?: Omit<ValueTypes["Question"],keyof ValueTypes["Dated"]>;
		['...on Answer']?: Omit<ValueTypes["Answer"],keyof ValueTypes["Dated"]>;
		['...on User']?: Omit<ValueTypes["User"],keyof ValueTypes["Dated"]>;
		__typename?: boolean | `@${string}`
}>;
	["Owned"]:AliasType<{
		user?:ValueTypes["User"];
		['...on Message']?: Omit<ValueTypes["Message"],keyof ValueTypes["Owned"]>;
		['...on Question']?: Omit<ValueTypes["Question"],keyof ValueTypes["Owned"]>;
		['...on Answer']?: Omit<ValueTypes["Answer"],keyof ValueTypes["Owned"]>;
		__typename?: boolean | `@${string}`
}>
  }

export type ResolverInputTypes = {
    ["Message"]:AliasType<{
		content?:boolean | `@${string}`,
	score?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	user?:ResolverInputTypes["User"],
	answers?:ResolverInputTypes["Answer"];
		['...on Question']?: Omit<ResolverInputTypes["Question"],keyof ResolverInputTypes["Message"]>;
		['...on Answer']?: Omit<ResolverInputTypes["Answer"],keyof ResolverInputTypes["Message"]>;
		__typename?: boolean | `@${string}`
}>;
	["StringId"]:AliasType<{
		_id?:boolean | `@${string}`;
		['...on Message']?: Omit<ResolverInputTypes["Message"],keyof ResolverInputTypes["StringId"]>;
		['...on Question']?: Omit<ResolverInputTypes["Question"],keyof ResolverInputTypes["StringId"]>;
		['...on Answer']?: Omit<ResolverInputTypes["Answer"],keyof ResolverInputTypes["StringId"]>;
		['...on User']?: Omit<ResolverInputTypes["User"],keyof ResolverInputTypes["StringId"]>;
		__typename?: boolean | `@${string}`
}>;
	["Question"]: AliasType<{
	content?:boolean | `@${string}`,
	score?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	answers?:ResolverInputTypes["Answer"],
	title?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	user?:ResolverInputTypes["User"],
		__typename?: boolean | `@${string}`
}>;
	["Answer"]: AliasType<{
	content?:boolean | `@${string}`,
	score?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	to?:ResolverInputTypes["ToAnswer"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	user?:ResolverInputTypes["User"],
	answers?:ResolverInputTypes["Answer"],
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
search?: [{	query: string},ResolverInputTypes["QuestionsResponse"]],
	top?:ResolverInputTypes["QuestionsResponse"],
question?: [{	_id: string},ResolverInputTypes["Question"]],
	me?:ResolverInputTypes["User"],
		__typename?: boolean | `@${string}`
}>;
	["QuestionsResponse"]: AliasType<{
	question?:ResolverInputTypes["Question"],
	bestAnswer?:ResolverInputTypes["Answer"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	user?:ResolverInputTypes["UserMutation"],
	public?:ResolverInputTypes["PublicMutation"],
		__typename?: boolean | `@${string}`
}>;
	["UserMutation"]: AliasType<{
postQuestion?: [{	createQuestion: ResolverInputTypes["CreateQuestion"]},boolean | `@${string}`],
postAnswer?: [{	createAnswer: ResolverInputTypes["CreateAnswer"]},boolean | `@${string}`],
vote?: [{	_id: string},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["PublicMutation"]: AliasType<{
register?: [{	username: string,	password: string},ResolverInputTypes["AuthPayload"]],
login?: [{	username: string,	password: string},ResolverInputTypes["AuthPayload"]],
		__typename?: boolean | `@${string}`
}>;
	["ToAnswer"]: AliasType<{
	Question?:ResolverInputTypes["Question"],
	Answer?:ResolverInputTypes["Answer"],
		__typename?: boolean | `@${string}`
}>;
	["User"]: AliasType<{
	username?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AuthPayload"]: AliasType<{
	token?:boolean | `@${string}`,
	user?:ResolverInputTypes["User"],
		__typename?: boolean | `@${string}`
}>;
	["CreateQuestion"]: {
	content: string,
	title: string
};
	["CreateAnswer"]: {
	content: string,
	title: string,
	to: string
};
	["Dated"]:AliasType<{
		createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`;
		['...on Message']?: Omit<ResolverInputTypes["Message"],keyof ResolverInputTypes["Dated"]>;
		['...on Question']?: Omit<ResolverInputTypes["Question"],keyof ResolverInputTypes["Dated"]>;
		['...on Answer']?: Omit<ResolverInputTypes["Answer"],keyof ResolverInputTypes["Dated"]>;
		['...on User']?: Omit<ResolverInputTypes["User"],keyof ResolverInputTypes["Dated"]>;
		__typename?: boolean | `@${string}`
}>;
	["Owned"]:AliasType<{
		user?:ResolverInputTypes["User"];
		['...on Message']?: Omit<ResolverInputTypes["Message"],keyof ResolverInputTypes["Owned"]>;
		['...on Question']?: Omit<ResolverInputTypes["Question"],keyof ResolverInputTypes["Owned"]>;
		['...on Answer']?: Omit<ResolverInputTypes["Answer"],keyof ResolverInputTypes["Owned"]>;
		__typename?: boolean | `@${string}`
}>;
	["schema"]: AliasType<{
	query?:ResolverInputTypes["Query"],
	mutation?:ResolverInputTypes["Mutation"],
		__typename?: boolean | `@${string}`
}>
  }

export type ModelTypes = {
    ["Message"]: ModelTypes["Question"] | ModelTypes["Answer"];
	["StringId"]: ModelTypes["Message"] | ModelTypes["Question"] | ModelTypes["Answer"] | ModelTypes["User"];
	["Question"]: {
		content: string,
	score: number,
	_id: string,
	answers: Array<ModelTypes["Answer"]>,
	title: string,
	createdAt: string,
	updatedAt: string,
	user: ModelTypes["User"]
};
	["Answer"]: {
		content: string,
	score: number,
	_id: string,
	to?: ModelTypes["ToAnswer"] | undefined,
	createdAt: string,
	updatedAt: string,
	user: ModelTypes["User"],
	answers: Array<ModelTypes["Answer"]>
};
	["Query"]: {
		search: Array<ModelTypes["QuestionsResponse"]>,
	top: Array<ModelTypes["QuestionsResponse"]>,
	question?: ModelTypes["Question"] | undefined,
	me: ModelTypes["User"]
};
	["QuestionsResponse"]: {
		question: ModelTypes["Question"],
	bestAnswer?: ModelTypes["Answer"] | undefined
};
	["Mutation"]: {
		user?: ModelTypes["UserMutation"] | undefined,
	public?: ModelTypes["PublicMutation"] | undefined
};
	["UserMutation"]: {
		postQuestion?: string | undefined,
	postAnswer?: string | undefined,
	vote?: number | undefined
};
	["PublicMutation"]: {
		register: ModelTypes["AuthPayload"],
	login: ModelTypes["AuthPayload"]
};
	["ToAnswer"]:ModelTypes["Question"] | ModelTypes["Answer"];
	["User"]: {
		username: string,
	_id: string,
	createdAt: string,
	updatedAt: string
};
	["AuthPayload"]: {
		token: string,
	user: ModelTypes["User"]
};
	["CreateQuestion"]: {
	content: string,
	title: string
};
	["CreateAnswer"]: {
	content: string,
	title: string,
	to: string
};
	["Dated"]: ModelTypes["Message"] | ModelTypes["Question"] | ModelTypes["Answer"] | ModelTypes["User"];
	["Owned"]: ModelTypes["Message"] | ModelTypes["Question"] | ModelTypes["Answer"];
	["schema"]: {
	query?: ModelTypes["Query"] | undefined,
	mutation?: ModelTypes["Mutation"] | undefined
}
    }

export type GraphQLTypes = {
    ["Message"]: {
	__typename:"Question" | "Answer",
	content: string,
	score: number,
	_id: string,
	createdAt: string,
	updatedAt: string,
	user: GraphQLTypes["User"],
	answers: Array<GraphQLTypes["Answer"]>
	['...on Question']: '__union' & GraphQLTypes["Question"];
	['...on Answer']: '__union' & GraphQLTypes["Answer"];
};
	["StringId"]: {
	__typename:"Message" | "Question" | "Answer" | "User",
	_id: string
	['...on Message']: '__union' & GraphQLTypes["Message"];
	['...on Question']: '__union' & GraphQLTypes["Question"];
	['...on Answer']: '__union' & GraphQLTypes["Answer"];
	['...on User']: '__union' & GraphQLTypes["User"];
};
	["Question"]: {
	__typename: "Question",
	content: string,
	score: number,
	_id: string,
	answers: Array<GraphQLTypes["Answer"]>,
	title: string,
	createdAt: string,
	updatedAt: string,
	user: GraphQLTypes["User"]
};
	["Answer"]: {
	__typename: "Answer",
	content: string,
	score: number,
	_id: string,
	to?: GraphQLTypes["ToAnswer"] | undefined,
	createdAt: string,
	updatedAt: string,
	user: GraphQLTypes["User"],
	answers: Array<GraphQLTypes["Answer"]>
};
	["Query"]: {
	__typename: "Query",
	search: Array<GraphQLTypes["QuestionsResponse"]>,
	top: Array<GraphQLTypes["QuestionsResponse"]>,
	question?: GraphQLTypes["Question"] | undefined,
	me: GraphQLTypes["User"]
};
	["QuestionsResponse"]: {
	__typename: "QuestionsResponse",
	question: GraphQLTypes["Question"],
	bestAnswer?: GraphQLTypes["Answer"] | undefined
};
	["Mutation"]: {
	__typename: "Mutation",
	user?: GraphQLTypes["UserMutation"] | undefined,
	public?: GraphQLTypes["PublicMutation"] | undefined
};
	["UserMutation"]: {
	__typename: "UserMutation",
	postQuestion?: string | undefined,
	postAnswer?: string | undefined,
	vote?: number | undefined
};
	["PublicMutation"]: {
	__typename: "PublicMutation",
	register: GraphQLTypes["AuthPayload"],
	login: GraphQLTypes["AuthPayload"]
};
	["ToAnswer"]:{
        	__typename:"Question" | "Answer"
        	['...on Question']: '__union' & GraphQLTypes["Question"];
	['...on Answer']: '__union' & GraphQLTypes["Answer"];
};
	["User"]: {
	__typename: "User",
	username: string,
	_id: string,
	createdAt: string,
	updatedAt: string
};
	["AuthPayload"]: {
	__typename: "AuthPayload",
	token: string,
	user: GraphQLTypes["User"]
};
	["CreateQuestion"]: {
		content: string,
	title: string
};
	["CreateAnswer"]: {
		content: string,
	title: string,
	to: string
};
	["Dated"]: {
	__typename:"Message" | "Question" | "Answer" | "User",
	createdAt: string,
	updatedAt: string
	['...on Message']: '__union' & GraphQLTypes["Message"];
	['...on Question']: '__union' & GraphQLTypes["Question"];
	['...on Answer']: '__union' & GraphQLTypes["Answer"];
	['...on User']: '__union' & GraphQLTypes["User"];
};
	["Owned"]: {
	__typename:"Message" | "Question" | "Answer",
	user: GraphQLTypes["User"]
	['...on Message']: '__union' & GraphQLTypes["Message"];
	['...on Question']: '__union' & GraphQLTypes["Question"];
	['...on Answer']: '__union' & GraphQLTypes["Answer"];
}
    }


type ZEUS_VARIABLES = {
	["CreateQuestion"]: ValueTypes["CreateQuestion"];
	["CreateAnswer"]: ValueTypes["CreateAnswer"];
}