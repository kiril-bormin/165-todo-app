const router = require('express').Router();

router.post('/reset', async (req, res) => {
  try {
    const { User, Todo } = req.app.locals.models;
    await User.deleteMany({});
    await Todo.deleteMany({});
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('TEST RESET failed:', err);
    return res.status(500).json({ ok: false, error: 'reset_failed' });
  }
});

module.exports = router;
