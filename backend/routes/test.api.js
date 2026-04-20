const router = require('express').Router();
const { db } = require('../config/database');

// POST /test/reset – drop collections
// Used to reset the database between tests
router.post('/reset', async (req, res) => {
  try {
    const collections = db.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('TEST RESET failed:', err);
    return res.status(500).json({ ok: false, error: 'reset_failed' });
  }
});

module.exports = router;
