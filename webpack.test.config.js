const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const OUTPUTDIR = 'build'
module.exports = {
    entry: { test: './test/index.js' },
    output: {
        path: path.join(__dirname, OUTPUTDIR),
        filename: 'makehuman.test.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            'three-stdlib-geometry': path.join(__dirname, 'node_modules/three-stdlib/deprecated/Geometry.js')
        },
        extensions: ['.js']
    },
    devtool: 'inline-source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: 'test/index.html', to: '.' }]
        })
    ],
    devServer: {
        port: 8081,
        static: [
            {
                directory: path.join(__dirname, OUTPUTDIR)
            },
            {
                directory: path.join(__dirname, 'node_modules/makehuman-data/public'),
                publicPath: '/node_modules/makehuman-data/public'
            }
        ]
    }
}
