const { defineConfig } = require('@vue/cli-service');
const path = require('path');
module.exports = defineConfig({
	transpileDependencies: true,
	configureWebpack: config => {
		config.resolve.fallback = { path: false, fs: false };
	},
	outputDir: path.resolve(__dirname, '../src/main/resources/static'),
	// indexPath: path.resolve(__dirname, '../src/main/resources/static/index.html'),
});
