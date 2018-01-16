import { ApolloClient } from "react-apollo";

import { GraphQLSchema } from "graphql";

const { createLocalInterface } = require("apollo-local-query");

import * as graphql from "graphql";

import * as db from "../db";

import { executableSchema } from "./index";
import { SnackRepository } from "records/snack-record";
import { VoteRepository } from "records/vote-record";

export function buildLocalApollo(schema: GraphQLSchema = executableSchema) {
  return new Context().apolloClient;
}

/** The graphql context type for this app.  */
export class Context {
  constructor(schema: GraphQLSchema = executableSchema) {
    this.apolloClient = new ApolloClient({
      ssrMode: true,
      networkInterface: createLocalInterface(graphql, schema, {
        context: this
      })
    });
  }

  // Add global request context, such as
  // repositories and dataloaders here.
  // someRepo = new SomeRepository()

  /** An ApolloClient which can be used for local graphql queries. Does not hit the network. */
  apolloClient: ApolloClient;

  // TODO: Perhaps compose this in?
  pg = db.getConnection();
  snackRepository = new SnackRepository(this.pg);
  voteRepository = new VoteRepository(this.pg);
}

/** Builds a new empty context for a request. */
export function buildContext(
  schema: GraphQLSchema = executableSchema
): Context {
  return new Context(schema);
}
