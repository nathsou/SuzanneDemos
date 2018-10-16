const path = require('path');
const dist = path.resolve(__dirname, 'dist');

module.exports = {
    entry: './src/Main.ts',
    module: {
        rules: [{
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/,
                ]
            },
            {
                test: /\.(png|jpg|bmp|obj)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "[path][name].[ext]",
                    },
                },
                include: path.join(__dirname, 'res')
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: 'suzanne-demo.js',
        path: dist
    },
    devServer: {
        contentBase: dist,
        overlay: true,
        port: 1621
    },
    // devtool: 'inline-source-map'
};