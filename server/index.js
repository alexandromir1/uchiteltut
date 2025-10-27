import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { getJobs } from './src/excelLoader.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS - разрешаем ВСЕ origins
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Обработка OPTIONS запросов для CORS
app.options('*', cors());

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/build')));
}

// Basic route
app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, '../../client/build/index.html'));
    } else {
        res.json({ 
            message: 'Teacher Job Portal API is working! 🚀',
            endpoints: {
                graphql: 'POST /graphql',
                health: 'GET /health',
                test: 'GET /test'
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Test route
app.get('/test', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Server is responding correctly',
        graphql: 'Use POST method for /graphql'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// API route for jobs (REST fallback)
app.get('/api/jobs', (req, res) => {
    try {
        const jobs = getJobs();
        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs.slice(0, 100) // Ограничиваем для производительности
        });
    } catch (error) {
        console.error('Error in /api/jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load jobs',
            jobs: []
        });
    }
});

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
    health: String
  }
`;

const resolvers = {
    Query: {
        jobs: () => {
            console.log('📊 Fetching jobs via GraphQL...');
            try {
                const jobs = getJobs();
                console.log(`✅ Found ${jobs.length} jobs`);
                return jobs;
            } catch (error) {
                console.error('❌ Error getting jobs:', error);
                return [{
                    id: "error-1",
                    position: "Учитель математики",
                    school: "Резервная школа",
                    region: "Тестовый регион",
                    salary: "40000 руб.",
                    hours: "18 часов"
                }];
            }
        },
        job: (_, { id }) => {
            try {
                const jobs = getJobs();
                return jobs.find(job => job.id === id) || null;
            } catch (error) {
                console.error('Error finding job:', error);
                return null;
            }
        },
        health: () => 'GraphQL is working! ✅'
    }
};

// Catch all handler for client-side routing
app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, '../../client/build/index.html'));
    } else {
        res.status(404).json({ error: 'Route not found' });
    }
});

async function startApolloServer() {
    try {
        console.log('🚀 Starting Apollo Server...');
        
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            introspection: true,
            playground: process.env.NODE_ENV !== 'production',
            context: ({ req, res }) => ({
                req,
                res
            }),
            formatError: (error) => {
                console.error('GraphQL Error:', error);
                return {
                    message: error.message,
                    code: error.extensions?.code || 'INTERNAL_ERROR'
                };
            }
        });

        await server.start();
        console.log('✅ Apollo Server started');

        // Применяем middleware
        server.applyMiddleware({ 
            app, 
            path: '/graphql',
            cors: false // CORS уже настроен выше
        });

        console.log('✅ Apollo middleware applied');

        const PORT = process.env.PORT || 5000;
        const HOST = process.env.HOST || '0.0.0.0';

        app.listen(PORT, HOST, () => {
            console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌐 URL: http://${HOST}:${PORT}`);
            console.log(`📊 GraphQL: http://${HOST}:${PORT}${server.graphqlPath}`);
            if (process.env.NODE_ENV !== 'production') {
                console.log(`🛠️ Playground: http://${HOST}:${PORT}${server.graphqlPath}`);
            }
            console.log(`🏥 Health: http://${HOST}:${PORT}/health`);
            console.log(`📋 API Jobs: http://${HOST}:${PORT}/api/jobs`);
        });

    } catch (error) {
        console.error('❌ Failed to start Apollo Server:', error);
        process.exit(1);
    }
}

// Запускаем сервер
startApolloServer();

export default app;