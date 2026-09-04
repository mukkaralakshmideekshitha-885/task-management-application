import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import { initSocket } from './sockets/socketHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize WebSockets
initSocket(server);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Task Management API'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 Task Management Server listening on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`=========================================`);
  });
}

export { app, server };
