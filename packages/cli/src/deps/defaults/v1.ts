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
    typescript: "^2.8.0",
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

export const GRAPHQL_DEPENDENCIES: Dependencies = {
  dependencies: {
    graphql: "^0.10.3",
    "graphql-server-express": "^1.0.5",
    "graphql-tools": "^1.1.0",
    "apollo-client": "^1.9.0",
    "apollo-codegen": "^0.17",
    "apollo-local-query": "^0.3.0",
    "react-apollo": "^1.4.10",
    dataloader: "^1.3.0"
  },
  devDependencies: {
    "apollo-test-utils": "^0.3.2",
    "jest-transform-graphql": "^2.0.0",
    "graphql-code-generator": "0.5.5"
  }
};

export const KNEX_DEPENDENCIES: Dependencies = {
  dependencies: {
    "@types/knex": "^0.0.61",
    pg: "^7.0.2",
    knex: "^0.13.0",
    "knex-logger": "^0.1.0"
  }
};

export const REACT_DEPENDENCIES: Dependencies = {
  dependencies: {
    "@types/react": "^15.6.5",
    "@types/react-dom": "^15.5.2",
    "@types/react-redux": "^5.0.6",
    "@types/react-router": "^4.0.14",
    "@types/react-router-dom": "^4.0.7",
    "@types/react-router-redux": "^5.0.4",
    react: "^15",
    "react-apollo": "^1.4.10",
    "react-dom": "^15",
    "react-redux": "^5.0.3",
    "react-router": "^4.1.2",
    "react-router-dom": "^4.1.2",
    "react-router-redux": "^5.0.0-alpha.9",
    redux: "^3.7.2",
    "redux-saga": "^0.15.6"
  },
  devDependencies: {
    "@storybook/addon-storyshots": "^3.2.11",
    "@storybook/addon-actions": "^3.2.0",
    "@storybook/addon-info": "^3.2.0",
    "@storybook/addon-knobs": "^3.2.0",
    "@storybook/addon-notes": "^3.2.0",
    "@storybook/react": "^3.2.3",
    "@types/enzyme": "^2.8.4",
    "@types/storybook__addon-actions": "^3.0.1",
    "@types/storybook__addon-knobs": "^3.0.1",
    "@types/storybook__addon-notes": "^3.0.1",
    "@types/storybook__react": "^3.0.3",
    enzyme: "^2.9.1",
    "react-test-renderer": "^15.6.1"
  }
};

export const WEBPACK_DEPENDENCIES: Dependencies = {
  devDependencies: {
    "awesome-typescript-loader": "^3.2.2",
    "compression-webpack-plugin": "^1.0.0",
    "css-loader": "^0.28.0",
    "extract-text-webpack-plugin": "^3.0.0",
    "file-loader": "^0.11.1",
    "html-webpack-plugin": "^2.30.1",
    "postcss-loader": "^2.0.3",
    "postcss-modules-local-by-default": "^1.1.1",
    "progress-bar-webpack-plugin": "^1.10.0",
    "sass-loader": "^6.0.3",
    "source-map-loader": "^0.2.1",
    "style-loader": "^0.18.2",
    "url-loader": "^0.5.8",
    webpack: "^3.4.1",
    "webpack-node-externals": "^1.5.4",
    "webpack-split-by-path": "^2.0.0",
    "webpack-dev-server": "^2.4.4",
    autoprefixer: "^7.1.2"
  }
};
