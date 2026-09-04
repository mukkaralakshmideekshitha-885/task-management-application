import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow all origins for dev/testing
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('join_board', (boardId: string) => {
      socket.join(boardId);
      console.log(`[WebSocket] Socket ${socket.id} joined board ${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

export const broadcastTaskEvent = (event: 'task:created' | 'task:updated' | 'task:deleted', payload: any) => {
  if (io) {
    io.emit(event, payload);
    console.log(`[WebSocket Broadcast] ${event}:`, payload?.id || payload);
  }
};

export const broadcastActivity = (activity: any) => {
  if (io) {
    io.emit('activity:new', activity);
  }
};
