'use strict';

const path = require('path'),
      slsw = require('serverless-webpack'),
      webpack = require('webpack');

module.exports = {
   entry: slsw.lib.entries,
   output: {
      libraryTarget: 'commonjs',
      path: path.join(slsw.lib.serverless.config.servicePath, '.webpack'),
      filename: '[name].js',
   },
   resolve: {
      extensions: [ '.ts', '.js' ],
   },

   module: {
      rules: [
         {
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
               configFile: 'tsconfig.commonjs.json',
            },
         },
      ],
   },

   devtool: 'inline-source-map',

   externals: [
      'aws-sdk',
      '@silvermine/apigateway-utils', // Has dynamic requires
   ],
   target: 'node',
   mode: 'none',
   node: {
      __dirname: true,
   },
   plugins: [
      new webpack.BannerPlugin({
         banner: 'require(\'source-map-support\').install();',
         raw: true,
         entryOnly: false,
      }),
   ],
};
