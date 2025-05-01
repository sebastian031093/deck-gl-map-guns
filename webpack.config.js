const Dotenv = require('dotenv-webpack');
const path = require('path');
const webpack = require('webpack');


module.exports = {

  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },

  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '.env'), // Ruta absoluta
      systemvars: true,
      allowEmptyValues: true,
      expand: true,
    }), // <-- Add this to load .env files
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        type: 'asset/resource'
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl'
    },
    fallback: {
      "process": require.resolve("process/browser.js"),
      /* "util": require.resolve("util/"),
      "path": require.resolve("path-browserify") */
    }
  },

  devServer: {
    static: './public', // Changed from 'dist' to 'public' to match your output.path
    hot: true,
    port: 8000,
    open: true,
    historyApiFallback: true // <-- Important for single-page applications
  },
};