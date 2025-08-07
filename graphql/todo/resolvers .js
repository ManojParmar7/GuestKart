const Todo = require("../../modals/Todo");
const User = require("../../modals/User");

module.exports = {
  Todo: {
    user: async (todo) => await User.findById(todo.userId),
  },
  Query: {
    getTodos: async () => await Todo.find(),
  },
  Mutation: {
    createTodo: async (_, args) => {
      const todo = new Todo(args);
      return await todo.save();
    },

    updateTodo: async (_, { id, ...updates }) => {
      const updatedTodo = await Todo.findByIdAndUpdate(id, updates, {
        new: true,
      });
      return updatedTodo;
    },

    deleteTodo: async (_, { id }) => {
      const deletedTodo = await Todo.findByIdAndDelete(id);
      return deletedTodo;
    },
  },
};
