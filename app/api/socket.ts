import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/lib/socket-server";
import { initSocket } from "@/lib/socket-server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("Socket.IO server already initialized");
  } else {
    console.log("Initializing Socket.IO server...");
    initSocket(res);
  }
  
  res.end();
}