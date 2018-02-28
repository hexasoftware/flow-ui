var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
// var CopyWebpackPlugin = require('copy-webpack-plugin')

var outfile = 'index.js'

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '',
    filename: outfile
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader?indentedSyntax'
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            'scss': [
              'vue-style-loader',
              'css-loader',
              'sass-loader'
            ],
            'sass': [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax'
            ]
          },
          postLoaders: {
            html: 'babel-loader'
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.svg$/,
        loader: 'vue-svg-loader', // `vue-svg` for webpack 1.x
        options: {
          // optional [svgo](https://github.com/svg/svgo) options
          svgo: {
            plugins: [
              {removeDoctype: true},
              {removeComments: true}
            ]
          }
        }
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(pg|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name]-[hash].[ext]'
        }
      },
      {
        test: /\.(ttf|woff)$/,
        loader: 'file-loader',
        options: {
          name: '[name]-[hash].[ext]'
        }
      },
      {
        test: /\.md$/,
        loader: 'html-loader!highlight-loader!markdown-loader?gfm=true'
      }
      /*,
      {
        test: /\.md$/,
        use: 'raw-loader'
      } */
    ]
  },
  // plugins: [ new CopyWebpackPlugin(['src/static']) ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.vue', '*', '.js', '.json', '.jsx']
  },
  devServer: {
    host: '0.0.0.0',
    port: 8081,
    disableHostCheck: true,
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    clientLogLevel: 'none'
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'development') {
  Object.assign(module.exports, {
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, './docs'),
      // publicPath: '/vue-edi-table/',
      publicPath: '',
      filename: 'index.js'
    }
  })
  module.exports.plugins = (module.exports.plugins || []).concat([
    new HtmlWebpackPlugin({ filename: 'index.html', template: 'index.html' })
  ])
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new HtmlWebpackPlugin({filename: 'index.html', template: 'index.html'})
  ])
  // module.exports.externals = { 'vue': 'vue' }
}
