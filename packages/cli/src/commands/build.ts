import { CommandGroup } from "../spawn";

export const BUILD_COMMANDS: CommandGroup = {
  "build:graphql:schema:types": {
    cmd:
      "yarn build:graphql:server:types && cli build:graphql:schema:types:fmt",
    mode: "MANUAL"
  },
  "build:graphql:schema:types:fmt": {
    cmd: "prettier --write 'modules/graphql-api/schema-types.ts'",
    mode: "MANUAL"
  },
  "build:graphql:client:types": {
    cmd:
      "yarn build:graphql:client:types && cli build:graphql:client:types:fmt",
    mode: "MANUAL"
  },
  "build:graphql:client:types:fmt": {
    cmd: "prettier --write 'modules/client/graphql/types.tsx'",
    mode: "MANUAL"
  },
  "build:graphql:fmt": {
    cmd:
      "concurrently 'cli build:graphql:schema:types:fmt' 'cli build:graphql:client:types:fmt'",
    mode: "MANUAL"
  },
  "build:graphql": {
    cmd:
      "concurrently 'cli build:graphql:schema:types' 'cli build:graphql:client:types'"
  },
  "build:client": { cmd: "webpack --config ./webpack/client.config.js" },
  "build:server": { cmd: "webpack --config ./webpack/server.config.js" }
};
