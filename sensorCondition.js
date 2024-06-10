// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCF6OCzcKwrDS4W3JEiBVnZeiw4ACS5qYk",
    authDomain: "fire-alarm-monitoring-sy-be36f.firebaseapp.com",
    databaseURL: "https://fire-alarm-monitoring-sy-be36f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fire-alarm-monitoring-sy-be36f",
    storageBucket: "fire-alarm-monitoring-sy-be36f.appspot.com",
    messagingSenderId: "238251501710",
    appId: "1:238251501710:web:22e10e60b945a4879201df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get references to each room condition
const roomRefs = [
    'L101', 'L102', 'L103', 'L104',
    'L201', 'L202', 'L203', 'L204'
].map(room => ref(database, `Current_Data/${room}`));

// Get the canvas element
const canvas = document.getElementById('sensorCanvas');
const ctx = canvas.getContext('2d');

// Define room size and spacing
const roomSize = 200;
const spacing = 50;
const levelSpacing = 50; // Additional spacing between levels

// Function to draw room based on condition and display additional info below the room
function drawRoom(x, y, roomData, roomNumber) {
    let roomTextColor = 'white';
    // Draw room
    if (roomData.Smoke === 'High' && roomData.Temp === 'High') {
        // If both smoke and temperature are high, draw red
        ctx.fillStyle = 'red';
    } else if (roomData.Smoke === 'Low' && roomData.Temp === 'Low') {
        // If conditions are not high, draw blue
        ctx.fillStyle = 'blue';
    } else {
        ctx.fillStyle = 'yellow';
        roomTextColor = 'black'
    }
    ctx.fillRect(x, y, roomSize, roomSize);
    
    // Draw room number in the center
    ctx.fillStyle = roomTextColor;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Room ${roomNumber}`, x + roomSize / 2, y + roomSize / 2);

    // Draw room condition text below the room and centered
    ctx.fillStyle = 'black';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center'; // Center align text
    ctx.fillText(`Smoke: ${roomData.Smoke}`, x + roomSize / 2, y + roomSize + 20);
    ctx.fillText(`Temp: ${roomData.Temp}`, x + roomSize / 2, y + roomSize + 40);
}

// Function to draw all rooms
function drawAllRooms(roomDataArray) {
    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const levels = ['Level 1', 'Level 2'];

    levels.forEach((level, levelIndex) => {
        // Draw level text
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial'; // Bold the text
        ctx.textAlign = 'left'; // Align text to the left
        const yOffset = levelIndex * (roomSize + spacing * 2 + levelSpacing); // Adjust y position for levels
        ctx.fillText(level, 10, yOffset + 20); // Position the level text

        // Draw rooms for each level
        for (let i = 0; i < 4; i++) {
            const roomIndex = levelIndex * 4 + i;
            const roomData = roomDataArray[roomIndex];
            const row = levelIndex; // Calculate row index
            const col = i; // Calculate column index
            const x = 10 + col * (roomSize + spacing); // Calculate x position
            const y = row * (roomSize + spacing * 2 + levelSpacing) + 50; // Calculate y position with extra spacing for info
            const roomNumber = `L${levelIndex + 1}0${i + 1}`; // Format room number as L01-01, L02-04
            drawRoom(x, y, roomData, roomNumber); // Pass formatted room number to drawRoom
        }
    });
}

// Listen for changes in room conditions and update the canvas
const roomDataArray = new Array(roomRefs.length).fill(null);

roomRefs.forEach((ref, index) => {
    onValue(ref, (snapshot) => {
        roomDataArray[index] = snapshot.val();
        drawAllRooms(roomDataArray);
    });
});

// Set canvas size based on the number of rooms and spacing
const canvasWidth = 4 * (roomSize + spacing);
const canvasHeight = 2 * (roomSize + spacing * 2 + levelSpacing) + 0; // Add extra height for info and levels
canvas.width = canvasWidth;
canvas.height = canvasHeight;
