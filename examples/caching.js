const DiscordWorkerFramework = require('../');

// Create a new Worker
const worker = new DiscordWorkerFramework.Worker({
  messageBrokerConsumer: new DiscordWorkerFramework.MessageBrokerConsumer()
});

// Create a new cache connector that will only cache guilds and roles
const cache = new DiscordWorkerFramework.CacheConnector({
  channels: false,
  emotes: false,
  guilds: true,
  members: false,
  messages: false,
  persona: false,
  roles: true
});

// Attach the worker to the cache connector, so incoming events get cached
cache.attach(worker);
// cache.attach(worker2);
// cache.attach(worker3);

// Access information from the cache
cache.getGuild('296921987190620160').then(guild => {
  if (!guild) {
    // Guild isn't in cache, you should get it from the API here
  }
  console.log(`guild name example 1: ${guild.name}`);
});

// Detach the worker from the cache connector (if needed)
cache.detach(worker);
