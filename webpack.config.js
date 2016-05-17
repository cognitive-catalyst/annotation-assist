
const webpack = require('webpack');


module.exports = {
    devServer: {
        historyApiFallback: true,
    },
    resolve: {
        modulesDirectories: ['node_modules', 'static', 'static/components'],
        extensions: ['', '.js', '.jsx'],
    },
    entry: [
        'babel-polyfill',
        'components/router.jsx',
    ],
    output: {
        path: __dirname + '/static/build/',
        filename: 'bundle.js',
        publicPath: 'static/build/',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                // NODE_ENV: 'production',
            },
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass'],
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css', 'sass'],
            },
            {
                test: /\.js.*$/,
                loaders: ['babel'],
                exclude: /node_modules/,
            },
            {
                test: /\.(otf|svg|eot|woff|woff2|ttf|jpg|png|gif)$/,
                loaders: ['url-loader'],
            },
        ],
    },
};
