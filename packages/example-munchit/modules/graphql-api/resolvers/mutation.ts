import {
  AddSnackMutationArgs,
  VoteForMutationArgs
} from "graphql-api/schema-types";
import { MinimalSnack } from "graphql-api/resolvers/snack";
import { Context } from "graphql-api";
import { MinimalVote } from "graphql-api/resolvers/vote";

export const MutationResolvers = {
  async addSnack(
    obj: {},
    args: AddSnackMutationArgs,
    context: Context
  ): Promise<MinimalSnack | null> {
    try {
      return await context.snackRepository.insert(args);
    } catch (e) {
      const dupe = await context.snackRepository.byName.load(args.name);
      return dupe || null;
    }
  },

  async voteFor(
    obj: {},
    args: VoteForMutationArgs,
    context: Context
  ): Promise<MinimalVote> {
    const vote = await context.voteRepository.insert(args);
    return { id: vote.id, snack: { id: vote.snackId } };
  }
};
