import { Dependencies } from "../../types";

export const GRAPHQL_DEPENDENCIES: Dependencies = {
  dependencies: {
    graphql: "^0.10.3",
    "graphql-server-express": "^1.0.5",
    "graphql-tools": "^1.1.0",
    "apollo-client": "^1.9.0",
    "apollo-codegen": "^0.17",
    "apollo-local-query": "^0.3.0",
    "react-apollo": "^1.4.10"
  },
  devDependencies: {
    "apollo-test-utils": "^0.3.2",
    "jest-transform-graphql": "^2.0.0",
    "graphql-code-generator": "0.5.5"
  }
};

export default GRAPHQL_DEPENDENCIES;
