import * as path from "path";
import type { Configuration as WebpackConfiguration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const devServer: DevServerConfiguration = {
  hot: true,
  host: "localhost",
  port: 3000,
};

const config: WebpackConfiguration = {
  mode: "development",
  entry: "./src/client/render.tsx",
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist", "client"),
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
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "client", "index.html"),
    }),
    new CleanWebpackPlugin(),
  ],
  devServer: devServer,
};

export default config;
