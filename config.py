import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    SOCKETIO_MESSAGE_QUEUE = 'redis://localhost:6379/0'  # For scaling later