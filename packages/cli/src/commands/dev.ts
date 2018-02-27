import { CommandGroup } from "../spawn";

export const DEV_COMMANDS: CommandGroup = {
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
      "sleep 8 && nodemon -e graphql },gql -w modules/ -x 'cli build:graphql'",
    desc: "Watch for changes to graphql files and rebuild on change."
  }
};
