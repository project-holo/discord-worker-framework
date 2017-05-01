# Discord Worker Framework
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

A fast, light-weight framework for consuming incoming messages from
[Discord](https://discordapp.com "Discord Landing") in a multi-service fashion.

This package consumes from a message broker such as ActiveMQ or RabbitMQ, parses
and validates incoming data and emits it to be processed by the bot-specific
code.

This package also includes a `DiscordRestClient`, which can be used for sending
information to the Discord API directly or through a rate-limiting proxy.
Ratelimits are managed by default, but this can be disabled.

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
- Allows for collecting statistics via an event emitter

## Installing

```
npm install discord-worker-framework --no-optional

# Install EventEmitter3 for extra performance
npm install eventemitter3

# If you would like to use the included Redis, MQTT or AMQP adapters, make sure
# that `redis`, `mqtt` and/or `amqp.node` are installed:
npm install redis mqtt amqp.node
```

## Usage and Examples

Examples can be found in the [examples/](examples/) directory. The
[pingpong](examples/pingpong.js) demonstrates a simple ping pong bot. None of
the examples set a valid MessageBrokerConsumer, so you may need to edit files to
make them work for you.

## Incoming Event Structure

All received events from the MessageBrokerConsumer must follow a standard JSON
structure or they will cause the Worker to fail to process incoming events:

```js
{
  "type": "", // Discord event type, e.g. MESSAGE_CREATE, GUILD_CREATE
  "shard_id": 0, // shard ID which the event was received from
  "data": {} // event data, should match the structure from the Discord gateway
}
```

[project-holo/discord-gateway-client](https://github.com/project-holo/discord-gateway-client)
is a project written in Golang that sends websocket events in this structure to
a STOMP broker, and is intended for use with this framework.

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
2. Fork, clone, make changes (semistandard codestyle), push
3. PR to the `master` branch (this will change in the future)

## Testing

Tests are handled with `mocha`. You can run tests by using the `npm test`
command, assuming you've cloned this repository directly and installed
devDependencies.

### License

A copy of the MIT license can be found in [LICENSE](LICENSE).
