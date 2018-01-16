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
import { Reducer } from "redux";
import { createStore, compose, applyMiddleware } from "redux";
import { RenderFunction } from "@storybook/react";
import { MemoryRouter } from "react-router";
import { SchemaMap } from "graphql-api";
import { routerReducer } from "react-router-redux";
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

  /** Value to use as state. Alternatively use initState */
  state?: State.Type;
  /** A function to initialize the state. Passed the default state returned by the reducer. */
  initState?: (state: State.Type) => State.Type;
}

/** Create a fully initialized ApolloProvider with a mocked out graphql connection and arbitrary initial state. */
export function mockProvider(opts?: MockProviderOpts) {
  if (!opts) opts = {};

  const apollo = mockClient(opts.mocks || {});

  const apolloReducer = apollo.reducer();

  function enhancedReducer(s: any, e: any): State.Type {
    let state = rootReducer(s, e);
    const newState = {
      ...state,
      router: routerReducer(s && s.router, e),
      apollo: apolloReducer(s && s.apollo, e)
    };
    // console.log(e, newState);
    return newState;
  }
  let maybeJest: typeof jest | undefined = undefined;
  try {
    maybeJest = jest;
  } catch {}

  const mockFn = maybeJest ? maybeJest.fn : (x: any) => x;
  const reducer = opts.reducer || mockFn(enhancedReducer);

  const sagaMiddleware = createSagaMiddleware();
  const enhancer = compose(
    applyMiddleware(sagaMiddleware, apollo.middleware())
  );
  let state =
    opts.state || reducer(undefined as any, { type: "@@INIT" } as any);
  if (opts.initState) state = opts.initState(state);

  const store = createStore<State.Type>(enhancedReducer, state, enhancer);

  return class extends React.Component<{}, {}> {
    static displayName = "MockProvider";
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
