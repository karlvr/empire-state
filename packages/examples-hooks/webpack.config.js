const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	entry: './src/index',
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		symlinks: false,
	},
	output: {
		filename: './index.js',
	},
	mode: 'development',
	plugins: [
		new CopyWebpackPlugin([
			{
				from: './public',
				to: '',
			},
		]),
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
						use: [
							{
								loader: 'file-loader',
								options: {
									name: '[name].[ext]',
								},
							},
						],
					},
				],
			},
		],
	},
	devServer: {
		clientLogLevel: 'none',
		compress: true,
		contentBase: path.join(__dirname, 'dist'),
		open: true,
		stats: 'minimal',
	},
}
