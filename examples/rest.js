const DiscordWorkerFramework = require('../');

// Create a new DiscordRestClient for sending requests to the Discord API
const restClient = new DiscordWorkerFramework.DiscordRestClient({
  token: 'INSERT TOKEN HERE' // Discord token
});

// ...or create a custom one pointing at your own proxy
// eslint-disable-next-line no-unused-vars
const customRestClient = new DiscordWorkerFramework.DiscordRestClient({
  token: 'INSERT TOKEN HERE',

  // Disable ratelimit enforcement (useful for custom ratelimiting proxies)
  enableRatelimits: false,

  // Custom API endpoint, defaults to https://discordapp.com/api/
  endpoint: 'http://discord-proxy-prod:8080/'
});

// Create a message with a content, an embed and a file
restClient.createMessage('255714177669136384', {
  content: 'Hello world!',
  embed: {
    description: 'Hello world!'
  },
  file: {
    file: Buffer.from('Hello world!', 'utf8'),
    filename: 'hello-world.txt',
    contentType: 'text/plain'
  }
}).then(msg => {
  console.log(`message ID example 1: ${msg.id}`);
});

// ...or just send a normal text-only message
restClient.createMessage('255714177669136384', 'Hello world!').then(msg => {
  console.log(`message ID example 2: ${msg.id}`);
});

// Check the documentation for details on other Discord API methods
