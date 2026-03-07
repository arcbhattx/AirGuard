import { QuickReply, Message } from "../types/chat";

export const QUICK_REPLIES: QuickReply[] = [
  { label: "Air quality index", value: "What's the current air quality index?" },
  { label: "Filter status", value: "Check my filter status" },
  { label: "Schedule service", value: "I'd like to schedule a service" },
  { label: "Alert history", value: "Show me recent alerts" },
];

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    text: "Hello! I'm your AirGuard assistant. I can help you monitor air quality, manage filters, and keep your environment safe. How can I help you today?",
    timestamp: new Date(),
  },
];