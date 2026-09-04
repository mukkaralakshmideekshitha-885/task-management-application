"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const socketHandler_1 = require("./sockets/socketHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const PORT = process.env.PORT || 5000;
// Configure CORS
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Initialize WebSockets
(0, socketHandler_1.initSocket)(server);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Task Management API'
    });
});
// Mount Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Start Server
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 Task Management Server listening on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`=========================================`);
});
