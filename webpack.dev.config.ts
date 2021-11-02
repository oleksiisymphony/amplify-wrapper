import { Configuration, HotModuleReplacementPlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ESLintPlugin from "eslint-webpack-plugin";
import packageJson from './package.json';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import ModuleFederationPlugin from 'webpack/lib/container/ModuleFederationPlugin';


const config: Configuration = {
  mode: "development",
  output: {
    publicPath: "/",
  },
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin({
      async: false
    }),
    new ESLintPlugin({
      extensions: ["js", "jsx", "ts", "tsx"],
    }),
    new ModuleFederationPlugin({
      name: 'AmplifyWrapper',
      filename: 'web-client-remote.js',
      remotes: {
        WebClientApp: 'WebClientApp@http://localhost:5000/web-client-remote.js'
      },
      shared: {
        ...packageJson.dependencies
      },
    }),
  ],
  devtool: "inline-source-map",
  devServer: {
    historyApiFallback: true,
    port: 4000,
    open: true,
    hot: true
  },
};

export default config;