const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
                        use: ['css-loader', 'sass-loader'],
                    }),
                }},
            },
        ],
    },
    plugins: [
        extractScss,
    ],
});
