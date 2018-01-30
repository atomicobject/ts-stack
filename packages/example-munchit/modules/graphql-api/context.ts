import { ApolloClient } from "react-apollo";

import { GraphQLSchema } from "graphql";

const { createLocalInterface } = require("apollo-local-query");

import * as graphql from "graphql";

import * as db from "../db";

import { executableSchema } from "./index";
import { SnackRepository } from "records/snack-record";
import { VoteRepository } from "records/vote-record";
import { Transaction } from "knex";

export function buildLocalApollo(schema: GraphQLSchema = executableSchema) {
  return new Context().apolloClient;
}

/** The graphql context type for this app.  */
export class Context {
  constructor(
    public pg: db.Knex = db.getConnection(),
    schema: GraphQLSchema = executableSchema
  ) {
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
  snackRepository = new SnackRepository(this.pg);
  voteRepository = new VoteRepository(this.pg);
  repos = new Repositories(this.pg);
}

export class Repositories {
  constructor(public pg: db.Knex) {}

  transaction(
    func: (repos: Repositories, transaction: Transaction) => Promise<any>
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.pg.transaction(async trx => {
          return await func(new Repositories(trx), trx);
        });

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  snacks = new SnackRepository(this.pg);
  votes = new VoteRepository(this.pg);
}
