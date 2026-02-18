import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Send, User, ShieldCheck, X } from 'lucide-react';
import { Emergency } from '@/types';
type SocketType = ReturnType<typeof io>;

interface ChatModalProps {
  emergency: Emergency;
  onClose: () => void;
  currentUser: any;
}



export default function ChatModal({ emergency, onClose, currentUser }: ChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const socketRef = useRef<SocketType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

 

  useEffect(() => {
  const socket = io();
  socketRef.current = socket;
  
  // Join with prefix
  socket.emit('joinIncident', emergency._id);

  // Listen for "newMessage" (NOT "receiveMessage")
  socket.on('newMessage', (message: string) => {
    setMessages((prev) => [...prev, message]);
  });

  return () => { socket.disconnect(); };
}, [emergency._id]);


  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    const messageData = {
      incidentId: emergency._id,
      message: {
        text: inputValue,
        sender: currentUser.name || 'Admin',
        role: currentUser.role,
        timestamp: new Date().toISOString(),
      },
    };

    // Emit to server
    socketRef.current?.emit('sendMessage', messageData);

    // Add to local UI immediately
    // setMessages((prev) => [...prev, messageData.message]);
    setInputValue('');
  };





  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 w-full max-w-md h-[600px] rounded-2xl flex flex-col shadow-2xl border border-gray-700">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-full">
              <User className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold leading-none">{emergency.userName}</h3>
              <p className="text-xs text-gray-400 mt-1 capitalize">{emergency.emergencyType} Emergency</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10 text-sm italic">
              No messages yet. Send a message to coordinate with the reporter.
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.role === currentUser.role;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-700 text-gray-100 rounded-tl-none'
                }`}>
                  <p className="text-xs opacity-70 mb-1 font-bold">{msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-900/50 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type instructions..."
              className="flex-1 bg-gray-700 text-white border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-transform active:scale-95">
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}