const { env } = require('./config/env');
const { connectDb } = require('./config/db');
const { createApp } = require('./app');
const { getStorage } = require('./services/storage');

async function start() {
  await connectDb();
  await getStorage().init();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err.message);
  process.exit(1);
});
