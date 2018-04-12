import * as React from "react";
import { rawSchema } from "graphql-api/schema-base";
import createSagaMiddleware from "redux-saga";

import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  MockList
} from "graphql-tools";

export { MockList } from "graphql-tools";

import { ApolloProvider, ApolloClient } from "react-apollo";

import { mockNetworkInterfaceWithSchema } from "apollo-test-utils";
import { GraphQLResolveInfo } from "graphql";
import * as State from "client/state/index";
import { rootReducer } from "client/reducers/index";
import { Reducer, combineReducers } from "redux";
import { createStore, compose, applyMiddleware } from "redux";
import { RenderFunction } from "@storybook/react";
import { MemoryRouter } from "react-router";
import { SchemaMap } from "graphql-api";
import { routerReducer } from "react-router-redux";
import { buildCore } from "client";

// type DeepPartial<T> = T extends object //T extends any[] ? Array<DeepPartial<T[number]>> :
//   ? {
//       [P in keyof T]?: T[P] extends Array<infer U>
//         ? Array<DeepPartial<U>>
//         : DeepPartial<T[P]>
//     }
//   : T;

// type x = DeepPartial<{
//   foo: number;
//   bar: {
//     map: Map<number, string>;
//     y: string;
//   }[];
// }>;

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
type MockDefinitions<T> = {
  [K in keyof T]?: ((
    obj: any,
    args: any,
    context: any,
    info: GraphQLResolveInfo
  ) => DeepPartial<T[K]> | MockList | MockDefinitions<T[K]>)
};

/** Generate a mock apollo client with a defined set of mocks. If you need to mock a new composite graphql type, update the SchemaMap in the graphql module. */
export function mockClient(mocks: MockDefinitions<SchemaMap>): ApolloClient {
  const exSchema = makeExecutableSchema({ typeDefs: rawSchema });
  addMockFunctionsToSchema({
    schema: exSchema,
    mocks: mocks as any
  });

  const netInterface = mockNetworkInterfaceWithSchema({ schema: exSchema });
  const client = new ApolloClient({
    networkInterface: netInterface
  });
  return client;
}

export interface MockProviderOpts {
  /** Definition of graphql mocks for mock client */
  mocks?: MockDefinitions<SchemaMap>;
  /** Reducer function */
  reducer?: Reducer<State.Type>;

  /** A function to initialize the state. Passed the default state returned by the reducer. */
  initState?: (state: State.Type) => State.Type;
}

/** Create a fully initialized ApolloProvider with a mocked out graphql connection and arbitrary initial state. */
export function mockProvider(opts?: MockProviderOpts) {
  if (!opts) opts = {};

  let { initState } = opts;
  const apollo = mockClient(opts.mocks || {});

  let maybeJest: typeof jest | undefined = undefined;
  try {
    maybeJest = jest;
  } catch {}

  const mockFn = maybeJest ? maybeJest.fn : (x: any) => x;
  const { reducer, store } = buildCore({
    apollo,
    decorateReducer: mockFn,
    initState,
    routing: undefined // disable routing
  });

  return class extends React.Component<{}, {}> {
    static displayName = "MockProvider";
    static store = store;
    static reducer = reducer;

    render() {
      return (
        <MemoryRouter>
          <ApolloProvider client={apollo} store={store}>
            {this.props.children}
          </ApolloProvider>
        </MemoryRouter>
      );
    }
  };
}

export function mockProviderDecorator(opts?: MockProviderOpts) {
  const Provider = mockProvider(opts);
  return (story: RenderFunction) => <Provider>{story()}</Provider>;
}
