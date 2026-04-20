process.env.NODE_ENV = 'test';
const { db } = require('../config/database');
const { initModels } = require('../models');

beforeAll(async () => {
  global.models = initModels(db);
  // For test, assume connection is ready
});

beforeEach(async () => {
  // Drop collections
  const collections = Object.values(global.models);
  await Promise.all(collections.map((model) => model.deleteMany({})));
});
