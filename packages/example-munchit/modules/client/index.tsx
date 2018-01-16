import * as React from "react";
import { ConnectedRouter } from "react-router-redux";
import { Route } from "react-router-dom";

import { History } from "history";
import { App } from "client/components/app";
import { HomePage } from "client/pages/home";
import { AddSnackPage } from "client/pages/add-snack";
import { Switch } from "react-router";

export default function Root(props: { history: History }) {
  return (
    <ConnectedRouter history={props.history}>
      <App>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/add-snack" component={AddSnackPage} />
        </Switch>
      </App>
    </ConnectedRouter>
  );
}
