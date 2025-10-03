import { Server } from "socket.io";

export let io: Server;

export const initIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};


export const onlineUsers = new Map<string, Set<string>>();

export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());