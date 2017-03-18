'use strict';

/**
 * Error to be thrown when a method was called that hasn't been implemented.
 * @param {String} message A description of the error
 */
function NotImplementedError (message) {
  const error = Error.call(this, message);
  this.name = 'NotImplementedError';
  this.message = error.message;
  this.stack = error.stack;
}

NotImplementedError.prototype = Object.create(Error.prototype);
NotImplementedError.prototype.constructor = NotImplementedError;

// Expose NotImplementedError
module.exports = NotImplementedError;
