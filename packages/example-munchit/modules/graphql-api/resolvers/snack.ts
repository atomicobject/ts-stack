import { Snack } from "graphql-api/schema-types";
import { Context } from "graphql-api";

/** The graphql schema-compatible typescript type required to implement any snack resolver */
export interface MinimalSnack {
  id: Snack["id"];
}

export const SnackResolvers = {
  async name(snack: MinimalSnack, args: {}, context: Context) {
    if ((snack as any).name) return (snack as any).name;

    const record = await context.snackRepository.findById.load(snack.id);
    return record && record.name;
  },

  async voteCount(snack: MinimalSnack, args: {}, context: Context) {
    return await context.voteRepository.countForSnack.load(snack.id);
  }
};
