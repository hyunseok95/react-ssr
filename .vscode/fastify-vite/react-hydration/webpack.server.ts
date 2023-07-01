import * as path from "path";
import * as webpack from "webpack";

const config: webpack.Configuration = {
  mode: "production",
  entry: "./src/server/index.ts",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist", "server"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: "/node_modules",
        use: "babel-loader",
      },
    ],
  },
  plugins: [],
};

export default config;
