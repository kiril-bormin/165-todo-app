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
      if (redisClient) {
        await redisClient.del(`todos:${user_id}`);
      }

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
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.status(200).json(JSON.parse(cached));
        }
      }

      const result = await Todo.find({ user_id: user_id }).sort({ date: 1 }).select('-user_id');
      if (result) {
        if (redisClient) {
          await redisClient.setEx(cacheKey, 300, JSON.stringify(result)); // Cache for 5 minutes
        }
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
        todo.completed = data.completed !== undefined ? data.completed : false;
        todo.text = data.text || todo.text;
        todo.date = data.date || todo.date;
        await todo.save();

        // Invalidate cache
        if (redisClient) {
          await redisClient.del(`todos:${user_id}`);
        }

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
      await Todo.findOneAndDelete({ _id: todo_id, user_id: user_id });

      // Invalidate cache
      if (redisClient) {
        await redisClient.del(`todos:${user_id}`);
      }

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
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.status(200).json(JSON.parse(cached));
        }
      }

      const result = await Todo.find({
        user_id: user_id,
        $text: { $search: query }
      }).sort({ date: 1 }).select('-user_id');

      if (result) {
        if (redisClient) {
          await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
        }
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
