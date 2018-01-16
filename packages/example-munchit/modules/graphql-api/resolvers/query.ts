import { Context } from "graphql-api";
import { MinimalSnack } from "graphql-api/resolvers/snack";
import sortBy from "lodash-es/sortBy";

export const QueryResolvers = {
  async allSnacks(
    query: {},
    args: {},
    context: Context
  ): Promise<MinimalSnack[]> {
    const snacks = await context.snackRepository.all();
    return sortBy(snacks, "name");
  }
};
