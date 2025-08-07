const gql = String.raw;

module.exports = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean
    user: User
  }

  extend type Query {
    getTodos: [Todo]
  }

  extend type Mutation {
    createTodo(title: String!, completed: Boolean, userId: ID!): Todo
    updateTodo(id: ID!, title: String, completed: Boolean, userId: ID): Todo

    deleteTodo(id: ID!): Todo
  }
`;
