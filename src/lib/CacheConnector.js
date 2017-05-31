const NotImplementedError = require('./errors/NotImplementedError.js');

/**
 * Default cache level.
 */
const defaultCacheLevel = {
  channels: true,
  guilds: true,
  members: true,
  messages: false,
  presences: false,
  roles: true,
  users: true
};

/**
 * Event emitter to use for the master server events.
 * @type EventEmitter
 */
let EventEmitter;

// Load eventemitter3 or Node.js EventEmitter if it's not available
try {
  EventEmitter = require('eventemitter3');
} catch (err) {
  EventEmitter = require('events').EventEmitter;
}

/**
 * Cache interface for the framework, attached to a worker by using `attach()`.
 * Allows for data from the worker to be cached, similar to how a Discord
 * library like Eris caches data for the lifetime of the process (and keeps it
 * up to date with new data).
 */
class CacheConnector extends EventEmitter {
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
    super();
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
   * Internal method for parsing incoming events into basic commands for the
   * cache connector.
   *
   * The return value of this function is an Object[] with `action`, `key`,
   * `type`  and `value` keys. `action` is an enumerable (0 = create or replace,
   * 1 = delete), `key` is a suitable primary key for databases (object ID),
   * `type` is a string with the object type (channel, emote, guild, member,
   * message, presence, role) and `value` is an object with the data to store.
   * If `action == 2`, the `value` key will not be present in the returned
   * object.
   * @private
   * @param {Object} e
   * @return {Promise<Object[]|null>}
   */
  async __parseEvent (e) {
    switch (e.type) {
      // TODO: READY
      case 'CHANNEL_CREATE':
      case 'CHANNEL_UPDATE':
        return [{ action: 0, key: e.data.id, type: 'channel', value: e.data }];
      case 'CHANNEL_DELETE':
        return [{ action: 1, key: e.data.id, type: 'channel' }];
      case 'GUILD_CREATE':
      case 'GUILD_UPDATE':
        return [{ action: 0, key: e.data.id, type: 'guild', value: e.data }];
      case 'GUILD_DELETE':
        return [{ action: 1, key: e.data.id, type: 'guild' }];
      case 'GUILD_MEMBER_ADD':
        return [{
          action: 0,
          key: e.data.guild_id,
          type: 'member',
          value: e.data
        }];
      case 'GUILD_MEMBER_REMOVE':
        return [{ action: 1, key: e.data.user.id, type: 'member' }];
      case 'GUILD_MEMBER_UPDATE':
        const key = `${e.data.guild_id}_${e.data.user.id}`;
        let member = null;
        try {
          member = await this.__get('member', key);
        } catch (e) {}

        // Construct fake old member object to replace missing keys
        if (!member) {
          member = {
            joined_at: '1970-01-01T00:00:00.000000+00:00',
            deaf: false,
            mute: false
          };
        }

        return [{
          action: 0,
          key: `${e.data.guild_id}_${e.data.user.id}`,
          type: 'member',
          value: {
            guild_id: e.data.guild_id,
            user: e.data.user,
            roles: e.data.roles,
            nick: e.data.nick,
            joined_at: member.joined_at,
            deaf: member.deaf,
            mute: member.mute
          }
        }];
      case 'GUILD_MEMBERS_CHUNK':
        return e.data.members.map(m => {
          return {
            action: 0,
            key: `${e.data.guild_id}_${m.id}`,
            type: 'member',
            value: m
          };
        });
      case 'GUILD_ROLE_CREATE':
      case 'GUILD_ROLE_UPDATE':
        e.data.role.guild_id = e.data.guild_id;
        return [{
          action: 0,
          key: e.data.role.id,
          type: 'role',
          value: e.data
        }];
      case 'GUILD_ROLE_DELETE':
        return [{ action: 1, key: e.data.role_id, type: 'role' }];
      // TODO: MESSAGE_*
      // TODO: MESSAGE_DELETE_BULK
      case 'PRESENCE_UPDATE':
        e.data.user = { id: e.data.user.id };
        return [{
          action: 0,
          key: `${e.data.guild_id}_${e.data.user.id}`,
          type: 'presence',
          value: e.data
        }];
      case 'USER_UPDATE':
        return [{ action: 0, key: e.data.id, type: 'user', value: e.data }];
      // TODO: VOICE_STATE_UPDATE
      // case 'VOICE_STATE_UPDATE':
      //   return {
      //     action: 0,
      //     key: e.data.?,
      //     type: 'voicestate',
      //     value: e.data
      //   };
    }
    return [];
  }

  /**
   * Internal method for processing incoming events.
   * @private
   * @param {Object} event
   */
  async __process (event) {
    const actions = await this.__parseEvent(event);

    // Commit actions to cache
    // TODO: catch errors and retry failed actions
    for (let a of actions) {
      if (!this._cacheLevel[a.type + 's']) continue;
      switch (a.action) {
        case 0:
          await this.__write(a.type, a.key, a.value);
          break;
        case 1:
          await this.__delete(a.type, a.key);
          break;
      }
    }
  }

  // TODO: getChannel(id), getGuild(id), getMember(guild_id, user_id), ...

  /**
   * Get method for retrieving data from the cache.
   * @private
   * @param {String} type
   * @param {String} key
   * @return {Promise<Object|null>}
   */
  async __get (type, key) {
    throw new NotImplementedError(
      `__get() is not implemented for ${this.constructor.name}`
    );
  }

  /**
   * Get method for writing data to the cache.
   * @private
   * @param {String} type
   * @param {String} key
   * @param {Object} value
   * @return {Promise}
   */
  async __write (type, key, value) {
    throw new NotImplementedError(
      `__write() is not implemented for ${this.constructor.name}`
    );
  }

  /**
   * Get method for deleting data from the cache.
   * @private
   * @param {String} type
   * @param {String} key
   * @return {Promise}
   */
  async __delete (type, key) {
    throw new NotImplementedError(
      `__delete() is not implemented for ${this.constructor.name}`
    );
  }
}

module.exports = CacheConnector;

// Expose defaultCacheLevel
module.exports.defaultCacheLevel = defaultCacheLevel;
