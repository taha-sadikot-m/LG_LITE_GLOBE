from flask import Flask, render_template, request
from flask_socketio import SocketIO
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'liquid-galaxy-3d-secret'
socketio = SocketIO(app, cors_allowed_origins="*")

rooms = {}
'''

# Add these WebSocket settings to handle large payloads
socketio = SocketIO(app, 
    cors_allowed_origins="*",
    async_mode='gevent',
    max_http_buffer_size=1e8,  # 100MB
    ping_timeout=60,
    ping_interval=25
)'
'''


@socketio.on('create_room')
def handle_create_room():
    room_id = str(uuid.uuid4())
    rooms[room_id] = {'master': request.sid, 'slaves': {}}
    socketio.emit('room_created', {'room_id': room_id})

@socketio.on('join_room')
def handle_join_room(data):
    room_id = data['room_id']
    position = data.get('position', 'front')
    if room_id in rooms:
        rooms[room_id]['slaves'][request.sid] = position
        socketio.emit('position_assigned', {'position': position})

@socketio.on('camera_update')
def handle_camera_update(data):
    room_id = data['room_id']
    if room_id in rooms:
        for slave_sid in rooms[room_id]['slaves']:
            socketio.emit('camera_update', data, room=slave_sid)

@app.route('/')
def master():
    return render_template('master.html')

@app.route('/slave')
def slave():
    return render_template('slave.html')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)