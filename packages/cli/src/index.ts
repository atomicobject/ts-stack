#! /usr/bin/env node

import * as shellEscape from "shell-escape";
import * as Yargs from "yargs";
import {
  CommandGroup,
  spawnWithEnv,
  concurrently,
  toShellString,
  execInProjectRoot
} from "./spawn";
import { DEV_COMMANDS } from "./commands/dev";
import { BUILD_COMMANDS } from "./commands/build";
import { upgradePlan } from "./deps";
import * as Dependencies from "./types/dependencies";
import { readPackageJson } from "./env";
import {
  CORE_DEPENDENCIES,
  WEBPACK_DEPENDENCIES,
  REACT_DEPENDENCIES,
  GRAPHQL_DEPENDENCIES,
  KNEX_DEPENDENCIES,
  DEPENDENCIES
} from "./deps/defaults/v1";

function groupToCommandMap(group: CommandGroup): { [key: string]: string } {
  return Object.keys(group).reduce(
    (map, key) => {
      map[key] = group[key].cmd;
      return map;
    },
    {} as { [key: string]: string }
  );
}

function addCommandMapToYargs(yargs: Yargs.Argv, commandMap: CommandGroup) {
  for (const key of Object.keys(commandMap)) {
    const cmd = commandMap[key].cmd;
    yargs.command(
      key,
      commandMap[key].desc || "",
      x => x,
      () => spawnWithEnv({ cmd })
    );
  }
}

let yargs = Yargs.usage("$0 <cmd> [args]").command(
  "dev",
  "run the dev server",
  yargs => yargs,
  async (argv: any) => concurrently(groupToCommandMap(DEV_COMMANDS))
);
addCommandMapToYargs(yargs, DEV_COMMANDS);

yargs.command(
  "build",
  "run the dev server",
  yargs => yargs,
  async (argv: any) => concurrently(groupToCommandMap(BUILD_COMMANDS))
);
addCommandMapToYargs(yargs, BUILD_COMMANDS);

yargs.command(
  "test:unit [args...]",
  "Run unit tests",
  yargs => yargs,
  argv => {
    const args = argv.args || [];
    spawnWithEnv({ cmd: `yarn jest ${shellEscape(args)}` });
  }
);

yargs.command(
  "upgrade",
  "Upgrade dependencies",
  yargs =>
    yargs
      .option("dry-run", { desc: "Don't actually upgrade anything" })
      .option("force", {
        desc: "Reinstall all registered packages to the locked version"
      }),
  async argv => {
    const pkg = await readPackageJson();

    const deps = Dependencies.selectDependencies({ deps: DEPENDENCIES });

    const toUpgrade = argv.force
      ? deps
      : Dependencies.outOfDate({ current: pkg, desired: deps });

    if (!toUpgrade) {
      console.log("Nothing is out of date");
      return;
    }

    const plan = upgradePlan(toUpgrade);

    if (argv.dryRun) {
      console.log("Would have run:");
      plan.map(toShellString).forEach(s => console.log(s, "\n"));
    } else {
      for (const swa of plan) {
        console.log(toShellString(swa));
        await execInProjectRoot(swa);
      }
    }
  }
);

yargs.help().argv;
