import { SnackRepository } from "records/snack-record";
import { getConnection, destroyConnection } from "db";
import { VoteRepository } from "records/vote-record";
import { truncateAll } from "__tests__/db-helpers";

describe("SnackRepository", () => {
  const knex = getConnection();
  let snackRepo = new SnackRepository(knex);
  let voteRepo = new VoteRepository(knex);

  beforeAll(async () => truncateAll(knex));
  afterAll(destroyConnection);

  it("Can insert and find records", async () => {
    const snack = await snackRepo.insert({ name: "Foo" });
    expect(snack.id).not.toBeFalsy();

    const lookedUpSnack = await snackRepo.findById.load(snack.id);
    if (!lookedUpSnack) throw "couldn't find snack";
    expect(lookedUpSnack.id).toEqual(snack.id);

    const byName = await snackRepo.byName.load("Foo");
    if (!byName) throw "couldn't find snack";
    expect(byName.id).toEqual(snack.id);
  });

  it("Can find the votes for a snack", async () => {
    const snack = await snackRepo.insert({ name: "Bar" });
    await voteRepo.insert({ snackId: snack.id });

    const votesOfSnack = await voteRepo.allForSnack.load(snack);
    expect(votesOfSnack.length).toEqual(1);

    const count = await voteRepo.countForSnack.load(snack.id);
    expect(count).toEqual(1);
  });

  it("Returns an empty array if there's no votes for the snack", async () => {
    const snack = await snackRepo.insert({ name: "Bar2" });

    const votesOfSnack = await voteRepo.allForSnack.load(snack);
    expect(votesOfSnack.length).toEqual(0);

    const count = await voteRepo.countForSnack.load(snack.id);
    expect(count).toEqual(0);
  });

  it("Can find the snack for a vote", async () => {
    const snack = await snackRepo.insert({ name: "Baz" });
    const vote = await voteRepo.insert({ snackId: snack.id });

    const voteSnack = await snackRepo.forVote.load(vote);
    expect(voteSnack.id).toEqual(snack.id);
  });
});
