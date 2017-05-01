const NotImplementedError = require('./errors/NotImplementedError.js');

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
 * Message broker consumer interface for the framework, Workers attach to these
 * in order to receive events.
 */
class MessageBrokerConsumer extends EventEmitter {
  /**
   * (Connect and) start listening for events from the message broker.
   * @return {Promise}
   */
  async start () {
    throw new NotImplementedError(
      `start() is not implemented for ${this.constructor.name}`
    );
  }

  /**
   * (Disconnect and) stop listening for events from the message broker.
   * @return {Promise}
   */
  async stop () {
    throw new NotImplementedError(
      `stop() is not implemented for ${this.constructor.name}`
    );
  }
}

module.exports = MessageBrokerConsumer;
