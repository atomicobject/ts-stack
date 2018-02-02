#! /usr/bin/env node

import * as Yargs from "yargs";

import * as cp from "child_process";
import { promisify } from "util";

const exec = promisify(cp.exec);

async function yarnPath(): Promise<string> {
  const env = await exec("yarn env");
  const vars = JSON.parse(env.stdout);
  return vars["PATH"];
}

const argv = Yargs.usage("$0 <cmd> [args]")
  .command("dev", "run the dev server", yargs => yargs, function(argv: any) {
    const child = cp.exec(
      'yarn concurrently -p name -c "yellow,magenta,green,blue,gray" -n "webpack-server,nodemon-server,webpack-client,graphql-types" "yarn dev:server:webpack" "yarn dev:server:nodemon" "yarn dev:client" "yarn dev:graphql"'
    );
    child.stdout.on("data", data => process.stdout.write(data));
    child.stderr.on("data", data => process.stderr.write(data));
  })
  .help().argv;

console.log(argv);
