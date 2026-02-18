import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, index: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);