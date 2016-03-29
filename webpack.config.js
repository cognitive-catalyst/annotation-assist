
var webpack = require("webpack");


module.exports = {
    devServer: {
        historyApiFallback: true
    },
    resolve: {
            modulesDirectories: ["node_modules", "static"],
            extensions: ['', '.js', '.jsx']
        },
    entry: [
        "components/router.jsx"
    ],
    output: {
        path: __dirname + "/static/build/",
        filename: "bundle.js",
        publicPath: "static/build/"
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loaders: ["style","css","sass"]
            },
            {
                test: /\.css$/,
                loaders: ["style","css","sass"]
            },
            {
                test: /\.js.*$/,
                loaders: ['babel'],
                exclude: /node_modules/
            },
            { test: /\.woff$/,   loader: "url-loader?limit=10000&minetype=application/font-woff" },
            { test: /\.ttf$/,    loader: "url-loader" },
            { test: /\.eot$/,    loader: "url-loader" },
            { test: /\.svg$/,    loader: "url-loader" },
            { test: /\.png$/,    loader: "url-loader" },
            { test: /\.gif$/,    loader: "url-loader" }


        ]
    }
};