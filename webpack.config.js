var path = require('path');

module.exports = {
  entry: {
    "angularjs" : "./.tmp/angularjs/module.js",
    "react" : "./.tmp/react/LineChart.js"
  },
  output: {
    path: "./build/",
    filename: "[name].js",
    chunkFilename: "[name].js"
  },
  target: 'web',
  resolveLoader: {
    root: path.join(__dirname, "node_modules")
  },
  resolve: {
    extensions: ['', '.js'],
  },
  module: {
    loaders: [
    ]
  }
}
