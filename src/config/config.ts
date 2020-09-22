var path = require('path');
var extend = require('util')._extend;

var development = require('./env/development');
var production = require('./env/production');
var local = require('./env/local');

var defaults = {
  root: path.normalize(__dirname + '/..')
};

module.exports = {

  // local configuration
  config: extend(local, defaults)

  // development configuration
  // config: extend(development, defaults)

  // production configuration
  // config: extend(production, defaults)
}
