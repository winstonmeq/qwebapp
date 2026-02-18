"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

// Connect to your custom server.js
const socket = io("http://localhost:3000", {
  path: "/socket.io",
});

export default function ChatTest() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const incidentId = "test-room-101"; // Mock ID

  useEffect(() => {
    // Join the room on mount
    socket.emit("joinIncident", incidentId);

    // Listen for new messages
    socket.on("newMessage", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const sendMessage = () => {
    const payload = {
      incidentId,
      message: {
        text: message,
        sender: "User_" + Math.floor(Math.random() * 1000),
      },
    };
    socket.emit("sendMessage", payload);
    setMessage("");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Socket.io Test: {incidentId}</h1>
      <div className="border p-4 h-64 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>
      <input 
        className="border p-2 mr-2 text-black" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a test message..."
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
        Send
      </button>
    </div>
  );
}