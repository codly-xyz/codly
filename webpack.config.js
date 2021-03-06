/* eslint-disable no-console */

require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const replacements = {
  NODE_ENV: JSON.stringify(process.env.NODE_ENV),
  BASE_DOMAIN: JSON.stringify(process.env.BASE_DOMAIN),
  CODLY_LANDING_URL: JSON.stringify(process.env.CODLY_LANDING_URL),
  CODLY_APP_URL: JSON.stringify(process.env.CODLY_APP_URL),
  CODLY_API_BASE: JSON.stringify(process.env.CODLY_API_BASE),
};

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: path.join(__dirname, 'src'),

  module: {
    rules: [
      // SASS files
      {
        test: /\.sass$/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      // CSS files
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // Vue template files
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: 'vue-style-loader!css-loader!sass-loader',
            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
          },
        },
      },
      // JavaScript files
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      // HTML files
      {
        test: /\.html$/,
        loaders: [
          'file-loader?name=[path][name].html&context=src',
          'extract-loader',
          {
            loader: 'string-replace-loader',
            options: {
              multiple: Object
                .entries(replacements)
                .map(([k, v]) => ({ search: k, replace: (v || '').replace(/"/g, '\\"') })),
            },
          },
          'html-loader',
        ],
      },
      // Files that require no compilation or processing
      {
        test: /\.(ttf|woff|woff2|eot|png|svg)/,
        loader: 'url-loader',
        query: { limit: 10000, name: '[path][name].[ext]', context: 'src' },
      },
    ],
  },

  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: 'index.js',
  },

  resolve: {
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js',
    },
  },

  plugins: [
    new webpack.DefinePlugin(replacements),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin(['static/**/*']),
  ],


  // --------------------------------------------------------------------------


  devServer: {
    contentBase: path.join(__dirname, 'build'),
    historyApiFallback: {
      rewrites: [{ from: /^\//, to: '/index.html' }], // SPA; routes should be rewritten
    },
    noInfo: true,
    host: process.env.HOST || process.env.IP || '0.0.0.0',
    port: process.env.PORT || 8080,
    disableHostCheck: true,
  },
};

// Custom settings for production
if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.LoaderOptionsPlugin({ minimize: true }),
  ]);
}
