const webpack = require('webpack');
const path = require('path');

module.exports = (env = 'development') => {
  const plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(env),
      },
    }),
    new webpack.NamedModulesPlugin(),
  ];

  const entry = {
    app: [
      path.join(__dirname, 'src/index.js'),
    ],
  };

  const rules = [
    {
      test: /\.(js)$/,
      exclude: /node_modules/,
      use: 'babel-loader',
    },
  ];

  return {
    entry,
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'bundle.js',
    },
    module: {
      rules,
    },
    plugins,
    devServer: {
      historyApiFallback: true,
      contentBase: './public',
      publicPath: '/',
      disableHostCheck: true,
      host: '0.0.0.0',
      port: 3000,
      inline: true,
      noInfo: false,
      stats: 'minimal',
    },
  };
};