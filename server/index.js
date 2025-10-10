// server/index.js
import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { getJobs } from './src/excelLoader.js';
import fs from 'fs'; // Добавьте этот импорт

const app = express();

// CORS настройки
app.use(cors({
  origin: [
    'https://teachers-job-portal-5003750hy-mirchas-projects.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

// GraphQL схема
const typeDefs = `
  type Job {
    id: ID!
    position: String!
    school: String!
    hours: String
    salary: String
    region: String
    housing: String
    benefits: String
    contacts: String
    email: String
    support: String
    studentEmployment: String
    duties: String
    openDate: String
  }

  type Query {
    jobs: [Job]
    job(id: ID!): Job
  }
`;

const resolvers = {
  Query: {
    jobs: () => getJobs(),
    job: (_, { id }) => {
      const jobs = getJobs();
      return jobs.find(job => job.id === id);
    }
  }
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });

  // Test endpoint
  app.get('/test-files', (req, res) => {
    try {
      const currentDir = process.cwd();
      const filesInRoot = fs.readdirSync('.');
      const dataDirExists = fs.existsSync('./data');

      res.json({
        currentDirectory: currentDir,
        filesInRoot: filesInRoot,
        dataDirExists: dataDirExists,
        dataDirContents: dataDirExists ? fs.readdirSync('./data') : 'No data dir'
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://0.0.0.0:${PORT}`);
    console.log(`📊 GraphQL: http://0.0.0.0:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(console.error);