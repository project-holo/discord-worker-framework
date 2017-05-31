const DiscordWorkerFramework = require('../');

// Create a new Worker
const worker = new DiscordWorkerFramework.Worker({
  messageBrokerConsumer: new DiscordWorkerFramework.MessageBrokerConsumer()
});

// Create a new cache connector that will only cache guilds and roles
const cache = new DiscordWorkerFramework.CacheConnector({
  channels: false,
  guilds: true,
  members: false,
  messages: false,
  presences: false,
  roles: true,
  users: false
});

// Attach the worker to the cache connector, so incoming events get cached
cache.attach(worker);
// cache.attach(worker2);
// cache.attach(worker3);

// Access information from the cache
cache.getGuild('296921987190620160').then(guild => {
  if (!guild) {
    // Guild isn't in cache, you should get it from the API here
    return console.log('example 1: guild not in cache');
  }
  console.log(`example 1: guild.name == ${guild.name}`);
});

// Detach the worker from the cache connector (if needed)
cache.detach(worker);
