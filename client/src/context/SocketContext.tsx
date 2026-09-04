import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { Task } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const SocketProvider: React.FC<{
  children: React.ReactNode;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (id: string) => void;
}> = ({ children, onTaskCreated, onTaskUpdated, onTaskDeleted }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only establish socket connection when user is logged in
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to server with ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from server');
      setIsConnected(false);
    });

    socket.on('task:created', (task: Task) => {
      if (task.creatorId !== user.id) {
        toast(`✨ New task created: "${task.title}"`, {
          icon: '📋',
          style: {
            borderRadius: '10px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '13px'
          }
        });
      }
      onTaskCreated?.(task);
    });

    socket.on('task:updated', (task: Task) => {
      onTaskUpdated?.(task);
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      onTaskDeleted?.(id);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
