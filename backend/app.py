# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Simple chat endpoint that returns the user's message back
    For a real implementation, you would connect to Dialogflow here
    """
    data = request.json
    user_message = data.get('message', '')
    
    # Simple echo response
    # In a real implementation, you would process this with Dialogflow
    response = {
        'reply': f"You said: {user_message}",
        'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(response)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Handle file uploads
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Generate a unique filename to prevent collisions
    original_filename = file.filename
    filename_parts = os.path.splitext(original_filename)
    unique_filename = f"{uuid.uuid4()}{filename_parts[1]}"
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
    # Return the file info
    file_url = f"/uploads/{unique_filename}"
    
    return jsonify({
        'success': True,
        'filename': original_filename,
        'url': file_url,
        'size': os.path.getsize(file_path)
    })

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """
    Serve uploaded files
    """
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

# For Dialogflow integration, you would add code like this:
# 
# from google.cloud import dialogflow
# 
# def detect_intent(project_id, session_id, text, language_code='en-US'):
#     session_client = dialogflow.SessionsClient()
#     session = session_client.session_path(project_id, session_id)
#     
#     text_input = dialogflow.TextInput(text=text, language_code=language_code)
#     query_input = dialogflow.QueryInput(text=text_input)
#     
#     response = session_client.detect_intent(
#         request={"session": session, "query_input": query_input}
#     )
#     
#     return response.query_result

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
