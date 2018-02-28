import chalk from "chalk";
import { promisify } from "util";
import * as shellEscape from "shell-escape";
import * as crossSpawn from "cross-spawn";
import { ChildProcess } from "mz/child_process";
import { yarnPath, findPackageJson, projectRoot } from "./env";
import { CommandString, CommandWithArgs } from "./types";

function prefix(prefix: string, data: string) {
  return data.replace(/^/g, prefix);
}

export { crossSpawn, shellEscape };

export async function spawnWithEnv(params: {
  name?: string;
  cmd: CommandString;
  // color: string;
}): Promise<ChildProcess> {
  const child = crossSpawn(params.cmd, [], {
    shell: true,
    stdio: "inherit",
    env: {
      PATH: await yarnPath()
    }
  });

  return child;
}

export async function execInProjectRoot([cmd, args]: CommandWithArgs) {
  const cp = await crossSpawn(cmd, args, {
    cwd: await projectRoot(),
    shell: true,
    stdio: "inherit"
  });

  return new Promise(resolve => {
    cp.on("exit", resolve);
  });
}

const CONCURRENTLY_COLORS = [
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "gray"
];

/** Run a set of commands with the concurrently command */
export async function concurrently(map: {
  [key: string]: CommandString;
}): Promise<ChildProcess> {
  const keys = Object.keys(map);
  const commands = shellEscape(keys.map(k => map[k]));
  const colors = keys
    .map((_, i) => CONCURRENTLY_COLORS[i % CONCURRENTLY_COLORS.length])
    .join(",");
  const labels = keys.join(",");
  return await spawnWithEnv({
    cmd: `concurrently -p name --color -c \"${colors}\" -n "${labels}" ${commands}`
  });
}

export interface CommandGroup {
  [key: string]: {
    mode?: "MANUAL";
    desc?: string;
    cmd: CommandString;
  };
}

export function toShellString(cwa: CommandWithArgs): CommandString {
  return `${cwa[0]} ${shellEscape(cwa[1])}`.trim();
}
