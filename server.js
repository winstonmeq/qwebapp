require("dotenv").config();
const next = require("next");
const http = require("http");
const { Server } = require("socket.io");

// Setup Next.js
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Helper to handle TypeScript "export default" logic
const getModule = (path) => {
  const mod = require(path);
  return mod.default || mod;
};

app.prepare().then(async () => {
  // Import TS Modules safely
  const connectDB = getModule("./lib/mongodb");
  const EmergencyModel = getModule("./models/Emergency");

  // Connect to Database
  await connectDB();

  // Create the HTTP Server
  const server = http.createServer((req, res) => handle(req, res));

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "*", // Change this to your specific domain in production
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  // Socket.IO Logic
  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Join incident room
    socket.on("joinIncident", (incidentId) => {
      socket.join(`${incidentId}`);
      console.log(`User ${socket.id} joined room: ${incidentId}`);
    });

    // Join LGU room (dashboard queue)
    socket.on("joinLGU", (lguCode) => {
      socket.join(`lgu_${lguCode}`);
      console.log(`User ${socket.id} joined LGU room: ${lguCode}`);
    });

    //Chat message logic
    socket.on("sendMessage", async ({ incidentId, message }) => {
      // In a real app, you would save 'message' to MongoDB here
      io.to(`${incidentId}`).emit("newMessage", message);
    });

    // Update emergency status
    socket.on("updateEmergencyStatus", async ({ emergencyId, status }) => {
      try {
        const updated = await EmergencyModel.findByIdAndUpdate(
          emergencyId,
          { status },
          { new: true }
        );

        if (updated) {
          io.to(`${emergencyId}`).emit("statusUpdated", updated);
          io.to(`lgu_${updated.lguCode}`).emit("emergencyQueueUpdated", updated);
        }
      } catch (error) {
        console.error("❌ Status update error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
  

  // Make io globally accessible if needed
  global.io = io;

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});