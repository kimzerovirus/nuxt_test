const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'bundle.[hash].js',
		publicPath: '/',
		// path: path.resolve(__dirname, 'dist'),
		path: path.resolve(__dirname, '../src/main/resources/static'),
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
						options: {
							minimize: true,
						},
					},
				],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html',
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: path.resolve(__dirname, 'assets'), noErrorOnMissing: true },
			],
		}),
		new webpack.ProvidePlugin({
			React: 'react',
		}),
		new CleanWebpackPlugin(),
	],
	devServer: {
		static: {
			directory: path.resolve(__dirname, 'dist'),
		},
		port: 3000,
		historyApiFallback: true,
	},

	resolve: {
		fallback: {
			fs: false,
			path: false, // ammo.js seems to also use path
		},
		alias: {
			'@': path.resolve(__dirname, 'src/'),
		},
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
	},
};
