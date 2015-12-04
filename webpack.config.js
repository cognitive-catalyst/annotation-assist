
var webpack = require("webpack");


module.exports = {
    devServer: {
        historyApiFallback: true
    },
    resolve: {
            modulesDirectories: ["node_modules", "static", "static/components/*"],
            extensions: ['', '.js', '.jsx']
        },
    entry: [
        // "webpack-dev-server/client?http://127.0.0.1:8080",
        // "webpack/hot/only-dev-server",
        "./static/components/router.jsx"
    ],
    output: {
        path: __dirname + "/static/build/",
        filename: "bundle.js",
        publicPath: "static/build/"
    },
    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
    ],
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
                loaders: ['babel-loader'],
                exclude: /node_modules/
            },
            { test: /\.woff$/,   loader: "url-loader?limit=10000&minetype=application/font-woff" },
            { test: /\.ttf$/,    loader: "file-loader" },
            { test: /\.eot$/,    loader: "file-loader" },
            { test: /\.svg$/,    loader: "file-loader" }
        ]
    }
};