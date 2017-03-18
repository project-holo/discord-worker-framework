'use strict';

const OptionsError = require('./errors/OptionsError.js');
const RavenClient = require('raven').Client;
const Worker = require('./Worker.js');

module.exports =

/**
 * An almost identical interface to Worker, with the same purpose, but wraps all
 * methods with a user-supplied Raven client. Raven allows for sending real-time
 * error information to a cloud or self-hosted Sentry server.
 * @see {@link https://docs.sentry.io/clients/node raven-node documentation}
 */
class RavenWorker extends Worker {
  /**
   * Refer to Worker documentation, as a RavenWorker implements almost the
   * exact same interface but with methods that use Raven for error reporting.
   * @param {Object} options
   * @param {external.Raven} options.ravenClient `raven-node` client to use
   * for tracking caught exceptions. Raven will not catch uncaught exceptions
   * unless you have configured Raven to do so. This is useful for finding bugs
   * and other issues in the bot/framework implementation.
   */
  constructor (options) {
    super(options);

    if (!(options.ravenClient instanceof RavenClient)) {
      throw new OptionsError('ravenClient', 'not instance of Raven.Client');
    }
    this._ravenClient = options.ravenClient;
  }

  // TODO: the rest of these methods...
};
