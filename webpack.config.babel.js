import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Clean from 'clean-webpack-plugin';
import merge from 'webpack-merge';
import pkg from './package.json';
import autoprefixer from 'autoprefixer';
import glob from 'glob';

class ManifestWriterPlugin {
    constructor(destination) {
        this.destination = destination;
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, callback) => {
            var assets = {};

            Object.keys(compilation.assets).forEach(asset => {
                var parts = asset.split('.');
                var alias = parts.filter((_, i) => (i !== 1) || parts.length < 3).join('.');
                assets[alias] = asset;
            });

            require('fs').writeFileSync(
                this.destination,
                JSON.stringify({assets})
            );

            callback();
        });
    }
}

const TARGET = process.env.npm_lifecycle_event;

const ROOT_PATH = path.resolve(__dirname);

const PATHS  = {
    javascript: path.join(ROOT_PATH, 'javascript'),
    stylesheets: path.join(ROOT_PATH, 'stylesheets'),
    output: path.join(ROOT_PATH, 'static', 'assets'),
    manifest: path.join(ROOT_PATH, 'data', 'webpack.json')
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
            }
        ]
    },

    sassLoader: {
        sourceMap: false
    },

    postcss: () => [autoprefixer]
};

if(TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        devtool: 'cheap-source-maps',

        output: {
            path: PATHS.output,
            filename: '[name].js'
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
            new Clean([PATHS.manifest]),
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
            new ManifestWriterPlugin(PATHS.manifest),
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

