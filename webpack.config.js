const path = require('path');
const webpack = require('webpack');
const webpackNodeExternals = require('webpack-node-externals');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'node',
  entry: 'src/index.ts',
  mode: isProd ? 'production' : 'development',
  output: {
    path: path.resolve('dist'),
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
  devtool: isProd ? false : 'source-map',
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
