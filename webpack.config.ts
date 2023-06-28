import * as path from "path";
import * as webpack from "webpack";

const config: webpack.Configuration = {
  mode: "production",
  entry: "./src/server/index.ts",
  target: "node14",
  output: {
    path: path.resolve(__dirname, "dist", "server"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src", "server"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env"],
              ["@babel/react"],
              ["@babel/preset-typescript"],
            ],
          },
        },
      },
    ],
  },
  plugins: [],
};

export default config;
