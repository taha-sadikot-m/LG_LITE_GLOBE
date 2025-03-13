
// static/js/master.js (Add this line FIRST)
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MTMzMTYzZC1hOGRkLTQwOTUtODcxYy1hOWM2ODViNDk4ZTYiLCJpZCI6MjgzNTcxLCJpYXQiOjE3NDE3NzM3MDl9.sT6vwcKf_lB8lGer8FuVhD4g5WA-5umnnKA3iMjvwJY';  // ← YOUR KEY HERE

//Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_TOKEN'; // REPLACE

const sessionId = Math.random().toString(36).substr(2, 9);
document.getElementById('session-id').textContent = `Session ID: ${sessionId}`;

const viewer = new Cesium.Viewer('cesiumContainer', {
    sceneMode: Cesium.SceneMode.SCENE2D,
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    fullscreenButton: false
});

const socket = io();
let slaves = [];

// Register as master
socket.emit('register_master', { session_id: sessionId });

// Listen for grid updates
socket.on('slave_registered', (data) => {
    console.log(`Slave registered at col=${data.col}, row=${data.row}`);
    slaves.push({ sid: data.sid, col: data.col, row: data.row });
});

// Throttle camera updates to avoid flooding
let isUpdating = false;
viewer.camera.changed.addEventListener(() => {
    if (isUpdating) return;
    isUpdating = true;
    setTimeout(() => { isUpdating = false; }, 50);

    const rectangle = viewer.camera.computeViewRectangle();
    const west = Cesium.Math.toDegrees(rectangle.west);
    const south = Cesium.Math.toDegrees(rectangle.south);
    const east = Cesium.Math.toDegrees(rectangle.east);
    const north = Cesium.Math.toDegrees(rectangle.north);

    // Calculate grid dimensions
    const maxCol = Math.max(...slaves.map(s => s.col)) || 0;
    const maxRow = Math.max(...slaves.map(s => s.row)) || 0;
    const totalCols = maxCol + 1;
    const totalRows = maxRow + 1;

    const cellWidth = (east - west) / totalCols;
    const cellHeight = (north - south) / totalRows;

    // Send viewport to each slave
    slaves.forEach(slave => {
        const viewWest = west + (slave.col * cellWidth);
        const viewEast = viewWest + cellWidth;
        const viewSouth = south + (slave.row * cellHeight);
        const viewNorth = viewSouth + cellHeight;

        socket.emit('update_slave_view', {
            slave_sid: slave.sid,
            view_data: {
                west: viewWest,
                south: viewSouth,
                east: viewEast,
                north: viewNorth
            }
        });
    });
});