const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	entry: './src/index',
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: './index.js',
	},
	mode: 'development',
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: './public',
					to: '',
				},
			
		]}),
	],
	module: {
		rules: [
			{
				oneOf: [
					{
						test: [/\.tsx?$/],
						exclude: /node_modules/,
						use: {
							loader: 'ts-loader',
						},
					},
					{
						exclude: [/\.js$/, /\.jsx$/],
						type: 'asset/resource',
						generator: {
							name: '[name][ext]',
						},
					},
				],
			},
		],
	},
	devServer: {
		compress: true,
		open: true,
		devMiddleware: {
			stats: 'minimal',
		},
	},
}
