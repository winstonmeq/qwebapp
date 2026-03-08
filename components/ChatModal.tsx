import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, User, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [minimized, setMinimized] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

 // ✅ New — center of screen
const [position, setPosition] = useState({
  x: (window.innerWidth - 320) / 2,
  y: (window.innerHeight - 420) / 2,
});


  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const socketRef = useRef<SocketType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Normalize message shape (DB vs socket may differ) ---
  const normalizeMessage = (msg: any) => ({
    text: msg.text,
    sender: msg.sender,
    role: msg.role,
    timestamp: msg.timestamp,
  });

  // --- Drag Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 320);
      const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 60);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => { isDragging.current = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- Load messages from DB on open ---
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chats/${emergency._id}`);
        const result = await res.json();
        if (result.success) {
          setMessages(result.data.map(normalizeMessage));
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [emergency._id]);

  // --- Socket ---
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.emit('joinIncident', emergency._id);

    socket.on('newMessage', (payload: { incidentId: string; message: any }) => {
      // Only add if not sent by me (mine are added locally on send)
      if (payload.message.sender !== currentUser.name) {
        setMessages((prev) => [...prev, normalizeMessage(payload.message)]);
      }
    });

    return () => { socket.disconnect(); };
  }, [emergency._id]);

  // --- Auto scroll to bottom ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Send Message ---
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

    socketRef.current.emit('sendMessage', messageData);
    setMessages((prev) => [...prev, normalizeMessage(messageData.message)]);
    setInputValue('');
  };

  // --- Format timestamp ---
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed z-50 w-80 bg-gray-800 rounded-xl flex flex-col shadow-2xl border border-gray-500"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: 'none',
      }}
    >
      {/* Header — drag handle */}
      <div
        className="p-3 border-b border-red-700 flex items-center justify-between bg-red-900 rounded-t-xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="bg-red-500/20 p-1.5 rounded-full">
            <User className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-none">
              {emergency.userName}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {emergency.emergencyType} Emergency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-gray-400 hover:text-white transition-colors"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body — hidden when minimized */}
      {!minimized && (
        <>
          {/* Messages */}
          <div className="h-72 overflow-y-auto p-3 space-y-3">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-xs italic animate-pulse">
                  Loading messages...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-6 text-xs italic">
                No messages yet. Send a message to coordinate.
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isMe = msg.sender === currentUser.name;
                  return (
                    <div
                      key={i}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-xl text-sm ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-700 text-gray-100 rounded-tl-none'
                        }`}
                      >
                        <p className="text-xs opacity-70 mb-0.5 font-bold">
                          {msg.sender}
                        </p>
                        <p>{msg.text}</p>
                        <p className="text-[10px] opacity-50 mt-1 text-right">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-gray-900/50 rounded-b-xl border-t border-gray-700"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type instructions..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}