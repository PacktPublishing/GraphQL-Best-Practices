/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const.js';
import fetch, { Response } from 'node-fetch';
import WebSocket from 'ws';


export const HOST="Specify host"


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
    o: Z & {
      [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
    },
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
    o: Z & {
      [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
    },
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
  o: Z,
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

export type SelectionFunction<V> = <Z extends V>(
  t: Z & {
    [P in keyof Z]: P extends keyof V ? Z[P] : never;
  },
) => Z;

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
type ZEUS_INTERFACES = GraphQLTypes["Dated"] | GraphQLTypes["Owned"] | GraphQLTypes["StringId"]
export type ScalarCoders = {
}
type ZEUS_UNIONS = GraphQLTypes["MessageSender"]

export type ValueTypes = {
    ["Dated"]:AliasType<{
		createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`;
		['...on User']?: Omit<ValueTypes["User"],keyof ValueTypes["Dated"]>;
		['...on SalonProfile']?: Omit<ValueTypes["SalonProfile"],keyof ValueTypes["Dated"]>;
		['...on SalonClient']?: Omit<ValueTypes["SalonClient"],keyof ValueTypes["Dated"]>;
		['...on Visit']?: Omit<ValueTypes["Visit"],keyof ValueTypes["Dated"]>;
		['...on Service']?: Omit<ValueTypes["Service"],keyof ValueTypes["Dated"]>;
		['...on Message']?: Omit<ValueTypes["Message"],keyof ValueTypes["Dated"]>;
		['...on MessageThread']?: Omit<ValueTypes["MessageThread"],keyof ValueTypes["Dated"]>;
		['...on Client']?: Omit<ValueTypes["Client"],keyof ValueTypes["Dated"]>;
		__typename?: boolean | `@${string}`
}>;
	["Owned"]:AliasType<{
		user?:ValueTypes["User"];
		['...on SalonProfile']?: Omit<ValueTypes["SalonProfile"],keyof ValueTypes["Owned"]>;
		__typename?: boolean | `@${string}`
}>;
	["StringId"]:AliasType<{
		_id?:boolean | `@${string}`;
		['...on User']?: Omit<ValueTypes["User"],keyof ValueTypes["StringId"]>;
		['...on SalonProfile']?: Omit<ValueTypes["SalonProfile"],keyof ValueTypes["StringId"]>;
		['...on SalonClient']?: Omit<ValueTypes["SalonClient"],keyof ValueTypes["StringId"]>;
		['...on Visit']?: Omit<ValueTypes["Visit"],keyof ValueTypes["StringId"]>;
		['...on Service']?: Omit<ValueTypes["Service"],keyof ValueTypes["StringId"]>;
		['...on Message']?: Omit<ValueTypes["Message"],keyof ValueTypes["StringId"]>;
		['...on MessageThread']?: Omit<ValueTypes["MessageThread"],keyof ValueTypes["StringId"]>;
		['...on Client']?: Omit<ValueTypes["Client"],keyof ValueTypes["StringId"]>;
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
	["PublicMutation"]: AliasType<{
register?: [{	username: string | Variable<any, string>,	password: string | Variable<any, string>},ValueTypes["AuthPayload"]],
login?: [{	username: string | Variable<any, string>,	password: string | Variable<any, string>},ValueTypes["AuthPayload"]],
		__typename?: boolean | `@${string}`
}>;
	["SalonProfile"]: AliasType<{
	name?:boolean | `@${string}`,
	slug?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	user?:ValueTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	services?:ValueTypes["Service"],
		__typename?: boolean | `@${string}`
}>;
	["SalonOps"]: AliasType<{
createService?: [{	service: ValueTypes["CreateService"] | Variable<any, string>},boolean | `@${string}`],
serviceOps?: [{	_id: string | Variable<any, string>},ValueTypes["ServiceOps"]],
update?: [{	salon: ValueTypes["UpdateSalon"] | Variable<any, string>},ValueTypes["RegisterResponse"]],
	delete?:boolean | `@${string}`,
createVisit?: [{	visit: ValueTypes["CreateVisitFromAdmin"] | Variable<any, string>},boolean | `@${string}`],
visitOps?: [{	_id: string | Variable<any, string>},ValueTypes["VisitOps"]],
sendMessage?: [{	salonClientId: string | Variable<any, string>,	message: ValueTypes["MessageInput"] | Variable<any, string>},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["CreateSalon"]: {
	name: string | Variable<any, string>,
	slug: string | Variable<any, string>
};
	["UpdateSalon"]: {
	name?: string | undefined | null | Variable<any, string>,
	slug?: string | undefined | null | Variable<any, string>
};
	["SalonClient"]: AliasType<{
	salon?:ValueTypes["SalonProfile"],
visits?: [{	filterDates: ValueTypes["DateFilter"] | Variable<any, string>,	salonId?: string | undefined | null | Variable<any, string>},ValueTypes["Visit"]],
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	messageThread?:ValueTypes["MessageThread"],
	client?:ValueTypes["Client"],
		__typename?: boolean | `@${string}`
}>;
	["Visit"]: AliasType<{
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	service?:ValueTypes["Service"],
	status?:boolean | `@${string}`,
	whenDateTime?:boolean | `@${string}`,
	client?:ValueTypes["Client"],
		__typename?: boolean | `@${string}`
}>;
	["SalonQuery"]: AliasType<{
	me?:ValueTypes["SalonProfile"],
	clients?:ValueTypes["SalonClient"],
visits?: [{	filterDates: ValueTypes["DateFilter"] | Variable<any, string>},ValueTypes["Visit"]],
analytics?: [{	filterDates: ValueTypes["DateFilter"] | Variable<any, string>},ValueTypes["SalonAnalytics"]],
client?: [{	_id: string | Variable<any, string>},ValueTypes["SalonClient"]],
		__typename?: boolean | `@${string}`
}>;
	["DateFilter"]: {
	from: string | Variable<any, string>,
	to?: string | undefined | null | Variable<any, string>
};
	["Service"]: AliasType<{
	salon?:ValueTypes["SalonProfile"],
	approximateDurationInMinutes?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	description?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CreateService"]: {
	approximateDurationInMinutes: string | Variable<any, string>,
	name: string | Variable<any, string>,
	description: string | Variable<any, string>,
	price?: number | undefined | null | Variable<any, string>
};
	["UpdateService"]: {
	approximateDurationInMinutes?: string | undefined | null | Variable<any, string>,
	name?: string | undefined | null | Variable<any, string>,
	description?: string | undefined | null | Variable<any, string>,
	price?: number | undefined | null | Variable<any, string>
};
	/** Root pipe queries */
["Query"]: AliasType<{
	user?:ValueTypes["UserQuery"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	public?:ValueTypes["PublicMutation"],
	user?:ValueTypes["UserOps"],
		__typename?: boolean | `@${string}`
}>;
	["ServiceOps"]: AliasType<{
	delete?:boolean | `@${string}`,
update?: [{	service: ValueTypes["UpdateService"] | Variable<any, string>},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["VisitStatus"]:VisitStatus;
	["CreateVisitFromClient"]: {
	whenDateTime: string | Variable<any, string>,
	serviceId: string | Variable<any, string>
};
	["CreateVisitFromAdmin"]: {
	whenDateTime: string | Variable<any, string>,
	serviceId: string | Variable<any, string>,
	clientId: string | Variable<any, string>
};
	["UpdateVisitFromAdmin"]: {
	whenDateTime?: string | undefined | null | Variable<any, string>,
	serviceId?: string | undefined | null | Variable<any, string>,
	userId?: string | undefined | null | Variable<any, string>
};
	["VisitOps"]: AliasType<{
update?: [{	visit: ValueTypes["UpdateVisitFromAdmin"] | Variable<any, string>},ValueTypes["VisitResponse"]],
	delete?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AnalyticsAmountPerDate"]: AliasType<{
	date?:boolean | `@${string}`,
	amount?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SalonAnalytics"]: AliasType<{
	visitsPerDay?:ValueTypes["AnalyticsAmountPerDate"],
	cashPerDay?:ValueTypes["AnalyticsAmountPerDate"],
		__typename?: boolean | `@${string}`
}>;
	["ClientQuery"]: AliasType<{
	clients?:ValueTypes["SalonClient"],
	me?:ValueTypes["Client"],
client?: [{	_id: string | Variable<any, string>},ValueTypes["SalonClient"]],
		__typename?: boolean | `@${string}`
}>;
	["UserOps"]: AliasType<{
registerAsSalon?: [{	salon: ValueTypes["CreateSalon"] | Variable<any, string>},ValueTypes["RegisterResponse"]],
registerAsClient?: [{	client: ValueTypes["CreateClient"] | Variable<any, string>},ValueTypes["RegisterResponse"]],
	client?:ValueTypes["ClientOps"],
	salon?:ValueTypes["SalonOps"],
		__typename?: boolean | `@${string}`
}>;
	["CreateClient"]: {
	firstName: string | Variable<any, string>,
	lastName: string | Variable<any, string>,
	email?: string | undefined | null | Variable<any, string>,
	phone?: string | undefined | null | Variable<any, string>
};
	["UpdateClient"]: {
	firstName?: string | undefined | null | Variable<any, string>,
	lastName?: string | undefined | null | Variable<any, string>,
	email?: string | undefined | null | Variable<any, string>,
	phone?: string | undefined | null | Variable<any, string>
};
	["SalonClientOps"]: AliasType<{
createVisit?: [{	visit: ValueTypes["CreateVisitFromClient"] | Variable<any, string>},ValueTypes["VisitResponse"]],
sendMessage?: [{	message: ValueTypes["MessageInput"] | Variable<any, string>},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["ClientOps"]: AliasType<{
update?: [{	client: ValueTypes["UpdateClient"] | Variable<any, string>},ValueTypes["RegisterResponse"]],
registerToSalon?: [{	salonSlug: string | Variable<any, string>},boolean | `@${string}`],
salonClientOps?: [{	_id: string | Variable<any, string>},ValueTypes["SalonClientOps"]],
		__typename?: boolean | `@${string}`
}>;
	["RegistrationError"]:RegistrationError;
	["RegisterResponse"]: AliasType<{
	errors?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["VisitError"]:VisitError;
	["VisitResponse"]: AliasType<{
	errors?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["MessageInput"]: {
	message: string | Variable<any, string>
};
	["Message"]: AliasType<{
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	sender?:ValueTypes["MessageSender"],
	messageThread?:ValueTypes["MessageThread"],
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["MessageSender"]: AliasType<{		["...on SalonClient"] : ValueTypes["SalonClient"],
		["...on SalonProfile"] : ValueTypes["SalonProfile"]
		__typename?: boolean | `@${string}`
}>;
	["MessageThread"]: AliasType<{
	salonClient?:ValueTypes["SalonClient"],
	messages?:ValueTypes["Message"],
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Client"]: AliasType<{
	firstName?:boolean | `@${string}`,
	lastName?:boolean | `@${string}`,
	email?:boolean | `@${string}`,
	phone?:boolean | `@${string}`,
	user?:ValueTypes["User"],
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["UserQuery"]: AliasType<{
	me?:ValueTypes["User"],
	salon?:ValueTypes["SalonQuery"],
	client?:ValueTypes["ClientQuery"],
		__typename?: boolean | `@${string}`
}>
  }

export type ResolverInputTypes = {
    ["Dated"]:AliasType<{
		createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`;
		['...on User']?: Omit<ResolverInputTypes["User"],keyof ResolverInputTypes["Dated"]>;
		['...on SalonProfile']?: Omit<ResolverInputTypes["SalonProfile"],keyof ResolverInputTypes["Dated"]>;
		['...on SalonClient']?: Omit<ResolverInputTypes["SalonClient"],keyof ResolverInputTypes["Dated"]>;
		['...on Visit']?: Omit<ResolverInputTypes["Visit"],keyof ResolverInputTypes["Dated"]>;
		['...on Service']?: Omit<ResolverInputTypes["Service"],keyof ResolverInputTypes["Dated"]>;
		['...on Message']?: Omit<ResolverInputTypes["Message"],keyof ResolverInputTypes["Dated"]>;
		['...on MessageThread']?: Omit<ResolverInputTypes["MessageThread"],keyof ResolverInputTypes["Dated"]>;
		['...on Client']?: Omit<ResolverInputTypes["Client"],keyof ResolverInputTypes["Dated"]>;
		__typename?: boolean | `@${string}`
}>;
	["Owned"]:AliasType<{
		user?:ResolverInputTypes["User"];
		['...on SalonProfile']?: Omit<ResolverInputTypes["SalonProfile"],keyof ResolverInputTypes["Owned"]>;
		__typename?: boolean | `@${string}`
}>;
	["StringId"]:AliasType<{
		_id?:boolean | `@${string}`;
		['...on User']?: Omit<ResolverInputTypes["User"],keyof ResolverInputTypes["StringId"]>;
		['...on SalonProfile']?: Omit<ResolverInputTypes["SalonProfile"],keyof ResolverInputTypes["StringId"]>;
		['...on SalonClient']?: Omit<ResolverInputTypes["SalonClient"],keyof ResolverInputTypes["StringId"]>;
		['...on Visit']?: Omit<ResolverInputTypes["Visit"],keyof ResolverInputTypes["StringId"]>;
		['...on Service']?: Omit<ResolverInputTypes["Service"],keyof ResolverInputTypes["StringId"]>;
		['...on Message']?: Omit<ResolverInputTypes["Message"],keyof ResolverInputTypes["StringId"]>;
		['...on MessageThread']?: Omit<ResolverInputTypes["MessageThread"],keyof ResolverInputTypes["StringId"]>;
		['...on Client']?: Omit<ResolverInputTypes["Client"],keyof ResolverInputTypes["StringId"]>;
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
	["PublicMutation"]: AliasType<{
register?: [{	username: string,	password: string},ResolverInputTypes["AuthPayload"]],
login?: [{	username: string,	password: string},ResolverInputTypes["AuthPayload"]],
		__typename?: boolean | `@${string}`
}>;
	["SalonProfile"]: AliasType<{
	name?:boolean | `@${string}`,
	slug?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	user?:ResolverInputTypes["User"],
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	services?:ResolverInputTypes["Service"],
		__typename?: boolean | `@${string}`
}>;
	["SalonOps"]: AliasType<{
createService?: [{	service: ResolverInputTypes["CreateService"]},boolean | `@${string}`],
serviceOps?: [{	_id: string},ResolverInputTypes["ServiceOps"]],
update?: [{	salon: ResolverInputTypes["UpdateSalon"]},ResolverInputTypes["RegisterResponse"]],
	delete?:boolean | `@${string}`,
createVisit?: [{	visit: ResolverInputTypes["CreateVisitFromAdmin"]},boolean | `@${string}`],
visitOps?: [{	_id: string},ResolverInputTypes["VisitOps"]],
sendMessage?: [{	salonClientId: string,	message: ResolverInputTypes["MessageInput"]},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["CreateSalon"]: {
	name: string,
	slug: string
};
	["UpdateSalon"]: {
	name?: string | undefined | null,
	slug?: string | undefined | null
};
	["SalonClient"]: AliasType<{
	salon?:ResolverInputTypes["SalonProfile"],
visits?: [{	filterDates: ResolverInputTypes["DateFilter"],	salonId?: string | undefined | null},ResolverInputTypes["Visit"]],
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	messageThread?:ResolverInputTypes["MessageThread"],
	client?:ResolverInputTypes["Client"],
		__typename?: boolean | `@${string}`
}>;
	["Visit"]: AliasType<{
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	service?:ResolverInputTypes["Service"],
	status?:boolean | `@${string}`,
	whenDateTime?:boolean | `@${string}`,
	client?:ResolverInputTypes["Client"],
		__typename?: boolean | `@${string}`
}>;
	["SalonQuery"]: AliasType<{
	me?:ResolverInputTypes["SalonProfile"],
	clients?:ResolverInputTypes["SalonClient"],
visits?: [{	filterDates: ResolverInputTypes["DateFilter"]},ResolverInputTypes["Visit"]],
analytics?: [{	filterDates: ResolverInputTypes["DateFilter"]},ResolverInputTypes["SalonAnalytics"]],
client?: [{	_id: string},ResolverInputTypes["SalonClient"]],
		__typename?: boolean | `@${string}`
}>;
	["DateFilter"]: {
	from: string,
	to?: string | undefined | null
};
	["Service"]: AliasType<{
	salon?:ResolverInputTypes["SalonProfile"],
	approximateDurationInMinutes?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	description?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["CreateService"]: {
	approximateDurationInMinutes: string,
	name: string,
	description: string,
	price?: number | undefined | null
};
	["UpdateService"]: {
	approximateDurationInMinutes?: string | undefined | null,
	name?: string | undefined | null,
	description?: string | undefined | null,
	price?: number | undefined | null
};
	/** Root pipe queries */
["Query"]: AliasType<{
	user?:ResolverInputTypes["UserQuery"],
		__typename?: boolean | `@${string}`
}>;
	["schema"]: AliasType<{
	query?:ResolverInputTypes["Query"],
	mutation?:ResolverInputTypes["Mutation"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	public?:ResolverInputTypes["PublicMutation"],
	user?:ResolverInputTypes["UserOps"],
		__typename?: boolean | `@${string}`
}>;
	["ServiceOps"]: AliasType<{
	delete?:boolean | `@${string}`,
update?: [{	service: ResolverInputTypes["UpdateService"]},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["VisitStatus"]:VisitStatus;
	["CreateVisitFromClient"]: {
	whenDateTime: string,
	serviceId: string
};
	["CreateVisitFromAdmin"]: {
	whenDateTime: string,
	serviceId: string,
	clientId: string
};
	["UpdateVisitFromAdmin"]: {
	whenDateTime?: string | undefined | null,
	serviceId?: string | undefined | null,
	userId?: string | undefined | null
};
	["VisitOps"]: AliasType<{
update?: [{	visit: ResolverInputTypes["UpdateVisitFromAdmin"]},ResolverInputTypes["VisitResponse"]],
	delete?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["AnalyticsAmountPerDate"]: AliasType<{
	date?:boolean | `@${string}`,
	amount?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["SalonAnalytics"]: AliasType<{
	visitsPerDay?:ResolverInputTypes["AnalyticsAmountPerDate"],
	cashPerDay?:ResolverInputTypes["AnalyticsAmountPerDate"],
		__typename?: boolean | `@${string}`
}>;
	["ClientQuery"]: AliasType<{
	clients?:ResolverInputTypes["SalonClient"],
	me?:ResolverInputTypes["Client"],
client?: [{	_id: string},ResolverInputTypes["SalonClient"]],
		__typename?: boolean | `@${string}`
}>;
	["UserOps"]: AliasType<{
registerAsSalon?: [{	salon: ResolverInputTypes["CreateSalon"]},ResolverInputTypes["RegisterResponse"]],
registerAsClient?: [{	client: ResolverInputTypes["CreateClient"]},ResolverInputTypes["RegisterResponse"]],
	client?:ResolverInputTypes["ClientOps"],
	salon?:ResolverInputTypes["SalonOps"],
		__typename?: boolean | `@${string}`
}>;
	["CreateClient"]: {
	firstName: string,
	lastName: string,
	email?: string | undefined | null,
	phone?: string | undefined | null
};
	["UpdateClient"]: {
	firstName?: string | undefined | null,
	lastName?: string | undefined | null,
	email?: string | undefined | null,
	phone?: string | undefined | null
};
	["SalonClientOps"]: AliasType<{
createVisit?: [{	visit: ResolverInputTypes["CreateVisitFromClient"]},ResolverInputTypes["VisitResponse"]],
sendMessage?: [{	message: ResolverInputTypes["MessageInput"]},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["ClientOps"]: AliasType<{
update?: [{	client: ResolverInputTypes["UpdateClient"]},ResolverInputTypes["RegisterResponse"]],
registerToSalon?: [{	salonSlug: string},boolean | `@${string}`],
salonClientOps?: [{	_id: string},ResolverInputTypes["SalonClientOps"]],
		__typename?: boolean | `@${string}`
}>;
	["RegistrationError"]:RegistrationError;
	["RegisterResponse"]: AliasType<{
	errors?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["VisitError"]:VisitError;
	["VisitResponse"]: AliasType<{
	errors?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["MessageInput"]: {
	message: string
};
	["Message"]: AliasType<{
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
	_id?:boolean | `@${string}`,
	sender?:ResolverInputTypes["MessageSender"],
	messageThread?:ResolverInputTypes["MessageThread"],
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["MessageSender"]: AliasType<{
	SalonClient?:ResolverInputTypes["SalonClient"],
	SalonProfile?:ResolverInputTypes["SalonProfile"],
		__typename?: boolean | `@${string}`
}>;
	["MessageThread"]: AliasType<{
	salonClient?:ResolverInputTypes["SalonClient"],
	messages?:ResolverInputTypes["Message"],
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Client"]: AliasType<{
	firstName?:boolean | `@${string}`,
	lastName?:boolean | `@${string}`,
	email?:boolean | `@${string}`,
	phone?:boolean | `@${string}`,
	user?:ResolverInputTypes["User"],
	_id?:boolean | `@${string}`,
	createdAt?:boolean | `@${string}`,
	updatedAt?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["UserQuery"]: AliasType<{
	me?:ResolverInputTypes["User"],
	salon?:ResolverInputTypes["SalonQuery"],
	client?:ResolverInputTypes["ClientQuery"],
		__typename?: boolean | `@${string}`
}>
  }

export type ModelTypes = {
    ["Dated"]: ModelTypes["User"] | ModelTypes["SalonProfile"] | ModelTypes["SalonClient"] | ModelTypes["Visit"] | ModelTypes["Service"] | ModelTypes["Message"] | ModelTypes["MessageThread"] | ModelTypes["Client"];
	["Owned"]: ModelTypes["SalonProfile"];
	["StringId"]: ModelTypes["User"] | ModelTypes["SalonProfile"] | ModelTypes["SalonClient"] | ModelTypes["Visit"] | ModelTypes["Service"] | ModelTypes["Message"] | ModelTypes["MessageThread"] | ModelTypes["Client"];
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
	["PublicMutation"]: {
		register: ModelTypes["AuthPayload"],
	login: ModelTypes["AuthPayload"]
};
	["SalonProfile"]: {
		name: string,
	slug: string,
	_id: string,
	user: ModelTypes["User"],
	createdAt: string,
	updatedAt: string,
	services?: Array<ModelTypes["Service"]> | undefined
};
	["SalonOps"]: {
		createService?: string | undefined,
	serviceOps?: ModelTypes["ServiceOps"] | undefined,
	update?: ModelTypes["RegisterResponse"] | undefined,
	delete?: boolean | undefined,
	createVisit?: string | undefined,
	visitOps?: ModelTypes["VisitOps"] | undefined,
	sendMessage?: boolean | undefined
};
	["CreateSalon"]: {
	name: string,
	slug: string
};
	["UpdateSalon"]: {
	name?: string | undefined,
	slug?: string | undefined
};
	["SalonClient"]: {
		salon: ModelTypes["SalonProfile"],
	visits: Array<ModelTypes["Visit"]>,
	_id: string,
	createdAt: string,
	updatedAt: string,
	messageThread: ModelTypes["MessageThread"],
	client: ModelTypes["Client"]
};
	["Visit"]: {
		_id: string,
	createdAt: string,
	updatedAt: string,
	service: ModelTypes["Service"],
	status: ModelTypes["VisitStatus"],
	whenDateTime: string,
	client: ModelTypes["Client"]
};
	["SalonQuery"]: {
		me: ModelTypes["SalonProfile"],
	clients: Array<ModelTypes["SalonClient"]>,
	visits: Array<ModelTypes["Visit"]>,
	analytics?: ModelTypes["SalonAnalytics"] | undefined,
	client?: ModelTypes["SalonClient"] | undefined
};
	["DateFilter"]: {
	from: string,
	to?: string | undefined
};
	["Service"]: {
		salon: ModelTypes["SalonProfile"],
	approximateDurationInMinutes: string,
	name: string,
	description: string,
	price?: number | undefined,
	createdAt: string,
	updatedAt: string,
	_id: string
};
	["CreateService"]: {
	approximateDurationInMinutes: string,
	name: string,
	description: string,
	price?: number | undefined
};
	["UpdateService"]: {
	approximateDurationInMinutes?: string | undefined,
	name?: string | undefined,
	description?: string | undefined,
	price?: number | undefined
};
	/** Root pipe queries */
["Query"]: {
		user?: ModelTypes["UserQuery"] | undefined
};
	["schema"]: {
	query?: ModelTypes["Query"] | undefined,
	mutation?: ModelTypes["Mutation"] | undefined
};
	["Mutation"]: {
		public?: ModelTypes["PublicMutation"] | undefined,
	user?: ModelTypes["UserOps"] | undefined
};
	["ServiceOps"]: {
		delete?: boolean | undefined,
	update?: boolean | undefined
};
	["VisitStatus"]:VisitStatus;
	["CreateVisitFromClient"]: {
	whenDateTime: string,
	serviceId: string
};
	["CreateVisitFromAdmin"]: {
	whenDateTime: string,
	serviceId: string,
	clientId: string
};
	["UpdateVisitFromAdmin"]: {
	whenDateTime?: string | undefined,
	serviceId?: string | undefined,
	userId?: string | undefined
};
	["VisitOps"]: {
		update?: ModelTypes["VisitResponse"] | undefined,
	delete?: boolean | undefined
};
	["AnalyticsAmountPerDate"]: {
		date: string,
	amount: number
};
	["SalonAnalytics"]: {
		visitsPerDay: Array<ModelTypes["AnalyticsAmountPerDate"]>,
	cashPerDay: Array<ModelTypes["AnalyticsAmountPerDate"]>
};
	["ClientQuery"]: {
		clients: Array<ModelTypes["SalonClient"]>,
	me: ModelTypes["Client"],
	client?: ModelTypes["SalonClient"] | undefined
};
	["UserOps"]: {
		registerAsSalon?: ModelTypes["RegisterResponse"] | undefined,
	registerAsClient?: ModelTypes["RegisterResponse"] | undefined,
	client?: ModelTypes["ClientOps"] | undefined,
	salon?: ModelTypes["SalonOps"] | undefined
};
	["CreateClient"]: {
	firstName: string,
	lastName: string,
	email?: string | undefined,
	phone?: string | undefined
};
	["UpdateClient"]: {
	firstName?: string | undefined,
	lastName?: string | undefined,
	email?: string | undefined,
	phone?: string | undefined
};
	["SalonClientOps"]: {
		createVisit?: ModelTypes["VisitResponse"] | undefined,
	sendMessage?: boolean | undefined
};
	["ClientOps"]: {
		update?: ModelTypes["RegisterResponse"] | undefined,
	registerToSalon?: boolean | undefined,
	salonClientOps?: ModelTypes["SalonClientOps"] | undefined
};
	["RegistrationError"]:RegistrationError;
	["RegisterResponse"]: {
		errors: Array<ModelTypes["RegistrationError"]>
};
	["VisitError"]:VisitError;
	["VisitResponse"]: {
		errors: Array<ModelTypes["VisitError"]>
};
	["MessageInput"]: {
	message: string
};
	["Message"]: {
		createdAt: string,
	updatedAt: string,
	_id: string,
	sender: ModelTypes["MessageSender"],
	messageThread: ModelTypes["MessageThread"],
	message: string
};
	["MessageSender"]:ModelTypes["SalonClient"] | ModelTypes["SalonProfile"];
	["MessageThread"]: {
		salonClient: ModelTypes["SalonClient"],
	messages: Array<ModelTypes["Message"]>,
	_id: string,
	createdAt: string,
	updatedAt: string
};
	["Client"]: {
		firstName: string,
	lastName: string,
	email?: string | undefined,
	phone?: string | undefined,
	user: ModelTypes["User"],
	_id: string,
	createdAt: string,
	updatedAt: string
};
	["UserQuery"]: {
		me: ModelTypes["User"],
	salon?: ModelTypes["SalonQuery"] | undefined,
	client?: ModelTypes["ClientQuery"] | undefined
}
    }

export type GraphQLTypes = {
    ["Dated"]: {
	__typename:"User" | "SalonProfile" | "SalonClient" | "Visit" | "Service" | "Message" | "MessageThread" | "Client",
	createdAt: string,
	updatedAt: string
	['...on User']: '__union' & GraphQLTypes["User"];
	['...on SalonProfile']: '__union' & GraphQLTypes["SalonProfile"];
	['...on SalonClient']: '__union' & GraphQLTypes["SalonClient"];
	['...on Visit']: '__union' & GraphQLTypes["Visit"];
	['...on Service']: '__union' & GraphQLTypes["Service"];
	['...on Message']: '__union' & GraphQLTypes["Message"];
	['...on MessageThread']: '__union' & GraphQLTypes["MessageThread"];
	['...on Client']: '__union' & GraphQLTypes["Client"];
};
	["Owned"]: {
	__typename:"SalonProfile",
	user: GraphQLTypes["User"]
	['...on SalonProfile']: '__union' & GraphQLTypes["SalonProfile"];
};
	["StringId"]: {
	__typename:"User" | "SalonProfile" | "SalonClient" | "Visit" | "Service" | "Message" | "MessageThread" | "Client",
	_id: string
	['...on User']: '__union' & GraphQLTypes["User"];
	['...on SalonProfile']: '__union' & GraphQLTypes["SalonProfile"];
	['...on SalonClient']: '__union' & GraphQLTypes["SalonClient"];
	['...on Visit']: '__union' & GraphQLTypes["Visit"];
	['...on Service']: '__union' & GraphQLTypes["Service"];
	['...on Message']: '__union' & GraphQLTypes["Message"];
	['...on MessageThread']: '__union' & GraphQLTypes["MessageThread"];
	['...on Client']: '__union' & GraphQLTypes["Client"];
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
	["PublicMutation"]: {
	__typename: "PublicMutation",
	register: GraphQLTypes["AuthPayload"],
	login: GraphQLTypes["AuthPayload"]
};
	["SalonProfile"]: {
	__typename: "SalonProfile",
	name: string,
	slug: string,
	_id: string,
	user: GraphQLTypes["User"],
	createdAt: string,
	updatedAt: string,
	services?: Array<GraphQLTypes["Service"]> | undefined
};
	["SalonOps"]: {
	__typename: "SalonOps",
	createService?: string | undefined,
	serviceOps?: GraphQLTypes["ServiceOps"] | undefined,
	update?: GraphQLTypes["RegisterResponse"] | undefined,
	delete?: boolean | undefined,
	createVisit?: string | undefined,
	visitOps?: GraphQLTypes["VisitOps"] | undefined,
	sendMessage?: boolean | undefined
};
	["CreateSalon"]: {
		name: string,
	slug: string
};
	["UpdateSalon"]: {
		name?: string | undefined,
	slug?: string | undefined
};
	["SalonClient"]: {
	__typename: "SalonClient",
	salon: GraphQLTypes["SalonProfile"],
	visits: Array<GraphQLTypes["Visit"]>,
	_id: string,
	createdAt: string,
	updatedAt: string,
	messageThread: GraphQLTypes["MessageThread"],
	client: GraphQLTypes["Client"]
};
	["Visit"]: {
	__typename: "Visit",
	_id: string,
	createdAt: string,
	updatedAt: string,
	service: GraphQLTypes["Service"],
	status: GraphQLTypes["VisitStatus"],
	whenDateTime: string,
	client: GraphQLTypes["Client"]
};
	["SalonQuery"]: {
	__typename: "SalonQuery",
	me: GraphQLTypes["SalonProfile"],
	clients: Array<GraphQLTypes["SalonClient"]>,
	visits: Array<GraphQLTypes["Visit"]>,
	analytics?: GraphQLTypes["SalonAnalytics"] | undefined,
	client?: GraphQLTypes["SalonClient"] | undefined
};
	["DateFilter"]: {
		from: string,
	to?: string | undefined
};
	["Service"]: {
	__typename: "Service",
	salon: GraphQLTypes["SalonProfile"],
	approximateDurationInMinutes: string,
	name: string,
	description: string,
	price?: number | undefined,
	createdAt: string,
	updatedAt: string,
	_id: string
};
	["CreateService"]: {
		approximateDurationInMinutes: string,
	name: string,
	description: string,
	price?: number | undefined
};
	["UpdateService"]: {
		approximateDurationInMinutes?: string | undefined,
	name?: string | undefined,
	description?: string | undefined,
	price?: number | undefined
};
	/** Root pipe queries */
["Query"]: {
	__typename: "Query",
	user?: GraphQLTypes["UserQuery"] | undefined
};
	["Mutation"]: {
	__typename: "Mutation",
	public?: GraphQLTypes["PublicMutation"] | undefined,
	user?: GraphQLTypes["UserOps"] | undefined
};
	["ServiceOps"]: {
	__typename: "ServiceOps",
	delete?: boolean | undefined,
	update?: boolean | undefined
};
	["VisitStatus"]: VisitStatus;
	["CreateVisitFromClient"]: {
		whenDateTime: string,
	serviceId: string
};
	["CreateVisitFromAdmin"]: {
		whenDateTime: string,
	serviceId: string,
	clientId: string
};
	["UpdateVisitFromAdmin"]: {
		whenDateTime?: string | undefined,
	serviceId?: string | undefined,
	userId?: string | undefined
};
	["VisitOps"]: {
	__typename: "VisitOps",
	update?: GraphQLTypes["VisitResponse"] | undefined,
	delete?: boolean | undefined
};
	["AnalyticsAmountPerDate"]: {
	__typename: "AnalyticsAmountPerDate",
	date: string,
	amount: number
};
	["SalonAnalytics"]: {
	__typename: "SalonAnalytics",
	visitsPerDay: Array<GraphQLTypes["AnalyticsAmountPerDate"]>,
	cashPerDay: Array<GraphQLTypes["AnalyticsAmountPerDate"]>
};
	["ClientQuery"]: {
	__typename: "ClientQuery",
	clients: Array<GraphQLTypes["SalonClient"]>,
	me: GraphQLTypes["Client"],
	client?: GraphQLTypes["SalonClient"] | undefined
};
	["UserOps"]: {
	__typename: "UserOps",
	registerAsSalon?: GraphQLTypes["RegisterResponse"] | undefined,
	registerAsClient?: GraphQLTypes["RegisterResponse"] | undefined,
	client?: GraphQLTypes["ClientOps"] | undefined,
	salon?: GraphQLTypes["SalonOps"] | undefined
};
	["CreateClient"]: {
		firstName: string,
	lastName: string,
	email?: string | undefined,
	phone?: string | undefined
};
	["UpdateClient"]: {
		firstName?: string | undefined,
	lastName?: string | undefined,
	email?: string | undefined,
	phone?: string | undefined
};
	["SalonClientOps"]: {
	__typename: "SalonClientOps",
	createVisit?: GraphQLTypes["VisitResponse"] | undefined,
	sendMessage?: boolean | undefined
};
	["ClientOps"]: {
	__typename: "ClientOps",
	update?: GraphQLTypes["RegisterResponse"] | undefined,
	registerToSalon?: boolean | undefined,
	salonClientOps?: GraphQLTypes["SalonClientOps"] | undefined
};
	["RegistrationError"]: RegistrationError;
	["RegisterResponse"]: {
	__typename: "RegisterResponse",
	errors: Array<GraphQLTypes["RegistrationError"]>
};
	["VisitError"]: VisitError;
	["VisitResponse"]: {
	__typename: "VisitResponse",
	errors: Array<GraphQLTypes["VisitError"]>
};
	["MessageInput"]: {
		message: string
};
	["Message"]: {
	__typename: "Message",
	createdAt: string,
	updatedAt: string,
	_id: string,
	sender: GraphQLTypes["MessageSender"],
	messageThread: GraphQLTypes["MessageThread"],
	message: string
};
	["MessageSender"]:{
        	__typename:"SalonClient" | "SalonProfile"
        	['...on SalonClient']: '__union' & GraphQLTypes["SalonClient"];
	['...on SalonProfile']: '__union' & GraphQLTypes["SalonProfile"];
};
	["MessageThread"]: {
	__typename: "MessageThread",
	salonClient: GraphQLTypes["SalonClient"],
	messages: Array<GraphQLTypes["Message"]>,
	_id: string,
	createdAt: string,
	updatedAt: string
};
	["Client"]: {
	__typename: "Client",
	firstName: string,
	lastName: string,
	email?: string | undefined,
	phone?: string | undefined,
	user: GraphQLTypes["User"],
	_id: string,
	createdAt: string,
	updatedAt: string
};
	["UserQuery"]: {
	__typename: "UserQuery",
	me: GraphQLTypes["User"],
	salon?: GraphQLTypes["SalonQuery"] | undefined,
	client?: GraphQLTypes["ClientQuery"] | undefined
}
    }
export const enum VisitStatus {
	CREATED = "CREATED",
	CONFIRMED = "CONFIRMED",
	CANCELED = "CANCELED",
	RESCHEDULED = "RESCHEDULED",
	COMPLETED = "COMPLETED"
}
export const enum RegistrationError {
	EXISTS_WITH_SAME_NAME = "EXISTS_WITH_SAME_NAME",
	INVALID_SLUG = "INVALID_SLUG",
	INVALID_NAME = "INVALID_NAME"
}
export const enum VisitError {
	INVALID_DATE = "INVALID_DATE"
}

type ZEUS_VARIABLES = {
	["CreateSalon"]: ValueTypes["CreateSalon"];
	["UpdateSalon"]: ValueTypes["UpdateSalon"];
	["DateFilter"]: ValueTypes["DateFilter"];
	["CreateService"]: ValueTypes["CreateService"];
	["UpdateService"]: ValueTypes["UpdateService"];
	["VisitStatus"]: ValueTypes["VisitStatus"];
	["CreateVisitFromClient"]: ValueTypes["CreateVisitFromClient"];
	["CreateVisitFromAdmin"]: ValueTypes["CreateVisitFromAdmin"];
	["UpdateVisitFromAdmin"]: ValueTypes["UpdateVisitFromAdmin"];
	["CreateClient"]: ValueTypes["CreateClient"];
	["UpdateClient"]: ValueTypes["UpdateClient"];
	["RegistrationError"]: ValueTypes["RegistrationError"];
	["VisitError"]: ValueTypes["VisitError"];
	["MessageInput"]: ValueTypes["MessageInput"];
}