const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        "styles": path.join(__dirname, "styles/styles.scss"),
        //"app": path.join(__dirname, "components/DocApp.tsx")
    },
    output: {
        path: path.resolve(__dirname, "dist/docs"),
        filename: "js/[name].js"
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: "css-loader"
                },
                {
                    loader: "sass-loader",
                    options: {
                        sourceMap: true,
                        // options...
                    }
                }
            ]
        }, {
            test: /\.tsx?$/,
            use: {
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                    allowTsInNodeModules: true
                }
            }
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/[name].css"
        }),
    ]
};