const path = require('path')

const OUTPUTDIR = 'dist'
const SRC_PATH = path.join(__dirname, './src')

module.exports = (env, argv = {}) => {
    const isProduction = argv.mode === 'production'
    const BUILD_DEV = !isProduction

    console.log(`Running in BUILD_DEV=${BUILD_DEV} mode to OUTPUTDIR=${OUTPUTDIR}`)

    return {
        entry: { makehuman: './src/bundle.js' },
        output: {
            path: path.join(__dirname, OUTPUTDIR),
            filename: BUILD_DEV ? '[name].js' : '[name].min.js',
            chunkFilename: BUILD_DEV ? '[name].js' : '[name].min.js',
            library: {
                name: '[name]',
                type: 'umd'
            },
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
        modules: [
            SRC_PATH,
            './src/js',
            './test',
            './test/mocha',
            'node_modules'
        ],
        alias: {
            'three-stdlib-geometry': path.join(__dirname, 'node_modules/three-stdlib/deprecated/Geometry.js')
        },
        extensions: ['.js']
    },
        devtool: 'source-map',
        optimization: {
            minimize: isProduction,
            splitChunks: false
        }
    }
}
