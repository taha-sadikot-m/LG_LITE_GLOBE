
// static/js/slave.js (Add this line FIRST)
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MTMzMTYzZC1hOGRkLTQwOTUtODcxYy1hOWM2ODViNDk4ZTYiLCJpZCI6MjgzNTcxLCJpYXQiOjE3NDE3NzM3MDl9.sT6vwcKf_lB8lGer8FuVhD4g5WA-5umnnKA3iMjvwJY';  // ← YOUR KEY HERE

//Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_TOKEN'; // REPLACE

const sessionId = prompt('Enter Master Session ID:');
const col = parseInt(prompt('Column (0-indexed):'));
const row = parseInt(prompt('Row (0-indexed):'));

if (!sessionId || isNaN(col) || isNaN(row)) {
    alert('Invalid input!');
    window.location.reload();
}

const viewer = new Cesium.Viewer('cesiumContainer', {
    sceneMode: Cesium.SceneMode.SCENE2D,
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    fullscreenButton: false
});

const socket = io();
socket.emit('register_slave', { session_id: sessionId, col: col, row: row });

// Handle view updates
socket.on('view_rectangle', (data) => {
    viewer.camera.setView({
        destination: Cesium.Rectangle.fromDegrees(
            data.west,
            data.south,
            data.east,
            data.north
        )
    });
});