import mongoose from "mongoose";

// Chat Message Schema
const ChatMessageSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  sender: { type: String, required: true },
  role: { type: String },
  timestamp: { type: Date, default: Date.now },
});


export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);