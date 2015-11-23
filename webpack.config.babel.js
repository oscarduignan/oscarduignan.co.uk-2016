import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Clean from 'clean-webpack-plugin';
import merge from 'webpack-merge';
import pkg from './package.json';

const TARGET = process.env.npm_lifecycle_event;

const ROOT_PATH = path.resolve(__dirname);

const PATHS  = {
    js: path.join(ROOT_PATH, 'js'),
    css: path.join(ROOT_PATH, 'css'),
    output: path.join(ROOT_PATH, 'public', 'assets')
};

var common = {
    entry: {
        main: [
            path.join(PATHS.js, 'main.js'),
            path.join(PATHS.css, 'main.css')
        ]
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                include: PATHS.js
            }
        ]
    }
};

if(TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        devtool: 'eval-source-map',

        module: {
            loaders: [
                {
                    test: /\.css$/,
                    loaders: ['style', 'css'],
                    include: PATHS.css
                }
            ]
        },

        devServer: {
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,
            stats: 'errors-only',
            host: process.env.HOST,
            port: process.env.PORT
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
            filename: '[name].[chunkhash].js'
        },

        devtool: 'source-map',

        module: {
            loaders: [
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract('style', 'css'),
                    include: PATHS.css
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