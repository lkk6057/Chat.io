const path = require('path');

module.exports = {

    entry: './src/client/index.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
      },
            {
                test: /\.txt$/i,
                use: 'raw-loader',
      },
    ],
    },
    mode: 'production'
};
