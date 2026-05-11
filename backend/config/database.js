const mongoose = require('mongoose');
const redis = require('redis');

const isTest = process.env.NODE_ENV === 'test';

let db;
let redisClient;

if (isTest) {
  // For tests, use in-memory or mock
  db = mongoose.createConnection();
} else {
  if (!process.env.DB_URL) {
    throw new Error('Missing DB_URL environment variable');
  }
  // Assuming DB_URL is MongoDB connection string
  db = mongoose.createConnection(process.env.DB_URL);

  db.on('error', (error) => {
    console.error('MONGO CONNECTION ERROR:', error);
  });

  const redisUrl = process.env.REDIS_PASSWORD
    ? `redis://:${process.env.REDIS_PASSWORD}@localhost:6379`
    : 'redis://localhost:6379';

  redisClient = redis.createClient({ url: redisUrl });
  redisClient.on('error', (error) => {
    console.error('REDIS CLIENT ERROR:', error);
  });
  redisClient.connect().catch(console.error);
}

module.exports = {
  db,
  redisClient
};
