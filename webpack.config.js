const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
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
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  entry: {
    'public/js/script': [`${srcPath}/public/ts/script`],
  },

  output: {
    filename: '[name].[contenthash].js',
    path: distPath,
  },

  plugins: [
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
      publicPath: '/',
      generate: (seed, files) => {
        const manifest = {}
        files.forEach(file => {
          manifest[file.name.replace(/^public/, '')] = file.path.replace(
            '/public',
            ''
          )
        })
        return manifest
      },
    }),
  ],
})
