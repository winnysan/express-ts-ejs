const baseDirectory = 'src'

module.exports = env => ({
  mode: env.production ? 'production' : 'development',

  entry: {
    'public/js/script': [`./${baseDirectory}/public/ts/script`],
  },

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

  devtool: env.production ? undefined : 'eval-source-map',

  output: {
    filename: '[name].js',
  },
})
