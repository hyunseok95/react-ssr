import * as path from "path";
import * as webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const config: webpack.Configuration = {
  mode: "production",
  entry: {
    "index.js": "./src/client/index.tsx",
    "mount.js": "./src/client/mount.ts",
  },
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist", "client"),
    filename: "[name]",
  },
  resolve: {
    extensions: ["", ".ts", ".tsx", ".js"],
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
        test: /\.html$/,
        loader: "file-loader",
        // options: {
        //   name: "[name].[ext]",
        // },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   React: "react",
    // }),
    new HtmlWebpackPlugin({
      template: "./src/client/index.html",
    }),
    // new CleanWebpackPlugin(),
  ],
};

export default config;
