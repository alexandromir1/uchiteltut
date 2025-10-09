const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const cors = require("cors");

async function startServer() {
  const app = express();
  app.use(cors());

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startServer();
