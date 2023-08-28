const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PROD_MODE = process.env.NODE_ENV === 'production';
const DEV_MODE = !PROD_MODE;
console.log('production mode:', PROD_MODE);

const config = {
    entry: buildPath('src', 'index.tsx'),
    output: {
        filename: 'bundle.[contenthash].js',
        path: buildPath('dist'),
        clean: true,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
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

if (DEV_MODE) {
    Object.assign(config, {
        mode: 'development',
        devtool: 'eval-source-map',
        devServer: {
            static: './dist',
        },
    });
}

if (PROD_MODE) {
    Object.assign(config, {
        mode: 'production',
    });
}

function buildPath(...names) {
    return path.resolve(__dirname, ...names);
}

module.exports = config;
