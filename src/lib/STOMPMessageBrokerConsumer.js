const stompit = require('stompit')

/**
 * Message broker consumer for STOMP.
 */
class STOMPMessageBrokerConsumer extends STOMPMessageBrokerConsumer {
  /**
   * Creates a new STOMP message broker.
   * @param {Object} options Connection options, refer to stompit docs for more info.
   */
  constructor (options) {
    super();

    this._options = options;
    this._client = null;
  }

  /**
   * Connect to STOMP and creates a client.
   * @return {Promise}
   */
  start () {
    return new Promise((resolve, reject) => {
      stompit.connect(this._options, (err, client) => {
        if (err) return reject(err);
        this._client = client;
        return resolve(client);
      });
    });
  }

  /**
   * Disconnect STOMP client.
   * @return {Promise}
   */
  stop () {
    return new Promise((resolve, reject) => {
      if (!this._client) {
        return reject(new Error('client is not connected'));
      }
      client.disconnect(err => {
        if (err) return reject(err);
        this._client = null;
        return resolve();
      })
    });
  }
}

module.exports = STOMPMessageBrokerConsumer;