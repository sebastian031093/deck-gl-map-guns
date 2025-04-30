
const path = require('path'); // Add this line at the top


module.exports = {
  // ... otras configuraciones
  mode: 'development', // <-- Move `mode` here (or 'production')
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        type: 'asset/resource'
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl'
    }
  },

  devServer: {
    static: './dist', // Where your static files are
    hot: true,       // Enable Hot Module Replacement (HMR)
    port: 8000,      // Optional: Set a custom port
    open: true,      // Optional: Auto-open browser
  },
};