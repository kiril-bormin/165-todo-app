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

  redisClient = redis.createClient({
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD
  });
  redisClient.connect().catch(console.error);
}

module.exports = {
  db,
  redisClient
};
