## TODO

#### General

- [ ] Remove the note in README.md when the package major version hits `1`

#### Functionality

- [ ] Make it all work
- [ ] Add DiscordRestClient
    - [ ] Add all routes
    - [ ] Add ratelimiting support
- [ ] Add bundled CacheConnectors
    - [ ] RedisCacheConnector
- [ ] Add bundled MessageBrokerConsumers
    - [ ] AMQPMessageBrokerConsumer
    - [ ] STOMPMessageBrokerConsumer

#### Documentation

- [ ] Setup a CI task to compile documentation onto a GitHub pages site

#### Examples

- [ ] Write examples
    - [x] Basic ping pong example
    - [ ] Caching example
        - [ ] Add RedisCacheConnector example
    - [x] Raven worker example
    - [x] DiscordRestClient example
    - [ ] Examples for each bundled MessageBrokerConsumer
        - [ ] AMQPMessageBrokerConsumer
        - [ ] STOMPMessageBrokerConsumer

#### Tests

- [ ] Pick a CI
- [ ] Write tests
    - [ ] CacheConnector
        - [ ] RedisCacheConnector
    - [ ] DiscordRestClient
    - [ ] MessageBrokerConsumer
        - [ ] AMQPMessageBrokerConsumer
        - [ ] STOMPMessageBrokerConsumer
    - [ ] RavenWorker
    - [ ] Worker
- [ ] Achieve 100% coverage
