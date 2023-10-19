const path = require("path"); // eslint-disable-line @typescript-eslint/no-var-requires
const webpack = require("webpack"); // eslint-disable-line @typescript-eslint/no-var-requires
const tailwindcss = require("tailwindcss"); // eslint-disable-line @typescript-eslint/no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require("html-webpack-plugin");

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({ path: "./.env" });

module.exports = {
  entry: "./src/index.tsx",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  experiments: {
    syncWebAssembly: true,
    topLevelAwait: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    tailwindcss,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        WSC_ORACLE: JSON.stringify(process.env.REACT_APP_WSC_ORACLE),
        BLOCKFROST_KEY: JSON.stringify(process.env.BLOCKFROST_KEY),
      },
    }),
  ],
  devServer: {
    port: 3000,
    static: {
      directory: path.join(__dirname, "dist"),
    },
  },
};
