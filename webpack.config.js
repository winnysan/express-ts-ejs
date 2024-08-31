const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const srcPath = path.resolve(__dirname, 'src')
const distPath = path.resolve(__dirname, 'dist')

module.exports = env => ({
  mode: env.production ? 'production' : 'development',
  devtool: env.production ? undefined : 'eval-source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer'),
                  require('cssnano')({
                    preset: 'default',
                  }),
                ],
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss'],
  },

  entry: {
    'public/js/script': [`${srcPath}/public/ts/script.ts`],
    'public/css/style': [`${srcPath}/public/css/style.scss`],
  },

  output: {
    filename: '[name].[contenthash].js',
    path: distPath,
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
      publicPath: '/',
      generate: (seed, files) => {
        const manifest = {}
        files.forEach(file => {
          manifest[file.name.replace(/^public/, '')] = file.path.replace('/public', '')
        })
        return manifest
      },
    }),
  ],
})
