// src/components/chatbotWidget.ts
import { ChatService } from '../services/chatService';
import { MessageType, ChatMessage, AttachmentType } from '../types';

export class ChatbotWidget {
  private container: HTMLElement;
  private chatService: ChatService;
  private widgetElement: HTMLElement | null = null;
  private chatMessagesElement: HTMLElement | null = null;
  private userInputElement: HTMLInputElement | null = null;
  private isOpen: boolean = false;
  private isRecording: boolean = false;
  private recognition: SpeechRecognition | null = null;
  private messages: ChatMessage[] = [];

  constructor(container: HTMLElement, chatService: ChatService) {
    this.container = container;
    this.chatService = chatService;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    // Check if browser supports SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't have types for the Web Speech API by default
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (this.userInputElement) {
          this.userInputElement.value = transcript;
        }
        this.stopRecording();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        this.stopRecording();
      };
    }
  }

  public render(): void {
    this.createWidget();
    this.attachEventListeners();
    
    // Add initial welcome message
    this.addMessage({
      content: 'Hello! How can I help you today?',
      type: MessageType.BOT,
      timestamp: new Date()
    });
  }

  private createWidget(): void {
    // Create toggle button (chat icon in the corner)
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chatbot-toggle';
    toggleButton.className = 'fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all z-50';
    toggleButton.innerHTML = '<i class="fas fa-comments text-2xl"></i>';
    
    // Create chat window (initially hidden)
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.className = 'fixed bottom-24 right-6 w-96 max-w-[90vw] bg-white rounded-lg shadow-xl z-50 transition-all transform scale-95 opacity-0 pointer-events-none';
    chatWindow.innerHTML = `
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-4 flex justify-between items-center">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 mr-3">
            <i class="fas fa-robot text-xl"></i>
          </div>
          <div>
            <h3 class="text-white font-bold">Assistant</h3>
            <p class="text-blue-100 text-xs">Online</p>
          </div>
        </div>
        <button id="chatbot-close" class="text-white hover:text-blue-200 transition-colors">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>
      
      <div id="chat-messages" class="h-96 overflow-y-auto p-4 bg-gray-50"></div>
      
      <div class="p-4 border-t">
        <div class="relative">
          <form id="chat-form" class="flex items-center">
            <button type="button" id="attachment-button" class="text-gray-500 hover:text-blue-600 transition-colors mr-2">
              <i class="fas fa-paperclip text-lg"></i>
            </button>
            <input type="file" id="file-input" class="hidden" multiple>
            
            <input 
              type="text" 
              id="user-input" 
              class="flex-1 border rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            >
            
            <button 
              type="button" 
              id="voice-button"
              class="absolute right-16 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <i class="fas fa-microphone text-lg"></i>
            </button>
            
            <button 
              type="submit" 
              id="send-button"
              class="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2 hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
        <div id="attachment-preview" class="flex flex-wrap mt-2 gap-2"></div>
      </div>
    `;
    
    // Append elements to container
    this.container.appendChild(toggleButton);
    this.container.appendChild(chatWindow);
    
    // Store references to elements
    this.widgetElement = chatWindow;
    this.chatMessagesElement = chatWindow.querySelector('#chat-messages');
    this.userInputElement = chatWindow.querySelector('#user-input') as HTMLInputElement;
  }

  private attachEventListeners(): void {
    if (!this.widgetElement) return;
    
    // Toggle button
    const toggleButton = document.getElementById('chatbot-toggle');
    toggleButton?.addEventListener('click', () => this.toggleChat());
    
    // Close button
    const closeButton = this.widgetElement.querySelector('#chatbot-close');
    closeButton?.addEventListener('click', () => this.toggleChat(false));
    
    // Chat form
    const chatForm = this.widgetElement.querySelector('#chat-form');
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleMessageSubmit();
    });
    
    // Voice button
    const voiceButton = this.widgetElement.querySelector('#voice-button');
    voiceButton?.addEventListener('click', () => this.toggleVoiceRecording());
    
    // Attachment button
    const attachmentButton = this.widgetElement.querySelector('#attachment-button');
    const fileInput = this.widgetElement.querySelector('#file-input') as HTMLInputElement;
    
    attachmentButton?.addEventListener('click', () => {
      fileInput?.click();
    });
    
    fileInput?.addEventListener('change', () => {
      this.handleFileSelection(fileInput);
    });
  }

  private toggleChat(open?: boolean): void {
    if (!this.widgetElement) return;
    
    this.isOpen = open !== undefined ? open : !this.isOpen;
    
    const toggleButton = document.getElementById('chatbot-toggle');
    
    if (this.isOpen) {
      // Open chat
      this.widgetElement.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
      this.widgetElement.classList.add('scale-100', 'opacity-100');
      if (toggleButton) {
        toggleButton.innerHTML = '<i class="fas fa-times text-2xl"></i>';
      }
      
      // Focus input
      setTimeout(() => this.userInputElement?.focus(), 300);
    } else {
      // Close chat
      this.widgetElement.classList.remove('scale-100', 'opacity-100');
      this.widgetElement.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
      if (toggleButton) {
        toggleButton.innerHTML = '<i class="fas fa-comments text-2xl"></i>';
      }
      
      // Stop recording if active
      if (this.isRecording) {
        this.stopRecording();
      }
    }
  }

  private toggleVoiceRecording(): void {
    if (!this.recognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    const voiceButton = this.widgetElement?.querySelector('#voice-button');
    
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
      if (voiceButton) {
        voiceButton.innerHTML = '<i class="fas fa-microphone-slash text-red-500 text-lg"></i>';
      }
    }
  }

  private startRecording(): void {
    if (!this.recognition) return;
    
    this.isRecording = true;
    try {
      this.recognition.start();
    } catch (e) {
      console.error('Could not start speech recognition', e);
    }
  }

  private stopRecording(): void {
    if (!this.recognition) return;
    
    this.isRecording = false;
    const voiceButton = this.widgetElement?.querySelector('#voice-button');
    
    if (voiceButton) {
      voiceButton.innerHTML = '<i class="fas fa-microphone text-lg"></i>';
    }
    
    try {
      this.recognition.stop();
    } catch (e) {
      console.error('Could not stop speech recognition', e);
    }
  }

  private handleFileSelection(fileInput: HTMLInputElement): void {
    if (!fileInput.files || fileInput.files.length === 0) return;
    
    const previewContainer = this.widgetElement?.querySelector('#attachment-preview');
    if (!previewContainer) return;
    
    // Clear previous previews
    previewContainer.innerHTML = '';
    
    Array.from(fileInput.files).forEach(file => {
      const previewElement = document.createElement('div');
      previewElement.className = 'attachment-preview-item bg-gray-100 rounded p-2 flex items-center';
      
      let iconClass = 'fas fa-file';
      if (file.type.startsWith('image/')) {
        iconClass = 'fas fa-image';
      } else if (file.type.startsWith('video/')) {
        iconClass = 'fas fa-video';
      } else if (file.type.startsWith('audio/')) {
        iconClass = 'fas fa-music';
      } else if (file.type.includes('pdf')) {
        iconClass = 'fas fa-file-pdf';
      }
      
      previewElement.innerHTML = `
        <i class="${iconClass} text-blue-600 mr-2"></i>
        <span class="text-sm truncate max-w-[150px]">${file.name}</span>
        <button class="remove-file ml-2 text-gray-500 hover:text-red-500">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      const removeButton = previewElement.querySelector('.remove-file');
      removeButton?.addEventListener('click', () => {
        previewElement.remove();
        
        // Create a new FileList without this file
        // Unfortunately, FileList is immutable, so for now we'll just clear it
        // In a real implementation, you would track selected files in an array
        fileInput.value = '';
      });
      
      previewContainer.appendChild(previewElement);
    });
  }

  private async handleMessageSubmit(): Promise<void> {
    if (!this.userInputElement || !this.chatMessagesElement) return;
    
    const message = this.userInputElement.value.trim();
    const fileInput = this.widgetElement?.querySelector('#file-input') as HTMLInputElement;
    const hasAttachments = fileInput?.files && fileInput.files.length > 0;
    
    if (!message && !hasAttachments) return;
    
    // Process message if present
    if (message) {
      // Add user message to the chat
      this.addMessage({
        content: message,
        type: MessageType.USER,
        timestamp: new Date()
      });
      
      // Clear input field
      this.userInputElement.value = '';
      
      // Show typing indicator
      const typingIndicator = this.addTypingIndicator();
      
      try {
        // Send message to API and get response
        const response = await this.chatService.sendMessage(message);
        
        // Remove typing indicator
        if (typingIndicator && this.chatMessagesElement.contains(typingIndicator)) {
          this.chatMessagesElement.removeChild(typingIndicator);
        }
        
        // Add bot response to chat
        this.addMessage({
          content: response.reply,
          type: MessageType.BOT,
          timestamp: new Date(response.timestamp)
        });
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator
        if (typingIndicator && this.chatMessagesElement.contains(typingIndicator)) {
          this.chatMessagesElement.removeChild(typingIndicator);
        }
        this.addMessage({
          content: 'Sorry, there was an error processing your request.',
          type: MessageType.BOT,
          timestamp: new Date()
        });
      }
    }
    
    // Process attachments if present
    if (hasAttachments) {
      this.handleAttachments(fileInput);
    }
    
    // Clear attachment previews
    const previewContainer = this.widgetElement?.querySelector('#attachment-preview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
    
    // Clear file input
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Focus input field for next message
    this.userInputElement.focus();
  }

  private handleAttachments(fileInput: HTMLInputElement): void {
    if (!fileInput.files || fileInput.files.length === 0) return;
    
    Array.from(fileInput.files).forEach(file => {
      let type: AttachmentType;
      
      if (file.type.startsWith('image/')) {
        type = AttachmentType.IMAGE;
      } else if (file.type.startsWith('video/')) {
        type = AttachmentType.VIDEO;
      } else if (file.type.startsWith('audio/')) {
        type = AttachmentType.AUDIO;
      } else {
        type = AttachmentType.DOCUMENT;
      }
      
      // Add attachment message
      this.addAttachmentMessage(file, type);
      
      // In a real implementation, you would upload the file to your server here
      // For this demo, we'll just acknowledge the attachment
      setTimeout(() => {
        this.addMessage({
          content: `I received your ${type.toLowerCase()}: ${file.name}`,
          type: MessageType.BOT,
          timestamp: new Date()
        });
      }, 1000);
    });
  }

  private addMessage(message: ChatMessage): void {
    if (!this.chatMessagesElement) return;
    
    this.messages.push(message);
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message mb-4';
    
    if (message.type === MessageType.USER) {
      // User message styles
      messageElement.innerHTML = `
        <div class="flex justify-end">
          <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none py-2 px-4 max-w-[80%] shadow-sm">
            <p>${this.escapeHtml(message.content)}</p>
            <p class="text-right text-xs text-blue-200 mt-1">${this.formatTime(message.timestamp)}</p>
          </div>
        </div>
      `;
    } else {
      // Bot message styles
      messageElement.innerHTML = `
        <div class="flex">
          <div class="bg-gray-100 rounded-2xl rounded-tl-none py-2 px-4 max-w-[80%] shadow-sm">
            <p>${this.escapeHtml(message.content)}</p>
            <p class="text-xs text-gray-500 mt-1">${this.formatTime(message.timestamp)}</p>
          </div>
        </div>
      `;
    }
    
    this.chatMessagesElement.appendChild(messageElement);
    this.scrollToBottom();
  }

  private addAttachmentMessage(file: File, type: AttachmentType): void {
    if (!this.chatMessagesElement) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message mb-4';
    
    // Different layouts for different file types
    let previewHtml = '';
    
    if (type === AttachmentType.IMAGE) {
      // Image preview
      const objectUrl = URL.createObjectURL(file);
      previewHtml = `
        <div class="bg-gray-800 rounded-t-lg p-1">
          <img src="${objectUrl}" alt="${file.name}" class="rounded max-h-48 max-w-full object-contain mx-auto">
        </div>
      `;
    } else {
      // Other file types
      let iconClass = 'fas fa-file';
      if (type === AttachmentType.VIDEO) iconClass = 'fas fa-video';
      if (type === AttachmentType.AUDIO) iconClass = 'fas fa-music';
      if (type === AttachmentType.DOCUMENT && file.name.endsWith('.pdf')) iconClass = 'fas fa-file-pdf';
      
      previewHtml = `
        <div class="bg-gray-100 rounded-t-lg p-3 flex items-center">
          <i class="${iconClass} text-blue-600 text-2xl mr-2"></i>
          <span class="truncate">${file.name}</span>
        </div>
      `;
    }
    
    // Render message
    messageElement.innerHTML = `
      <div class="flex justify-end">
        <div class="max-w-[80%] rounded-lg shadow-sm overflow-hidden">
          ${previewHtml}
          <div class="bg-blue-600 text-white py-2 px-4">
            <p class="text-xs text-blue-200">File: ${file.name}</p>
            <p class="text-right text-xs text-blue-200 mt-1">${this.formatTime(new Date())}</p>
          </div>
        </div>
      </div>
    `;
    
    this.chatMessagesElement.appendChild(messageElement);
    this.scrollToBottom();
  }

  private addTypingIndicator(): HTMLElement {
    if (!this.chatMessagesElement) throw new Error('Chat messages element not found');
    
    const typingElement = document.createElement('div');
    typingElement.className = 'chat-message typing-indicator mb-4';
    typingElement.innerHTML = `
      <div class="flex">
        <div class="bg-gray-100 rounded-2xl rounded-tl-none py-2 px-4 shadow-sm">
          <div class="flex space-x-1">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    
    this.chatMessagesElement.appendChild(typingElement);
    this.scrollToBottom();
    
    return typingElement;
  }

  private scrollToBottom(): void {
    if (this.chatMessagesElement) {
      this.chatMessagesElement.scrollTop = this.chatMessagesElement.scrollHeight;
    }
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
