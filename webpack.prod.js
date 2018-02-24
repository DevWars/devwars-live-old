/* eslint import/no-extraneous-dependencies:0 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('./webpack.base');

process.env.NODE_ENV = 'production';

module.exports = merge(baseConfig, {
    plugins: [
        new UglifyJsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
    ],
});
