// src/types.ts

// Message types enum
export enum MessageType {
  USER = 'user',
  BOT = 'bot'
}

// Attachment types enum
export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document'
}

// Attachment interface
export interface Attachment {
  type: AttachmentType;
  filename: string;
  url: string; // This could be a local URL or a server URL after upload
  size: number;
}

// Chat message interface
export interface ChatMessage {
  content: string;
  type: MessageType;
  timestamp: Date;
  attachments?: Attachment[];
}

// API response interface
export interface ChatResponse {
  reply: string;
  timestamp: string;
}
