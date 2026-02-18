"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";

// This extracts the type directly from the library to avoid naming conflicts
type SocketType = ReturnType<typeof io>;

interface Message {
  text: string;
  sender: string;
  timestamp: string;
}

export default function EmergencyChatPage() {
  const params = useParams();
  const incidentId = params.id as string;
  
  // State
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userName, setUserName] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Connection
  useEffect(() => {
    // For testing: get a username
    const name = prompt("Enter your name:") || "User_" + Math.floor(Math.random() * 100);
    setUserName(name);

    // Initialize the socket pointing to your server.js
    const newSocket = io({
      path: "/socket.io",
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to Server");
      setIsConnected(true);
      // Your server.js expects 'joinIncident'
      newSocket.emit("joinIncident", incidentId);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen for 'newMessage' as defined in your server.js
    newSocket.on("newMessage", (msg: Message) => {
      setChatHistory((prev) => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [incidentId]);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // 3. Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    const payload = {
      incidentId,
      message: {
        text: messageInput,
        sender: userName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    };

    // Emit 'sendMessage' as defined in your server.js
    socket.emit("sendMessage", payload);
    setMessageInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border-x bg-gray-50 font-sans">
      {/* Header */}
      <header className="p-4 bg-red-600 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wide">Emergency Chat</h1>
          <p className="text-xs opacity-80 font-mono">ID: {incidentId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></span>
          <span className="text-xs font-medium">{isConnected ? "LIVE" : "OFFLINE"}</span>
        </div>
      </header>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">Waiting for messages...</p>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col ${msg.sender === userName ? "items-end" : "items-start"}`}
          >
            <span className="text-[10px] text-gray-500 mb-1 px-1">
              {msg.sender} • {msg.timestamp}
            </span>
            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
              msg.sender === userName 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all text-black"
        />
        <button 
          type="submit"
          disabled={!messageInput.trim() || !isConnected}
          className="bg-red-600 text-white px-5 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300 transition-colors"
        >
          SEND
        </button>
      </form>
    </div>
  );
}