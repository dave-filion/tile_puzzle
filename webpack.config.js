module.exports = {
  entry: {
    app: "./src/main.js",
  },

  output: {
    path: "./public",
    filename: "[name].bundle.js",
    chunkFilename: "[id].bundle.js"
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /(node_modules)/, loader: 'babel', query: {cacheDirectory: true, presets: ['es2015', 'react']} }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  }

};
