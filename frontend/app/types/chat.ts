export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

export interface QuickReply {
  label: string;
  value: string;
}