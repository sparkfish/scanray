const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const paths = require('./paths')

module.exports = {
  entry: {
    'test-page': [paths.src + '/js/test-page.ts']
  },

  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  resolve: {
    extensions: [ '.ts', '.js' ],
  },

  plugins: [
    new CleanWebpackPlugin(),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: 'assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
      ],
    }),

    new HtmlWebpackPlugin({
      title: 'Scanner Test Page',
      favicon: paths.src + '/images/favicon.png',
      template: paths.src + '/test-page.hbs',
      filename: 'test-page.html',
      chunks: ['test-page'],
    }),

    new ESLintPlugin({
      files: ['.', 'src', 'config'],
      formatter: 'table',
    }),
  ],

  module: {
    rules: [
      // { test: /\.js$/, use: 'babel-loader' },
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.hbs$/, loader: 'handlebars-loader' },
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },
}
