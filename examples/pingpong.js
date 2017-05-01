const DiscordWorkerFramework = require('../');

// Create a MessageBrokerConsumer, check documentation for specifics
const consumer = new DiscordWorkerFramework.MessageBrokerConsumer();

// Create a new Worker
const worker = new DiscordWorkerFramework.Worker({
  messageBrokerConsumer: consumer
});

// Create a new DiscordRestClient for sending requests to the Discord API
const restClient = new DiscordWorkerFramework.DiscordRestClient({
  token: 'INSERT TOKEN HERE',
  enableRatelimits: true
});

// Listen for new messages and respond to "ping"
worker.on('discord:MESSAGE_CREATE', e => {
  if (e.data.content === 'ping') {
    restClient.createMessage(e.data.channel_id, 'pong!');
  }
});

// Start consuming messages from the broker
worker.startConsuming().then(() => {
  console.log('Ready to rumble!');
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});
