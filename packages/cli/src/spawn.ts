import chalk from "chalk";
import { promisify } from "util";
import * as shellEscape from "shell-escape";
import * as crossSpawn from "cross-spawn";
import { exec, ChildProcess } from "mz/child_process";

let _yarnPath: string | undefined;
export async function yarnPath(): Promise<string> {
  if (!_yarnPath) {
    const [stdout, stderr] = await exec("yarn -s --json env");
    const stringOutput = stdout.toString("utf8");
    try {
      const vars = JSON.parse(JSON.parse(stringOutput).data);
      _yarnPath = vars.PATH;
    } catch (e) {
      console.log({ badEnv: stringOutput });
      throw e;
    }
  }
  return _yarnPath!;
}

function prefix(prefix: string, data: string) {
  return data.replace(/^/g, prefix);
}

export async function spawnWithEnv(params: {
  name?: string;
  cmd: string;
  // color: string;
}): Promise<ChildProcess> {
  const child = crossSpawn(params.cmd, [], {
    shell: true,
    stdio: "inherit",
    env: {
      PATH: await yarnPath()
    }
  });

  // const label = params.name ? chalk.magenta(`${params.name}: `) : "";
  // child.stdout.pipe(process.stdout);
  // child.stdout.on(
  //   "data",
  //   data => process.stdout.write(data) // prefix(label, data.toString()))
  // );
  // child.stderr.on("data", data =>
  //   process.stderr.write(prefix(label, data.toString()))
  // );
  return child;
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
export async function concurrently(map: {
  [key: string]: string;
}): Promise<ChildProcess> {
  const keys = Object.keys(map);
  const commands = shellEscape(keys.map(k => shellEscape([map[k]])));
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
    cmd: string;
  };
}
