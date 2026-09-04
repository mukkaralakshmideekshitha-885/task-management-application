"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastActivity = exports.broadcastTaskEvent = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Allow all origins for dev/testing
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    });
    io.on('connection', (socket) => {
        console.log(`[WebSocket] Client connected: ${socket.id}`);
        socket.on('join_board', (boardId) => {
            socket.join(boardId);
            console.log(`[WebSocket] Socket ${socket.id} joined board ${boardId}`);
        });
        socket.on('disconnect', () => {
            console.log(`[WebSocket] Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized');
    }
    return io;
};
exports.getIO = getIO;
const broadcastTaskEvent = (event, payload) => {
    if (io) {
        io.emit(event, payload);
        console.log(`[WebSocket Broadcast] ${event}:`, payload?.id || payload);
    }
};
exports.broadcastTaskEvent = broadcastTaskEvent;
const broadcastActivity = (activity) => {
    if (io) {
        io.emit('activity:new', activity);
    }
};
exports.broadcastActivity = broadcastActivity;
