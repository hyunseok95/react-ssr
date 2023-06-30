import * as path from "path";
import * as webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const config: webpack.Configuration = {
  mode: "production",
  entry: "./src/client/index.ts",
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [path.resolve(__dirname, "src", "client"), "node_modules"],

    alias: {
      // "./base": path.resolve(__dirname, "src", "client", "base.tsx"),
      // "./routes": path.resolve(__dirname, "src", "client", "routes.ts"),
      "@": path.resolve(__dirname, "src", "client"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        options: {
          minimize: true,
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: "react",
    }),
    new HtmlWebpackPlugin({
      template: "./src/client/index.html",
    }),
    new CleanWebpackPlugin(),
  ],
};

export default config;
