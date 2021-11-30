'use strict';

module.exports = {

    mode: 'development',
    devtool: false,
    entry: "./home",
    output: {
        path: __dirname,
        filename: "build.js",
        library: "home"
    },

    watch: true,

    watchOptions: {
        aggregateTimeout: 100
    },

    devtool: "source-map"
}