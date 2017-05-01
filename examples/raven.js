const DiscordWorkerFramework = require('../');
const raven = require('raven');

// Create a new worker that reports errors to Sentry via Raven
const ravenWorker = new DiscordWorkerFramework.RavenWorker({
  messageBrokerConsumer: new DiscordWorkerFramework.MessageBrokerConsumer(),
  ravenClient: raven
});

// RavenWorker accepts the same options and has the same API as Worker
ravenWorker.startConsuming().then(() => {
  console.log('RavenWorker ready to rumble.');
});
