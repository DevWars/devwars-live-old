/* eslint import/no-extraneous-dependencies:0 */
const config = require('config');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/client/index.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: { extractCSS: true },
            },
        ],
    },
    resolve: {
        extensions: ['.vue', '.js', '.json'],
    },
    performance: {
        hints: false,
        maxEntrypointSize: 400 * 1024,
    },
    stats: {
        children: false,
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.SOCKET_URL': `"${config.get('socketUrl')}"`,
        }),
        new CopyWebpackPlugin([{
            from: 'node_modules/monaco-editor/min/vs',
            to: 'vendor/vs',
        }]),
        new ExtractTextPlugin('styles.css'),
    ],
};
