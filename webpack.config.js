const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const path = require("path")
const tailwindcss = require("tailwindcss")
const sveltePreprocess = require("svelte-preprocess")
const autoprefixer = require("autoprefixer")
const postcssRegisterProperty = require("postcss-register-property")

const mode = process.env.NODE_ENV || "development"
const prod = mode === "production"

module.exports = {
  entry: {
    "build/bundle": ["./src/main.js"]
  },
  externals: {
    crypto: "crypto"
  },
  resolve: {
    alias: {
      svelte: path.dirname(require.resolve("svelte/package.json"))
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"]
  },
  output: {
    path: path.join(__dirname, "/public"),
    filename: "[name].js",
    chunkFilename: "[name].[id].js"
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            preprocess: sveltePreprocess({
              postcss: {
                plugins: [() => [postcssRegisterProperty(/* pluginOptions */), tailwindcss, autoprefixer]]
              }
            }),
            compilerOptions: {
              dev: !prod
            },
            emitCss: prod,
            hotReload: !prod
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        // required to prevent errors from Svelte on Webpack 5+
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css"
    })
  ],
  devtool: prod ? false : "source-map",
  devServer: {
    hot: true
  }
}
