## TODO

#### General

- [ ] Remove the note in README.md when the package major version hits `1`

#### Functionality

- [ ] Make it all work
- [ ] Add DiscordRestClient
    - [ ] Add all routes
    - [ ] Add ratelimiting support
- [x] Add bundled CacheConnectors
    - [x] MemoryCacheConnector
    - [x] RedisCacheConnector
- [ ] Add bundled MessageBrokerConsumers
    - [ ] AMQPMessageBrokerConsumer
    - [ ] STOMPMessageBrokerConsumer

#### Documentation

- [ ] Setup a CI task to compile documentation onto a GitHub pages site

#### Examples

- [ ] Write examples
    - [x] Basic ping pong example
    - [x] Caching example
    - [x] Raven worker example
    - [x] DiscordRestClient example
    - [ ] Examples for each bundled MessageBrokerConsumer
        - [ ] AMQPMessageBrokerConsumer
        - [ ] STOMPMessageBrokerConsumer

#### Tests

- [ ] Pick a CI
    - CircleCI
    - Travis CI
- [ ] Write tests
    - [ ] CacheConnector
        - [ ] MemoryCacheConnector
        - [ ] RedisCacheConnector
    - [ ] DiscordRestClient
    - [ ] MessageBrokerConsumer
        - [ ] AMQPMessageBrokerConsumer
        - [ ] STOMPMessageBrokerConsumer
    - [ ] RavenWorker
    - [ ] Worker
- [ ] Achieve 100% coverage
