const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const htmlPath = path.join(__dirname, '/src/html/');

const config = {
	entry: {
		index: './src/ts/index.ts',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		chunkFilename: '[id].chunk.js',
		assetModuleFilename: '[name][ext]',
		clean: true,
	},
	optimization: {
		splitChunks: false,
		runtimeChunk: false,
		chunkIds: 'natural',
	},
	devServer: {
		open: false,
		host: 'localhost',
		port: 5174,
		historyApiFallback: false,
		client: {
			overlay: { warnings: false, errors: true },
		},
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: 'Babylon third-person prototype',
			filename: 'index.html',
			template: path.join(htmlPath, 'index.html'),
			chunks: ['index'],
		}),
		new MiniCssExtractPlugin({ filename: '[name].css' }),
	],

	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/i,
				loader: 'ts-loader',
				exclude: ['/node_modules/'],
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|glb|obj)$/i,
				type: 'asset',
			},
			{
				test: /\.html$/i,
				exclude: /node_modules/,
				loader: 'html-loader',
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
};

module.exports = () => {
	if (isProduction) {
		config.mode = 'production';
	} else {
		config.mode = 'development';
		config.devtool = 'source-map';
	}
	config.experiments = {
		asyncWebAssembly: true,
		topLevelAwait: true,
	};
	return config;
};
