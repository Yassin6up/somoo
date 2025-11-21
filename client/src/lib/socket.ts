import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Group chat helpers
export const joinGroupChat = (groupId: string) => {
  socket?.emit('join:group', groupId);
};

export const leaveGroupChat = (groupId: string) => {
  socket?.emit('leave:group', groupId);
};

export const sendGroupMessage = (groupId: string, content: string) => {
  socket?.emit('group:message', { groupId, content });
};

// Conversation helpers (product owner ↔ group leader)
export const joinConversation = (conversationId: string) => {
  socket?.emit('join:conversation', conversationId);
};

export const leaveConversation = (conversationId: string) => {
  socket?.emit('leave:conversation', conversationId);
};

export const sendConversationMessage = (conversationId: string, content: string) => {
  socket?.emit('conversation:message', { conversationId, content });
};

// Direct message helpers
export const joinDirectChat = (roomId: string) => {
  socket?.emit('join:direct', roomId);
};

export const leaveDirectChat = (roomId: string) => {
  socket?.emit('leave:direct', roomId);
};

export const sendDirectMessage = (receiverId: string, receiverType: string, content: string, roomId: string) => {
  socket?.emit('direct:message', { receiverId, receiverType, content, roomId });
};

// Typing indicators
export const startTyping = (roomType: 'group' | 'conversation', roomId: string) => {
  socket?.emit('typing:start', { roomType, roomId });
};

export const stopTyping = (roomType: 'group' | 'conversation', roomId: string) => {
  socket?.emit('typing:stop', { roomType, roomId });
};
