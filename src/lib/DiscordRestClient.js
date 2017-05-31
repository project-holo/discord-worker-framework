const FormData = require('form-data');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

/**
 * DiscordRestClient makes requests to the Discord API or a compatible API.
 */
class DiscordRestClient {
  /**
   * @param {Object} options
   * @param {String} options.token Discord token to use for requests.
   * @param {String} [options.endpoint] API endpoint prefix to use for requests,
   * in the format `https?://hostname(/route)`. All API requests will be
   * prefixed with this. Defaults to `https://discordapp.com/api`.
   * @param {Boolean} [options.enableRatelimits=true] Whether or not to honour
   * ratelimits imposed by Discord.
   */
  constructor ({ token, endpoint, enableRatelimits }) {
    if (typeof token !== 'string') {
      throw new Error('token is not a string');
    }
    this._token = token;

    this.endpoint = typeof endpoint !== 'string' ? 'https://discordapp.com/api'
      : endpoint;

    // TODO: implement ratelimits
    this._enableRatelimits = !!enableRatelimits;
  }

  /**
   * @return {String}
   */
  get endpoint () {
    return this._endpoint;
  }

  /**
   * @param {String} value
   */
  set endpoint (value) {
    this._endpoint = value;

    const urlObject = url.parse(this._endpoint);
    urlObject.secure = urlObject.protocol === 'https:';
    if (urlObject.pathname.length === 1) {
      urlObject.pathname = '';
    }
    if (urlObject.pathname.substr(-1) === '/') {
      urlObject.pathname =
        urlObject.pathname.substr(0, urlObject.pathname.length - 1);
    }
    this._endpointParsed = urlObject;
  }

  /**
   * Make a request to the API.
   * @param {String} method Request verb: "GET", "POST", "PUT" or "DELETE".
   * @param {String} route Route ending added to end of `endpoint` supplied in
   * the constructor, should start with a `/`.
   * @param {String|Buffer|stream.Readable} [body] Request body.
   * @param {String} [contentType] Request `Content-Type` header value.
   * @return {Promise<http.IncomingMessage>}
   */
  makeRequest (method, route, body, contentType) {
    return new Promise((resolve, reject) => {
      const req = (this._endpointParsed.secure ? https : http).request({
        host: this._endpointParsed.hostname,
        port: this._endpointParsed.port, // Node.js will set default value
        method: method,
        path: this._endpointParsed.pathname + route,
        headers: {
          Authorization: this._token
        }
      }, resolve);

      if (typeof contentType === 'string') {
        req.setHeader('Content-Type', contentType);
      }
      if (typeof body.pipe === 'function') {
        body.pipe(req);
      } else {
        req.end(body);
      }
    });
  }

  /**
   * Collect request response bytes and return as string.
   * @param {http.IncomingMessage} res
   * @return {Promise<String>}
   */
  collectResponse (res) {
    return new Promise((resolve, reject) => {
      let data = [];
      res.setEncoding('utf8');
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        data = data.join('');
        resolve(data);
      });
      res.on('error', reject);
    });
  }

  /**
   * Create a message in the specified channel.
   * @param {String} channelID Channel ID to send message to. Remember, direct
   * message channels have their own ID (not the recipient ID).
   * @param {Object|String} content If string, value is used as
   * `content.content`. At least one of the properties of this object is
   * required.
   * @param {String} [content.content=""] Message text content.
   * @param {Object} [content.embed] Message embed object, described in Discord
   * API documentation.
   * @param {Object} [content.file] File object.
   * @param {Buffer|ReadableStream|String} content.file.file File bytes as
   * Buffer or ReadableStream, or path to file as string.
   * @param {String} [content.file.filename="upload"] File name.
   * @param {String} [content.file.contentType] File Content-Type.
   * @param {Object} [options]
   * @param {Boolean} [options.tts] Send as TTS message.
   * @return {Promise<external."Discord.Message">}
   */
  async createMessage (channelID, content, options) {
    if (typeof channelID !== 'string') {
      throw new Error('channelID must be a string');
    }
    const ENDPOINT = `/channels/${channelID}/messages`;
    if (typeof content === 'string') {
      content = { content };
    }
    if (typeof content !== 'object' || content === null) {
      throw new Error('content must be a string or an object');
    }
    if (typeof options !== 'object' || options === null) {
      options = {};
    }

    // Validate input
    if (typeof content.content !== 'string') {
      if (typeof content.content === 'undefined') {
        content.content = '';
      }
      // Safely convert content to string
      content.content = content.content + '';
    }
    if (typeof content.embed !== 'object' || content.embed === null) {
      content.embed = null;
    }
    if (typeof content.file !== 'object' || content.file === null) {
      content.file = null;
    } else {
      if (typeof content.file.file === 'string') {
        content.file.file = fs.createReadStream(content.file.file);
      }
      if (!(content.file.file !== undefined || content.file.file !== null ||
        Buffer.isBuffer(content.file.file) ||
        typeof content.file.file.pipe === 'function')) {
        throw new Error('content.file.file is not a Buffer or ReadableStream');
      }

      if (typeof content.file.filename !== 'string' ||
        content.file.filename.length === 0) {
        content.file.filename = 'upload';
      }
      content.file.filename.replace(/[^a-z0-9_.-]/g, '_');
    }
    options.tts = !!options.tts;

    // Check that content has at least one of the properties
    if (!(content.content || content.embed || content.file)) {
      throw new Error('at least one property on content is required');
    }

    // Create payload object (minus file)
    const payload = {};
    if (content.content) payload.content = content.content;
    if (content.embed) payload.embed = content.embed;
    if (options.tts) payload.tts = true;

    // Create request, multipart/form-data for file uploads and application/json
    // for all other requests
    let res;
    if (typeof content.file === 'object' && content.file !== null) {
      const form = new FormData();
      form.append('payload_json', encodeURIComponent(JSON.stringify(payload)));
      form.append('file', content.file.file, {
        header: `\r\n--${form.getBoundary()}\r\nContent-Disposition: ` +
          `form-data; name="file"; filename="${content.file.filename}"` +
          (content.file.contentType ? '\r\nContent-Type: ' +
            content.file.contentType : '') + '\r\n\r\n'
      });
      res = await this.makeRequest(
        'POST', ENDPOINT, form,
        `multipart/form-data; boundary=${form.getBoundary()}`
      );
    } else {
      res = await this.makeRequest(
        'POST', ENDPOINT, JSON.stringify(payload),
        'application/json; charset=utf-8'
      );
    }

    // Validate response
    let resBody = await this.collectResponse(res);
    resBody = JSON.parse(resBody);
    if (res.statusCode !== 200) {
      if ('code' in resBody && 'message' in resBody) {
        throw new Error(
          'API returned unexpected status code ' + res.statusCode +
          `(expected 200) with error: "${resBody.code}: ${resBody.message}"`
        );
      } else {
        throw new Error(
          'API returned unexpected status code ' + res.statusCode +
          '(expected 200) with no error object'
        );
      }
    }
    return resBody;
  }

  // TODO: the rest of the Discord API methods
  // TODO: reusable validation methods?
  // TODO: reusable error checking methods?
  // TODO: discuss whether structs for incoming data are worth it
}

module.exports = DiscordRestClient;
