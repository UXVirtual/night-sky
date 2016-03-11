var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: "./assets/src/index.js",
    output: {
        path: './assets/js',

        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    },
    resolve: [
        {
            root: [path.join(__dirname, "bower_components")]
        }
    ],
    plugins: [
        new webpack.ProvidePlugin({
            THREE: "three",
            "window.THREE": "three"
        }),
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
        )
    ]
};

