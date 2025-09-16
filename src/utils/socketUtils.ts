// import { Server } from "socket.io";

// export let io: Server;

// export const initIO = (server: any) => {
//   io = new Server(server, {
//     cors: {
//       origin: "http://localhost:3000",
//       credentials: true,
//     },
//   });

//   return io;
// };

// export const getIO = () => {
//   if (!io) {
//     throw new Error("Socket.io not initialized!");
//   }
//   return io;
// };

// connected user based approach 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Room based Approach


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




