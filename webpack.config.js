/**
 * Created by brett.hadley on 11/04/2016.
 */
var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './src/index',
    output: {
        filename: 'dist/ReactSlider.js',
        libraryTarget: 'umd'
    },
    externals: [{
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        }
    }],
    module: {
        loaders: [
            { test: /\.js$/, loaders: ['babel-loader'], include: path.join(__dirname, 'src') }
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ]
};
