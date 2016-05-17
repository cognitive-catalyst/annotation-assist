var webpack = require('webpack')
var config = require('./webpack.config.js')

config.entry.push('webpack-hot-middleware/client?reload=true')

config.devtool = 'source-map';

config.plugins = [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
    })
];

module.exports = config;
