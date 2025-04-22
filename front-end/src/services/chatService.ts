// src/services/chatService.ts
import { ChatResponse } from '../types';

export class ChatService {
  private apiUrl: string;
  
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  
  /**
   * Send a message to the chat API
   * @param message The user's message
   * @returns Promise with the API response
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // Add a small delay to simulate network latency (for demo purposes)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json() as ChatResponse;
    } catch (error) {
      console.error('Error in ChatService:', error);
      throw error;
    }
  }
}
