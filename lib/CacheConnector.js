'use strict';

const NotImplementedError = require('./errors/NotImplementedError.js');

/**
 * Default cache level.
 */
const defaultCacheLevel = {
  channels: true,
  emotes: false,
  guilds: true,
  members: true,
  messages: false,
  persona: false,
  roles: true
};

module.exports =

/**
 * Cache interface for the framework, attached to a worker by using `attach()`.
 * Allows for data from the worker to be cached, similar to how a Discord
 * library like Eris caches data for the lifetime of the process (and keeps it
 * up to date with new data).
 */
class CacheConnector {
  /**
   * Create a new CacheConnector. A CacheConnector stores and retrieves data
   * from a datastore, like a database or an in-memory database. Data is stored
   * automatically by a Worker when a CacheConnector is supplied to one, but
   * data can be stored manually by the user using the store methods.
   * @param {Object} [cacheLevel] An object to define a custom cache level. A
   * cache level defines what data will be cached and what data will be ignored.
   * If not supplied, falls back to a default cacheLevel object. More
   * documentation about the `cacheLevel` can be found in the README.
   */
  constructor (cacheLevel) {
    if (typeof cacheLevel === 'object') {
      this._cacheLevel = cacheLevel;
    } else {
      this._cacheLevel = defaultCacheLevel;
    }

    this.__processBound = this.__process.bind(this);
  }

  /**
   * Attach listeners to a Worker for cache collection.
   * @param {Worker} worker Worker to attach to. Multiple workers can be
   * attached to one CacheConnector, but this needs to be done in seperate
   * `attach()` calls.
   */
  attach (worker) {
    worker.on('event:dispatch', this.__processBound);
  }

  /**
   * Detach listeners from a Worker.
   * @param {Worker} worker Worker to detach from.
   */
  detach (worker) {
    worker.off('event:dispatch', this.__processBound);
  }

  /**
   * Internal method for processing incoming events.
   * @param {Object} event
   */
  __process (event) {
    throw new NotImplementedError(
      `__process() is not implemented for ${this.constructor.name}`
    );
  }
};

// Expose defaultCacheLevel
module.exports.defaultCacheLevel = defaultCacheLevel;
