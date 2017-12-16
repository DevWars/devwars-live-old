const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.vue', '.js', '.json'],
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'node_modules/monaco-editor/min/vs',
            to: 'vendor/vs',
        }]),
    ],
};
