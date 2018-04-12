import { Dependencies } from "../../types/dependencies";

export const CORE_DEPENDENCIES: Dependencies = {
  dependencies: {
    "@types/body-parser": "^1.16.4",
    "@types/compression": "^0.0.34",
    "@types/config": "^0.0.32",
    "@types/cors": "^2.8.1",
    "@types/dotenv": "^4.0.0",
    "@types/express": "^4.0.35",
    "@types/lodash-es": "^4.14.5",
    "@types/morgan": "^1.7.32",
    "@types/node": "^8.0.19",
    "@types/throng": "^4.0.0",
    throng: "^4.0.0",
    "source-map-support": "^0.4.15",
    morgan: "^1.8.1",
    "lodash-es": "^4.17.4",
    express: "^4.15.2",
    "express-sslify": "^1.2.0",
    "express-static-gzip": "^0.3.0",
    dotenv: "^4.0.0",
    cors: "^2.8.4",
    config: "^1.25.1",
    compression: "^1.7.0",
    "body-parser": "^1.17.1"
  },
  devDependencies: {
    "@types/jest": "^20.0.6",
    jest: "^22.0.0",
    "jest-environment-node-debug": "^2.0.0",
    nodemon: "^1.11.0",
    prettier: "^1.5.3",
    nightmare: "^2.10.0",
    typescript: "^2.7.1",
    tslint: "^5.5.0",
    "tslint-eslint-rules": "^4.0.0",
    "ts-node": "^3.3.0",
    "ts-jest": "^21.0.0",
    "precommit-hook": "^3.0.0",
    "node-sass": "^4.5.2",
    jsverify: "^0.8.2",
    foreman: "^2.0.0",
    cssnano: "^3.10.0",
    "cross-env": "^5.0.3",
    concurrently: "^3.5.0",
    "identity-obj-proxy": "^3.0.0"
  }
};

export default CORE_DEPENDENCIES;
