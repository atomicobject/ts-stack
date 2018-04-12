import * as React from "react";
import * as ReactDom from "react-dom";

import { buildCore, App } from "../modules/client";

require("../modules/client/styles/main.scss");

import createHistory from "history/createBrowserHistory";

import { graphqlClient } from "client/graphql-client";
import { ApolloProvider, createApolloReducer } from "react-apollo";
import { ConnectedRouter } from "react-router-redux";
import { Provider } from "react-redux";

const history = createHistory();

const { store } = buildCore({
  routing: { history },
  apollo: graphqlClient
});

console.log(store);

const rootEl = (
  <ApolloProvider client={graphqlClient} store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </ApolloProvider>
);
ReactDom.render(
  (rootEl as any) as React.ReactElement<any>,
  document.getElementById("msl-app")
);
