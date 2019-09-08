/* eslint-disable */

const path = require('path');
const webpack = require('webpack');
const webpackNodeExternals = require('webpack-node-externals');

const prod = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'node',
  entry: './src/index.ts',
  mode: prod ? 'production' : 'development',
  output: {
    path: path.resolve('./build'),
    filename: 'server.js',
  },
  node: {
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: [
    webpackNodeExternals(),
  ],
  devtool: prod ? false : 'source-map',
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
