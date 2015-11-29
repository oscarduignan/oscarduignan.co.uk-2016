import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Clean from 'clean-webpack-plugin';
import merge from 'webpack-merge';
import pkg from './package.json';
import autoprefixer from 'autoprefixer';
import ManifestRevisionPlugin from 'manifest-revision-webpack-plugin';
import glob from 'glob';

// WEBPACK PLUGINS

class PrefetchGlobPlugin {
    constructor(patterns) {
        this.patterns = [].concat(patterns);
    }

    apply(compiler) {
        this.patterns.forEach(pattern => {
            glob.sync(pattern).forEach(path => {
                compiler.apply(new webpack.PrefetchPlugin('./' + path));
            });
        });
    }
}

class ManifestWriterPlugin {
    constructor(destination) {
        this.destination = destination;
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, callback) => {
            var assets = {};

            Object.keys(compilation.assets).forEach(asset => {
                console.log(asset);
                assets[asset.split('.').filter((_, i) => i !== 1).join('.')] = asset;
            });

            require('fs').writeFileSync(
                this.destination,
                JSON.stringify({
                    hash: compilation.hash,
                    publicPath: compilation.mainTemplate.getPublicPath({
                        hash: compilation.hash
                    }),
                    assets
                })
            );

            callback();
        });
    }
}

// WEBPACK CONFIG

const TARGET = process.env.npm_lifecycle_event;

const ROOT_PATH = path.resolve(__dirname);
const ASSETS_PATH  = path.join(ROOT_PATH, 'assets');

const PATHS  = {
    javascript: path.join(ASSETS_PATH, 'javascript'),
    stylesheets: path.join(ASSETS_PATH, 'stylesheets'),
    output: path.join(ROOT_PATH, 'public', 'assets')
};

var common = {
    entry: {
        main: [
            path.join(PATHS.javascript, 'main.js'),
            path.join(PATHS.stylesheets, 'main.scss')
        ]
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                include: PATHS.javascript
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?context=./assets&name=[path][name].[hash].[ext]'
                ]
            }
        ]
    },

    plugins: [
        new PrefetchGlobPlugin("assets/images/**/*"),
        new ManifestWriterPlugin(path.join(ROOT_PATH, 'data', 'webpack.json'))
    ],

    postcss: () => [autoprefixer]
};

if(TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        devtool: 'eval-source-map',

        output: {
            path: PATHS.output,
            publicPath: 'http://localhost:3000/assets/',
            filename: '[name].[hash].js'
        },

        module: {
            loaders: [
                {
                    test: /\.scss$/,
                    loaders: ['style', 'css', 'sass', 'postcss'],
                    include: PATHS.stylesheets
                }
            ]
        },

        devServer: {
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,
            stats: 'errors-only',
            port: 3000
        },

        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ]
    });
}

if(TARGET === 'build' || TARGET === 'stats' || TARGET === 'deploy') {
    module.exports = merge(common, {
        entry: {
            vendor: Object.keys(pkg.dependencies)
        },

        output: {
            path: PATHS.output,
            publicPath: '/assets/',
            filename: '[name].[chunkhash].js'
        },

        devtool: 'source-map',

        module: {
            loaders: [
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract('style', ['css', 'sass', 'postcss']),
                    include: PATHS.stylesheets
                }
            ]
        },

        plugins: [
            new Clean([PATHS.output]),
            new ExtractTextPlugin('[name].[chunkhash].css'),
            new webpack.optimize.CommonsChunkPlugin(
                'vendor',
                '[name].[chunkhash].js'
            ),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    });
}

