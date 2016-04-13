/**
 * Created by brett.hadley on 11/04/2016.
 */
var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        'demo': './demosrc.js'
    },
    output: {
        path: './',
        filename: '[name].js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin()
    ],
    devtool: "sourcemap"
};
