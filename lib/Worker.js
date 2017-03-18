'use strict';

const EventEmitter = require('eventemitter3');
const MessageBrokerConsumer = require('./MessageBrokerConsumer.js');
const OptionsError = require('./errors/OptionsError.js');

/**
 * @callback preEventProcessHook
 * @param {Object} data Parsed JSON object of the raw event data.
 * @return {Object|Promise<Object>} Return data when finished with it
 * synchronously or in a promise.
 */

module.exports =

/**
 * Worker interface for the framework, manages a connection to a message broker
 * and processes incoming events.
 */
class Worker extends EventEmitter {
  /**
   * Create a new Worker. A Worker consumes messages in real-time from a message
   * broker in a specific format outlined in the README. A Worker exposes an
   * EventEmitter interface that can be used to process events that have been
   * consumed from the message broker and processed internally by the framework.
   *
   * Ideally accompanied by a `RestClient` to manage calls to the Discord API,
   * even through a ratelimit-managing proxy.
   *
   * @param {Object} options Startup options for the Worker, some of these
   * options can be changed after instantiation using the `setOptions()` method.
   * @param {MessageBrokerConsumer} options.messageBrokerConsumer
   * MessageBrokerConsumer to receive incoming events from. Messages that are
   * consumed must be in the format outlined in the README, or the framework/bot
   * implementation may fail.
   * @param {String[]} [options.ignoredEvents] Events to be ignored and not
   * processed by the worker (e.g. `TYPING_START`). Ideally this should be
   * handled at the gateway intake level.
   * @param {preEventProcessHook} [options.preEventProcessHook] Function to call
   * with data when events are received. Allows for mutating objects before they
   * are processed internally and raw logging. All events will be passed to this
   * function, even if they are in `options.ignoredEvents`.
   * @param {Boolean} [options.verifyData=true] Checks all incoming data using a
   * schema for each event type to ensure that it is consistent with other data
   * (and to prevent errors).
   */
  constructor (options) {
    super();

    if (!(options.messageBrokerConsumer instanceof MessageBrokerConsumer)) {
      throw new OptionsError(
        'messageBrokerConsumer', 'not instance of MessageBrokerConsumer'
      );
    }
    this._messageBrokerConsumer = options.messageBrokerConsumer;
    if (options.ignoredEvents) {
      if (!Array.isArray(options.ignoredEvents)) {
        throw new OptionsError('ignoredEvents', 'not an array');
      }
      this._ignoredEvents = options.ignoredEvents;
    } else this._ignoredEvents = [];
    if (options.preEventProcessHook) {
      if (typeof options.preEventProcessHook !== 'function') {
        throw new OptionsError('preEventProcessHook', 'not a function');
      }
      this._preEventProcessHook = options.preEventProcessHook;
    }
    this._verifyData = !!options.verifyData;

    // Attach to MessageBrokerConsumer
    this._messageBrokerConsumer.on('message', this.__receiveEvent.bind(this));
  }

  /**
   * @return {Boolean} Consuming status of the underlying MessageBrokerConsumer.
   */
  get consuming () {
    return this._messageBrokerConsumer.active;
  }

  /**
   * Instructs the MessageBrokerConsumer provided in the constructor to connect
   * to the broker and begin consuming messages. As soon as a connection is
   * established, the Worker will process events.
   * @return {Promise} Passthrough of the promise from the `start()` method on
   * the MessageBrokerConsumer.
   */
  startConsuming () {
    return new Promise((resolve, reject) => {
      if (this._messageBrokerConsumer.active) {
        return reject(new Error('MessageBrokerConsumer is already active'));
      }
      this._messageBrokerConsumer.start().then(resolve).catch(reject);
    });
  }

  /**
   * Instructs the MessageBrokerConsumer provided in the constructor to
   * disconnect from the broker and stop consuming messages.
   * @return {Promise} Passthrough of the promise from the `stop()` method on
   * the MessageBrokerConsumer.
   */
  stopConsuming () {
    return new Promise((resolve, reject) => {
      if (!this._messageBrokerConsumer.active) {
        return reject(new Error('MessageBrokerConsumer is not active'));
      }
      this._messageBrokerConsumer.stop().then(resolve).catch(reject);
    });
  }

  /**
   * Internal method to receive events from the MessageBrokerConsumer.
   * @param {Object} data Raw event data in the format defined in the README.
   */
  __receiveEvent (data) {
    this.emit('event:recv', data);

    // Ignored event types
    if (this._ignoredEvents.includes(data.type)) return;

    // TODO: implement event:tested and verifyData
    // TODO: implement preEventProcessHook

    // Dispatch event to listeners
    this.emit('event:dispatch', data);
    this.emit(`discord:${data.type}`, data);
  }
};
