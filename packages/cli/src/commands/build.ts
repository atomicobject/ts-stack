import { CommandGroup } from "../spawn";

export const BUILD_COMMANDS: CommandGroup = {
  "build:graphql:client:types": {
    cmd:
      "cli build:graphql:client:types:gen; cli build:graphql:client:types:fmt",
    mode: "MANUAL"
  },
  "build:graphql:client:types:gen": {
    cmd:
      "yarn apollo codegen:generate --queries='modules/client/**/*.graphql' --target=typescript --schema=./modules/graphql-api/schema.graphql",
    mode: "MANUAL"
  },
  "build:graphql:client:types:fmt": {
    cmd: "prettier --write 'modules/client/**/__generated__/**/*.ts'",
    mode: "MANUAL"
  },
  "build:graphql:fmt": {
    cmd: "concurrently 'cli build:graphql:client:types:fmt'",
    mode: "MANUAL"
  },
  "build:graphql": {
    cmd: "cli build:graphql:client:types"
  },
  "build:client": { cmd: "webpack --config ./webpack/client.config.js" },
  "build:server": { cmd: "webpack --config ./webpack/server.config.js" }
};
