/**
 * Error to be thrown when a method was called that hasn't been implemented.
 */
class NotImplementedError extends Error {
  /**
   * @param {String} message A description of the error.
   */
  constructor (message) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
  }
}

module.exports = NotImplementedError;
