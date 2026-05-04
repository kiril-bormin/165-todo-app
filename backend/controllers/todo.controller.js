const canUseRedis = (redisClient) => Boolean(redisClient && redisClient.isReady);

const safeRedisGet = async (redisClient, key) => {
  if (!canUseRedis(redisClient)) return null;
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.warn('REDIS GET ERROR:', error);
    return null;
  }
};

const safeRedisSet = async (redisClient, key, value, ttlSeconds) => {
  if (!canUseRedis(redisClient)) return;
  try {
    await redisClient.setEx(key, ttlSeconds, value);
  } catch (error) {
    console.warn('REDIS SET ERROR:', error);
  }
};

const safeRedisDel = async (redisClient, key) => {
  if (!canUseRedis(redisClient)) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    console.warn('REDIS DEL ERROR:', error);
  }
};

const TodoController = {
  createTodo: async (req, res) => {
    const user_id = req.sub;
    const { text, date } = req.body;
    const { Todo } = req.app.locals.models;
    const redisClient = req.app.locals.redisClient;

    try {
      const todo = new Todo({
        text: text,
        date: date,
        completed: false,
        user_id: user_id
      });
      const result = await todo.save();

      // Invalidate cache
      await safeRedisDel(redisClient, `todos:${user_id}`);

      return res.status(201).json(result);
    } catch (error) {
      console.error('ADD TODO: ', error);
      return res.status(500);
    }
  },
  getAllTodo: async (req, res) => {
    const user_id = req.sub;
    const { Todo } = req.app.locals.models;
    const redisClient = req.app.locals.redisClient;

    try {
      const cacheKey = `todos:${user_id}`;
      const cached = await safeRedisGet(redisClient, cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const result = await Todo.find({ user_id: user_id }).sort({ date: 1 }).select('-user_id');
      if (result) {
        await safeRedisSet(redisClient, cacheKey, JSON.stringify(result), 300);
        return res.status(200).json(result);
      } else {
        return res.status(404);
      }
    } catch (error) {
      console.error('GET ALL TODO: ', error);
      return res.status(500);
    }
  },
  editTodo: async (req, res) => {
    const user_id = req.sub;
    const todo_id = req.params.id;
    const data = req.body;
    const { Todo } = req.app.locals.models;
    const redisClient = req.app.locals.redisClient;

    try {
      const todo = await Todo.findOne({ _id: todo_id, user_id: user_id });
      if (todo) {
        if (data.completed !== undefined) {
          todo.completed = data.completed;
        }
        todo.text = data.text || todo.text;
        todo.date = data.date || todo.date;
        await todo.save();

        // Invalidate cache
        await safeRedisDel(redisClient, `todos:${user_id}`);

        return res.status(200).json(todo);
      } else {
        return res.status(404);
      }
    } catch (error) {
      console.error('UPDATE TODO: ', error);
      return res.status(500);
    }
  },
  deleteTodo: async (req, res) => {
    const user_id = req.sub;
    const todo_id = req.params.id;
    const { Todo } = req.app.locals.models;
    const redisClient = req.app.locals.redisClient;

    try {
      const deletedTodo = await Todo.findOneAndDelete({ _id: todo_id, user_id: user_id });
      if (!deletedTodo) {
        return res.status(404);
      }

      // Invalidate cache
      await safeRedisDel(redisClient, `todos:${user_id}`);

      return res.status(200).json({ id: todo_id });
    } catch (error) {
      console.error('DELETE TODO: ', error);
      return res.status(500);
    }
  },
  getSearchTodo: async (req, res) => {
    const user_id = req.sub;
    const query = req.query.q;
    const { Todo } = req.app.locals.models;
    const redisClient = req.app.locals.redisClient;

    try {
      const cacheKey = `search:${user_id}:${query}`;
      const cached = await safeRedisGet(redisClient, cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const result = await Todo.find({
        user_id: user_id,
        $text: { $search: query }
      })
        .sort({ date: 1 })
        .select('-user_id');

      if (result) {
        await safeRedisSet(redisClient, cacheKey, JSON.stringify(result), 300);
        return res.status(200).json(result);
      } else {
        return res.status(404);
      }
    } catch (error) {
      console.error('SEARCH TODO: ', error);
      return res.status(500);
    }
  }
};

module.exports = TodoController;
