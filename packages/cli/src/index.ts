#! /usr/bin/env node

import * as Yargs from "yargs";

import * as cp from "child_process";
import chalk from "chalk";
import { promisify } from "util";
import * as shellEscape from "shell-escape";
import { child_process } from "mz";

const exec = promisify(cp.exec);

let _yarnPath: string | undefined;
async function yarnPath(): Promise<string> {
  if (!_yarnPath) {
    const env = await exec("yarn -s env -s");
    // console.log(env.stdout);
    try {
      const vars = JSON.parse(env.stdout);
      _yarnPath = vars["PATH"];
    } catch (e) {
      console.log({ badEnv: env.stdout });
      throw e;
    }
  }
  return _yarnPath!;
}

function prefix(prefix: string, data: string) {
  return data.replace(/^/g, prefix);
}

async function spawnWithEnv(params: {
  name?: string;
  cmd: string;
  // color: string;
}): Promise<cp.ChildProcess> {
  const child = cp.exec(params.cmd, {
    env: {
      PATH: await yarnPath()
    }
  });

  const label = params.name ? chalk.magenta(`${params.name}: `) : "";
  child.stdout.on(
    "data",
    data => process.stdout.write(data) // prefix(label, data.toString()))
  );
  child.stderr.on("data", data =>
    process.stderr.write(prefix(label, data.toString()))
  );
  return child;
}

async function concurrently(map: {
  [key: string]: string;
}): Promise<cp.ChildProcess> {
  const keys = Object.keys(map);
  const commands = keys.map(k => shellEscape([map[k]]));
  const colors = keys
    .map((_, i) => CONCURRENTLY_COLORS[i % CONCURRENTLY_COLORS.length])
    .join(",");
  const labels = keys.join(",");
  return await spawnWithEnv({
    cmd: `concurrently -p name --color -c \"${colors}\" -n "${labels}" ${commands.join(
      " "
    )}`
  });
}

interface CommandGroup {
  [key: string]: {
    desc?: string;
    cmd: string;
  };
}
const DEV_COMMAND: CommandGroup = {
  "dev:server:webpack": {
    cmd: "webpack --config webpack/server.config.js --watch",
    desc: "Watch for changes to server code and rebuild on change"
  },
  "dev:server:nodemon": {
    cmd: "nodemon --watch dist/server.js -- --inspect=9229 dist/server.js",
    desc: "Run the server and reload when it's recompiled"
  },
  "dev:client": {
    cmd: "node -e 'require(\"./webpack/webpack-dev-server\").startDevServer()'",
    desc: "Run the webpack dev server for the client"
  },
  "dev:graphql": {
    cmd:
      "sleep 8 && nodemon -e graphql },gql -w modules/ -x 'yarn -s build:graphql'",
    desc: "Watch for changes to graphql files and rebuild on change."
  }
};

const BUILD_COMMANDS: CommandGroup = {
  "build:graphql:schema:json": {
    cmd:
      "apollo-codegen introspect-schema modules/graphql-api/schema.graphql --output modules/graphql-api/schema.json"
  },
  "build:graphql:schema:types": {
    cmd:
      "cli build:graphql:schema:types:gen && cli build:graphql:schema:types:fmt"
  },
  "build:graphql:schema:types:gen": {
    cmd:
      "gql-gen --file modules/graphql-api/schema.json  --template typescript --out modules/graphql-api/schema-types.ts modules/graphql-api/schema.graphql"
  },
  "build:graphql:schema:types:fmt": {
    cmd: "prettier --write 'modules/graphql-api/schema-types.ts'"
  },
  "build:graphql:client:types": {
    cmd:
      "yarn -s build:graphql:client:types:gen; yarn build:graphql:client:types:fmt; yarn build:graphql:client:types:fmt"
  },
  "build:graphql:client:types:gen": {
    cmd:
      "apollo-codegen generate 'modules/{client },usp-components}/**/*.graphql' --schema modules/graphql-api/schema.json --target typescript --output modules/client/graphql-types.ts"
  },
  "build:graphql:client:types:fmt": {
    cmd: "prettier --write 'modules/client/graphql-types.ts'"
  },
  "build:graphql:fmt": {
    cmd:
      "concurrently 'yarn -s build:graphql:schema:types:fmt' 'yarn -s build:graphql:client:types:fmt'"
  },
  "build:graphql": {
    cmd:
      "yarn -s build:graphql:schema:json && concurrently 'yarn -s build:graphql:schema:types' 'yarn -s build:graphql:client:types'"
  },
  "build:client": { cmd: "webpack --config ./webpack/client.config.js" },
  "build:server": { cmd: "webpack --config ./webpack/server.config.js" }
};

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

const CONCURRENTLY_COLORS = [
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "gray"
];

let yargs = Yargs.usage("$0 <cmd> [args]").command(
  "dev",
  "run the dev server",
  yargs => yargs,
  async (argv: any) => concurrently(groupToCommandMap(DEV_COMMAND))
);

addCommandMapToYargs(yargs, DEV_COMMAND);

yargs.command(
  "build",
  "run the dev server",
  yargs => yargs,
  async (argv: any) => concurrently(groupToCommandMap(BUILD_COMMANDS))
);
addCommandMapToYargs(yargs, BUILD_COMMANDS);

yargs.help().argv;
