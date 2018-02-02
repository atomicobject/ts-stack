const path = require("path");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");
const loaders = require("./loaders");
const fs = require("fs");

const scriptsDir = path.join(__dirname, "../entry/scripts");

/** A map of of entry points for every file in scripts */
const scriptEntry = fs
  .readdirSync(scriptsDir)
  .filter(f => /\.tsx?$/.test(f))
  .filter(f => fs.statSync(path.join(scriptsDir, f)).isFile())
  .reduce((o, f) => {
    o[`scripts/${f.replace(/\.tsx?$/, "")}`] = path.resolve(
      path.join(scriptsDir, f)
    );
    return o;
  }, {});

const entry = Object.assign(
  {
    server: "./entry/server.ts"
  }
  // scriptEntry
);
console.log(entry);

module.exports = {
  entry: entry,

  //devtool: "source-map",
  devtool: "inline-source-map",

  target: "node",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js",
    devtoolModuleFilenameTemplate: "[absolute-resource-path]"
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [path.resolve(__dirname, "../modules"), "node_modules"]
  },

  externals: [
    nodeExternals({
      whitelist: [/^lodash-es/],
      modulesDir: "../../node_modules"
    })
  ],
  module: {
    loaders: [loaders.typescript, loaders.graphql]
  },

  plugins: [
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  ]
};
