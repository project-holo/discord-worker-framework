const CacheConnector = require('./CacheConnector.js');
const redis = require('redis');

/**
 * Cache interface for the framework, attached to a worker by using `attach()`.
 * Allows for data from the worker to be cached, similar to how a Discord
 * library like Eris caches data for the lifetime of the process (and keeps it
 * up to date with new data).
 */
class RedisCacheConnector extends CacheConnector {
  /**
   * @see {@link https://github.com/NodeRedis/node_redis node_redis docs}
   * @param {Object|String} options Options passed to `redis.createClient`,
   * refer to `node_redis` documentation for more information.
   * @param {Object} [cacheLevel] Refer to CacheConnector for information on
   * cache levels.
   */
  constructor (options, cacheLevel) {
    super(cacheLevel);
    this._client = redis.createClient(options);
  }

  /**
   * Get method for retrieving data from Redis.
   * @private
   * @param {String} type
   * @param {String} key
   * @return {Promise<Object|null>}
   */
  __get (type, key) {
    return new Promise((resolve, reject) => {
      this._client.get(`${type}_${key}`, (err, res) => {
        if (err) return reject(err);
        if (res === null) return resolve(null);
        try {
          resolve(JSON.parse(res));
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /**
   * Get method for writing data to Redis.
   * @private
   * @param {String} type
   * @param {String} key
   * @param {Object} value
   * @return {Promise}
   */
  __write (type, key, value) {
    return new Promise((resolve, reject) => {
      this._client.set(`${type}_${key}`, JSON.stringify(value), (err, res) => {
        if (err) return reject(err);
        if (res !== 'OK') {
          return reject(new Error('not OK response from Redis'));
        }
        resolve();
      });
    });
  }

  /**
   * Get method for deleting data from Redis.
   * @private
   * @param {String} type
   * @param {String} key
   * @return {Promise}
   */
  async __delete (type, key) {
    return new Promise((resolve, reject) => {
      this._client.del(`${type}_${key}`, (err, res) => {
        if (err) return reject(err);
        if (res !== 'OK') {
          return reject(new Error('not OK response from Redis'));
        }
        resolve();
      });
    });
  }
}

module.exports = RedisCacheConnector;
