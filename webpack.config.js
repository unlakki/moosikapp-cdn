/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');
const webpackNodeExternals = require('webpack-node-externals');

const prod = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'node',
  entry: './src/index.js',
  mode: prod ? 'production' : 'development',
  output: {
    path: path.resolve('./build'),
    filename: 'server.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  externals: [
    webpackNodeExternals(),
  ],
  devtool: prod ? false : 'source-map',
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
