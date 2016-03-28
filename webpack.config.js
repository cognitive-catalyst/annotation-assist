
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
        // "webpack-dev-server/client?http://127.0.0.1:8080",
        // "webpack/hot/only-dev-server",
        "components/router.jsx"
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
            { test: /\.ttf$/,    loader: "url-loader" },
            { test: /\.eot$/,    loader: "url-loader" },
            { test: /\.svg$/,    loader: "url-loader" },
            { test: /\.png$/,    loader: "url-loader" },
            { test: /\.gif$/,    loader: "url-loader" }


        ]
    }
};