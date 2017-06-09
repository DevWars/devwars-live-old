const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/app/index.js',
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
		],
	},
};
