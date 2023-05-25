const path = require("path"); // eslint-disable-line @typescript-eslint/no-var-requires
const webpack = require("webpack"); // eslint-disable-line @typescript-eslint/no-var-requires
const tailwindcss = require("tailwindcss"); // eslint-disable-line @typescript-eslint/no-var-requires

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
  plugins: [tailwindcss, new webpack.HotModuleReplacementPlugin()],
  devServer: {
    port: 3000,
    static: {
      directory: path.join(__dirname, "dist"),
    },
  },
};
