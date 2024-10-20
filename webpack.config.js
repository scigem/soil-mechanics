const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/js/mohrs-circle.js', // Entry point of your app
    output: {
        filename: 'bundle.js', // Output bundle name
        path: path.resolve(__dirname, 'dist'), // Output directory
        clean: true, // Clean the dist folder before each build
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'], // Transpile modern JS
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'], // Handle CSS imports
            },
        ],
    },
    devServer: {
        static: './dist', // Serve from the dist folder
        open: true, // Automatically open the browser
        hot: true, // Enable hot module replacement
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/html/index.html', // Specify HTML template
        }),
    ],
    mode: 'development',
};
