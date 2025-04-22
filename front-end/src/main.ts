// src/main.ts
import './index.css';
import { ChatMessage, MessageType } from './types';
import { ChatService } from './services/chatService';
import { ChatbotWidget } from './components/chatbotWidget';

// Initialize the chat service
const chatService = new ChatService('http://localhost:5000/api/chat');

// Initialize the chatbot widget
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Initialize the chatbot widget
  const container = document.getElementById('chatbot-widget-container');
  if (container) {
    const chatbotWidget = new ChatbotWidget(container, chatService);
    chatbotWidget.render();
  }
});
