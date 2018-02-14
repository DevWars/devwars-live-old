const config = require('config');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractStyles = new ExtractTextPlugin('styles.css');

module.exports = {
    entry: './src/client/index.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractStyles.extract({
                    use: 'css-loader',
                }),
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: extractStyles,
                },
            },
        ],
    },
    resolve: {
        extensions: ['.vue', '.js', '.json'],
    },
    plugins: [
        extractStyles,
        new CopyWebpackPlugin([{
            from: 'node_modules/monaco-editor/min/vs',
            to: 'vendor/vs',
        }]),
        new webpack.DefinePlugin({
            'process.env.SOCKET_URL': config.has('socketUrl') ? `"${config.get('socketUrl')}"` : '',
        }),
    ],
};
