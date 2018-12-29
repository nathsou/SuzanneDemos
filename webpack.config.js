const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dist = path.resolve(__dirname, 'dist');

const interactive_viewer_conf = {
    entry: './src/Playground/Main.ts',
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

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Suzanne Interactive Phong Shading Playground',
            filename: 'playground.html'
        })
    ]
    // devtool: 'inline-source-map'
};

const node_exporter_conf = {
    entry: './src/NodeExporterUtil/exporter.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: [
                /node_modules/,
                /node\-libpng/
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: 'node-exporter.js',
        path: dist
    },

    target: 'node'
    // devtool: 'inline-source-map'
};

const web_viewer_conf = {
    entry: './src/WebViewer/viewer.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: [
                /node_modules/,
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    output: {
        filename: 'web-viewer.js',
        path: dist
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Suzanne Demos Viewer',
            filename: 'webviewer.html'
        })
    ]
    // devtool: 'inline-source-map'
};

module.exports = [
    interactive_viewer_conf,
    node_exporter_conf,
    web_viewer_conf
];