# Discord Worker Framework
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

A fast, light-weight framework for consuming incoming messages from
[Discord](https://discordapp.com "Discord Landing") in a multi-service fashion.

This package consumes from a message broker such as ActiveMQ or RabbitMQ, parses
and validates incoming data and emits it to be processed by the bot-specific
code.

This package also incorporates a `RestClient`, which can be used for sending
information to the Discord API directly or through a rate-limiting proxy. 
Ratelimits aren't currently managed by the `RestClient`.

## NOTE: THIS PACKAGE MAY BREAK AT ANY TIME
This package follows semver, and the major version is `0`. This means that
breaking changes can be introduced in any update. Do not use this in production
unless you know what you are doing.

## Features
- Fast
- Low-level
- Customizable
- Connects to any message broker (adapters are included for MQTT and AMQP)
- Allows for caching (included adapter available for Redis)
- Allows for collecting statistics via EventEmitter3

## TODO
- [ ] Move documentation to some webviewer
- [ ] Move usage to `examples/` directory and write more examples
- [ ] Remove the note above when the package major version hits `1`
- [ ] Write tests

## Installing
```
npm install discord-worker-framework --no-optional
```

If you would like to use the included Redis, MQTT or AMQP adapters, make sure
that `redis`, `mqtt` and/or `amqp.node` are installed:
```
npm install redis mqtt amqp.node
```

## Usage
```js
'use strict';

const DiscordWorkerFramework = require('discord-worker-framework');
const raven = require('raven'); // optional, for RavenWorker only

// Create a MessageBrokerConsumer, check documentation for specifics
const consumer = new DiscordWorkerFramework.MessageBrokerConsumer;

// Create a new Worker
const worker = new DiscordWorkerFramework.Worker({
  messageBrokerConsumer: consumer
});

// Create a new RestClient
const RestClient = new DiscordWorkerFramework.RestClient({
  endpoint: 'http://localhost:8000',
  // authorization: 'value of Authorization header for the endpoint'
});

// ...or a RavenWorker (RavenWorker allows for reporting errors/warnings to
// Sentry)
/*
const worker = new DiscordWorkerFramework.RavenWorker({
  messageBrokerConsumer: consumer,
  ravenClient: raven
});
*/

// Listen for new messages and respond to pings
worker.on('discord:MESSAGE_CREATE', e => {
  if (e.data.content === 'ping') {
    RestClient.createMessage(e.data.channel_id, 'pong!');
  }
});

// Listen for deleted messages and log them... for reasons
worker.on('discord:MESSAGE_DELETE', e => {
  console.log(`[MESSAGE_DELETE] ${e.data.author.username}: ${e.data.content}`);
});

// Start consuming
worker.startConsuming().then(() => {
  console.log('Ready to rumble!');
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});

```

## Incoming Event Structure
All received events from the MessageBrokerConsumer must follow a standard
structure or they will cause the Worker to fail to process incoming events:

```json
{
  "type": "", // Discord event type, e.g. MESSAGE_CREATE, GUILD_CREATE
  "shard_id": 0, // shard ID which the event was received from
  "data": {} // event data, should match the structure from the Discord gateway
}
```

## Events
The Worker currently emits the following events:
- `discord:*`: Discord events, see example above
- `event:recv`: emitted when any event is received, with the data
- `event:tested`: emitted when any event has been verified to match the event
  structure schema (with result)
- `event:dispatch`: emitted when any event is broadcasted to listener 
  (`discord:*`), with the data

## Contributing
1. Discuss major changes you wish to propose by creating an issue first
2. Fork, clone, checkout `develop`, make changes (semistandard codestyle), push
3. PR to the `develop` branch

## Testing
Tests are handled with `mocha`. You can run tests by using the `npm test`
command, assuming you've cloned this repository directly and installed 
devDependencies.

### License
A copy of the MIT license can be found in `LICENSE`.
