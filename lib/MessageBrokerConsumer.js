'use strict';

const EventEmitter = require('eventemitter3');
const NotImplementedError = require('./errors/NotImplementedError.js');

module.exports =

/**
 * Message broker consumer interface for the framework, Workers attach to these
 * in order to receive events.
 */
class MessageBrokerConsumer extends EventEmitter {
  /**
   * (Connect and) start listening for events from the message broker.
   * @return {Promise}
   */
  start () {
    return new Promise((resolve, reject) => {
      reject(new NotImplementedError(
        `start() is not implemented for ${this.constructor.name}`
      ));
    });
  }

  /**
   * (Disconnect and) stop listening for events from the message broker.
   * @return {Promise}
   */
  stop () {
    return new Promise((resolve, reject) => {
      reject(new NotImplementedError(
        `stop() is not implemented for ${this.constructor.name}`
      ));
    });
  }
};
