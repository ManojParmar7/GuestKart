const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const { default: axios } = require("axios");

const { USERS } = require("./user");
const { TODOS } = require("./todo");

async function startServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs: `
        type User {
            id: ID!
            name: String!
            username: String!
            email: String!
            phone: String!
            website: String!
        }

        type Todo {
            id: ID!
            title: String!
            completed: Boolean
            user: User
            
        }

        type Query {
            getTodos: [Todo]
            getAllUsers: [User]
            getUser(id: ID!): User
        }

    `,
    resolvers: {
      Todo: {
        user: (todo) => USERS.find((e) => e.id === todo.userId),
      },
      //   Todo: {
      //     user: async (todo) =>
      //       (
      //         await axios.get(
      //           `https://jsonplaceholder.typicode.com/users/${todo.userId}`
      //         )
      //       ).data,
      //   },
      Query: {
        // getTodos: async () =>
        //   (await axios.get("https://jsonplaceholder.typicode.com/todos")).data,
        getTodos: () => TODOS,

        getAllUsers: () => USERS,

        // getAllUsers: async () =>
        //   (await axios.get("https://jsonplaceholder.typicode.com/users")).data,

        // getUser: async (parent, { id }) =>
        //   (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`))
        //     .data,
        getUser: async (parent, { id }) => USERS.find((e) => e.id === id),
      },
    },
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(), // <-- Correct middleware here
    expressMiddleware(server)
  );
  app.listen(8000, () => console.log("Serevr Started at PORT 8000"));
}

startServer();
