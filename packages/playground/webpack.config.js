const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

module.exports = {
  entry: "./src/index.ts",

  //devtool: "source-map",
  devtool: "inline-source-map",

  target: "node",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    devtoolModuleFilenameTemplate: "[absolute-resource-path]"
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [path.resolve(__dirname, "../modules"), "node_modules"]
  },

  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "awesome-typescript-loader",
            query: {
              configFileName: "./tsconfig.json"
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ]
};
