const UserModel = require('./user.model');
const TodoModel = require('./todo.model');

function initModels(db) {
  const User = db.model('User', UserModel);
  const Todo = db.model('Todo', TodoModel);

  return { User, Todo };
}

module.exports = { initModels };
