require("dotenv").config(); // Load .env

const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const { graphqlUploadExpress } = require("graphql-upload");

const { typeDefs, resolvers } = require("./server");

const SECRET = process.env.JWT_SECRET;

async function startServer() {
  const app = express();

  // MongoDB connect
  await mongoose
    .connect("mongodb://127.0.0.1:27017/graphql_crud")
    .then(() => console.log("✅ DB connected"))
    .catch((err) => console.error("❌ DB error:", err));
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: false,
  });

  await server.start();
  app.use(cors());
  app.use(graphqlUploadExpress());
  app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

  app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
  app.use("/webhook", require("./routes/stripeWebhook"));
  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      // context: async ({ req }) => {
      //   const token = req.headers.authorization || "";
      //   let user = null;

      //   if (token) {
      //     try {
      //       const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET);
      //       user = {
      //         id: decoded.id,
      //         role: decoded.role?.name,
      //         superadmin_id: decoded.superadmin_id || null,
      //       };
      //     } catch (error) {

      //       // Still return null user, don't block here
      //     }
      //   }

      //   return { user };
      // },

      context: async ({ req }) => {
        const token = req.headers.authorization || "";
        let user = null;

        if (token) {
          try {
            const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET);
            console.log("Decoded Token:", decoded); // ✅ Debug here

            user = {
              id: decoded.id,
              role: decoded.role?.name,
              superadmin_id: decoded.superadmin_id || null,
            };
          } catch (error) {
            console.error("JWT Verification Failed:", error.message); // ✅ Debug here
          }
        } else {
          console.warn("No token found in header");
        }

        return { user };
      },
    })
  );

  app.listen(8000, () =>
    console.log("🚀 Server ready at http://localhost:8000/graphql")
  );
}

startServer().catch((err) => console.error("🔥 Error starting server:", err));
