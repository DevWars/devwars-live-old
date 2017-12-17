const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const commonConfig = require('./webpack.common');

const extractScss = new ExtractTextPlugin('styles.css');

module.exports = merge(commonConfig, {
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: { loaders: {
                    scss: extractScss.extract({
                        fallback: 'vue-style-loader',
                        use: [
                            { loader: 'css-loader', options: { minimize: true } },
                            'sass-loader',
                        ],
                    }),
                }},
            },
        ],
    },
    plugins: [
        extractScss,
        new UglifyJsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
});