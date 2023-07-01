import * as path from "path";
import type { Configuration as WebpackConfiguration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

import HtmlWebpackPlugin from "html-webpack-plugin";
import { HotModuleReplacementPlugin } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const devServer: DevServerConfiguration = {
  hot: true,
  host: "localhost",
  port: 3001,
};

const config: WebpackConfiguration = {
  mode: "production",
  // entry: "./src/client/render.tsx",
  entry: "./src/client/hydrate.tsx",
  // entry: {
  // "render.js": "./src/client/render.tsx",
  // "hydrate.js": "./src/client/hydrate.tsx",
  // },
  devServer: devServer,
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "index.js",
    // filename: "[name]",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    // modules: [path.resolve(__dirname, "src", "client"), "node_modules"],
    // alias: {
    //   // "./base": path.resolve(__dirname, "src", "client", "base.tsx"),
    //   // "./routes": path.resolve(__dirname, "src", "client", "routes.ts"),
    //   "@": path.resolve(__dirname, "src", "client"),
    // },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: "/node_modules",
        use: "babel-loader",
      },
      {
        test: /\.(html)$/,
        use: "html-loader",
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: "file-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "client", "index.html"),
      filename: "index.html",
    }),
    new HotModuleReplacementPlugin(),

    new CleanWebpackPlugin(),
  ],
};

export default config;
