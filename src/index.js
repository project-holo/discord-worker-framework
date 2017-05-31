exports.CacheConnector = require('./lib/CacheConnector.js');
exports.DiscordRestClient = require('./lib/DiscordRestClient.js');
exports.Worker = require('./lib/Worker.js');

try {
  require('raven');
  exports.RavenWorker = require('./lib/RavenWorker.js');
} catch (e) {}

try {
  require('redis');
  exports.RedisCacheConnector = require('./lib/RedisCacheConnector.js');
} catch (e) {}
