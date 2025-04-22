# TypeScript Flask Chatbot with Dialogflow API

A modern chatbot application with a TypeScript frontend and Flask backend. The chatbot widget appears in the bottom-right corner of your website with voice input and file sharing capabilities.

## Project Structure

```
.
├── backend/                 # Flask backend
│   ├── app.py               # Main Flask application
│   └── requirements.txt     # Python dependencies
│
└── front-end/               # TypeScript frontend
    ├── index.html           # Landing page HTML
    ├── src/                 # Source code
    │   ├── main.ts          # Main TypeScript entry point
    │   ├── types.ts         # TypeScript type definitions
    │   ├── index.css        # CSS with Tailwind imports
    │   ├── components/      # UI Components
    │   │   └── chatbotWidget.ts  # Chatbot widget component
    │   └── services/        # Services
    │       └── chatService.ts  # Chat API service
    ├── package.json         # NPM dependencies
    └── tailwind.config.js   # Tailwind CSS configuration
```

## Backend Setup

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```

The backend will be running at http://localhost:5000.

## Frontend Setup

1. Install dependencies:
   ```bash
   cd front-end
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be running at http://localhost:5173 (or another port if 5173 is in use).

## Features

- 🌟 Chatbot widget in the bottom-right corner
- 🔄 Open/close functionality with smooth animations
- 🎨 Modern UI with gradient header and clean design
- 🎤 Voice input support via browser's speech recognition
- 📎 File attachment capabilities
- 📱 Responsive design for mobile and desktop
- 💬 Typing indicators and message timestamps
- 🌐 Complete landing page to showcase the chatbot

## Dialogflow Integration

To integrate with Dialogflow:

1. Create a project in the Google Cloud Console
2. Enable the Dialogflow API
3. Create a Dialogflow agent
4. Download the service account key JSON file
5. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key JSON file
6. Uncomment and implement the Dialogflow code in `app.py`

## Customization

You can customize the chatbot's appearance and behavior by modifying:

- The colors in `tailwind.config.js`
- The chat widget styles in `index.css`
- The landing page content in `index.html`
- The chat logic in `chatbotWidget.ts`
