import { Server as NetServer } from "http";
import { Server as IOServer } from "socket.io";
import type { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: IOServer;
    };
  };
};

export function initSocket(res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log("🚀 Initializing Socket.IO server...");

    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      // User joins incident room
      socket.on("joinIncident", (incidentId: string) => {
        socket.join(`incident_${incidentId}`);
        console.log(`👤 Joined incident room: incident_${incidentId}`);
        
        // Notify others in the room
        socket.to(`incident_${incidentId}`).emit("userJoined", {
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      });

      // LGU joins LGU queue room
      socket.on("joinLGU", (lguCode: string) => {
        socket.join(`lgu_${lguCode}`);
        console.log(`🏛️ LGU joined: lgu_${lguCode}`);
      });

      // Chat message
      socket.on("sendMessage", ({ incidentId, message }) => {
        console.log(`💬 Message sent to incident_${incidentId}:`, message.message);
        
        // Add server timestamp
        const messageWithTimestamp = {
          ...message,
          timestamp: new Date().toISOString(),
        };
        
        io.to(`incident_${incidentId}`).emit("newMessage", messageWithTimestamp);
      });

      // Typing indicators
      socket.on("startTyping", ({ incidentId, userId, userName }) => {
        socket.to(`incident_${incidentId}`).emit("userTyping", {
          userId,
          userName,
        });
      });

      socket.on("stopTyping", ({ incidentId, userId }) => {
        socket.to(`incident_${incidentId}`).emit("userStoppedTyping", {
          userId,
        });
      });

      // Mark message as read
      socket.on("markAsRead", ({ incidentId, messageId, userId }) => {
        io.to(`incident_${incidentId}`).emit("messageRead", {
          messageId,
          readBy: userId,
          timestamp: new Date().toISOString(),
        });
      });

      // File upload notification
      socket.on("fileUploaded", ({ incidentId, file }) => {
        io.to(`incident_${incidentId}`).emit("newFile", {
          ...file,
          timestamp: new Date().toISOString(),
        });
      });

      // Status updates
      socket.on("statusUpdate", ({ incidentId, status, updatedBy }) => {
        io.to(`incident_${incidentId}`).emit("incidentStatusChanged", {
          status,
          updatedBy,
          timestamp: new Date().toISOString(),
        });
      });

      // LGU assignment notification
      socket.on("assignLGU", ({ incidentId, lguCode, lguName }) => {
        // Notify the incident room
        io.to(`incident_${incidentId}`).emit("lguAssigned", {
          lguCode,
          lguName,
          timestamp: new Date().toISOString(),
        });
        
        // Notify the LGU queue
        io.to(`lgu_${lguCode}`).emit("newIncidentAssigned", {
          incidentId,
          timestamp: new Date().toISOString(),
        });
      });

      // Get online users in room
      socket.on("getOnlineUsers", async (incidentId: string) => {
        const room = io.sockets.adapter.rooms.get(`incident_${incidentId}`);
        const onlineCount = room ? room.size : 0;
        
        socket.emit("onlineUsers", {
          incidentId,
          count: onlineCount,
        });
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  
  return res.socket.server.io;
}