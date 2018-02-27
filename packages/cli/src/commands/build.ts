import { CommandGroup } from "../spawn";

export const BUILD_COMMANDS: CommandGroup = {
  "build:graphql:schema:json": {
    cmd:
      "apollo-codegen introspect-schema modules/graphql-api/schema.graphql --output modules/graphql-api/schema.json",
    mode: "MANUAL"
  },
  "build:graphql:schema:types": {
    cmd:
      "cli build:graphql:schema:types:gen && cli build:graphql:schema:types:fmt",
    mode: "MANUAL"
  },
  "build:graphql:schema:types:gen": {
    cmd:
      "gql-gen --file modules/graphql-api/schema.json  --template typescript --out modules/graphql-api/schema-types.ts modules/graphql-api/schema.graphql",
    mode: "MANUAL"
  },
  "build:graphql:schema:types:fmt": {
    cmd: "prettier --write 'modules/graphql-api/schema-types.ts'",
    mode: "MANUAL"
  },
  "build:graphql:client:types": {
    cmd:
      "cli build:graphql:client:types:gen; cli build:graphql:client:types:fmt",
    mode: "MANUAL"
  },
  "build:graphql:client:types:gen": {
    cmd:
      "apollo-codegen generate 'modules/client/**/*.graphql' --schema modules/graphql-api/schema.json --target typescript --output modules/client/graphql-types.ts",
    mode: "MANUAL"
  },
  "build:graphql:client:types:fmt": {
    cmd: "prettier --write 'modules/client/graphql-types.ts'",
    mode: "MANUAL"
  },
  "build:graphql:fmt": {
    cmd:
      "concurrently 'cli build:graphql:schema:types:fmt' 'cli build:graphql:client:types:fmt'",
    mode: "MANUAL"
  },
  "build:graphql": {
    cmd:
      "cli build:graphql:schema:json && concurrently 'cli build:graphql:schema:types' 'cli build:graphql:client:types'"
  },
  "build:client": { cmd: "webpack --config ./webpack/client.config.js" },
  "build:server": { cmd: "webpack --config ./webpack/server.config.js" }
};
