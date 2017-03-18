'use strict';

/**
 * Configuration/options error to be thrown when configuration for a Worker or
 * similar interface is invalid.
 * @param {String} key The name of the key/variable that was misconfigured by
 * the user.
 * @param {String} message A description of the misconfiguration involving
 * `key`.
 */
function OptionsError (key, message) {
  const msg = `bad option "${key}": ${message}`;
  const error = Error.call(this, msg);
  this.name = 'OptionsError';
  this.message = error.message;
  this.stack = error.stack;
}

OptionsError.prototype = Object.create(Error.prototype);
OptionsError.prototype.constructor = OptionsError;

// Expose OptionsError
module.exports = OptionsError;
