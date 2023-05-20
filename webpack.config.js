const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// TODO production mode
const config = {
    mode: 'development',
    entry: buildPath('src', 'index.tsx'),
    output: {
        filename: 'bundle.[contenthash].js',
        path: buildPath('dist'),
        clean: true,
    },
    devtool: 'eval-source-map',
    devServer: {
        static: './dist',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: buildPath('src', 'index.html'),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', { runtime: 'automatic' }],
                            '@babel/preset-typescript',
                        ],
                        plugins: ['@babel/plugin-transform-typescript'],
                        cacheDirectory: true,
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};

function buildPath(...names) {
    return path.resolve(__dirname, ...names);
}

module.exports = config;
