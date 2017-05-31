const CacheConnector = require('./CacheConnector.js');

/**
 * Memory-based cache interface for the framework. Not recommended unless only
 * deploying one worker node.
 */
class MemoryCacheConnector extends CacheConnector {
  /**
   * @param {Object} [cacheLevel] Refer to CacheConnector for information on
   * cache levels.
   */
  constructor (cacheLevel) {
    super(cacheLevel);
    this._cache = {};
  }

  /**
   * Get method for retrieving data from Redis.
   * @private
   * @param {String} type
   * @param {String} key
   * @return {Promise<Object|null>}
   */
  async __get (type, key) {
    if (!this._cache[type]) return null;
    return this._cache[type].get(key) || null;
  }

  /**
   * Get method for writing data to Redis.
   * @private
   * @param {String} type
   * @param {String} key
   * @param {Object} value
   * @return {Promise}
   */
  async __write (type, key, value) {
    if (!this._cache[type]) this._cache[type] = new Map();
    this._cache[type].set(key, value);
  }

  /**
   * Get method for deleting data from Redis.
   * @private
   * @param {String} type
   * @param {String} key
   * @return {Promise}
   */
  async __delete (type, key) {
    if (!this._cache[type]) return;
    this._cache[type].delete(key);
  }
}

module.exports = MemoryCacheConnector;
