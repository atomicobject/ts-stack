#! /usr/bin/env node

import * as shellEscape from "shell-escape";
import * as Yargs from "yargs";
import { CommandGroup, spawnWithEnv, concurrently } from "./spawn";
import { DEV_COMMANDS } from "./commands/dev";
import { BUILD_COMMANDS } from "./commands/build";

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

yargs.help().argv;
