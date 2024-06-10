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

// Get the canvas element
const canvas = document.getElementById('firealarmCanvas');
const ctx = canvas.getContext('2d');

// Define room size and spacing
const roomSize = 200;
const spacing = 50;
const levelSpacing = 170; // Additional spacing between levels

// Function to draw room based on water spray condition
function drawRoom(x, y, waterSpray, roomNumber) {
    let roomTextColor = 'white';
    // Draw room
    ctx.fillStyle = waterSpray === 'On' ? 'red' : 'blue';
    ctx.fillRect(x, y, roomSize, roomSize);
    
    // Draw room number in the center
    ctx.fillStyle = roomTextColor;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Room ${roomNumber}`, x + roomSize / 2, y + roomSize / 2);

    // Draw water spray status below the room and centered
    ctx.fillStyle = 'black';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center'; // Center align text
    ctx.fillText(`WaterSpray: ${waterSpray}`, x + roomSize / 2, y + roomSize + 20);
}

// Function to draw buzzer graphic
function drawBuzzer(x, y, buzzerStatus, level) {
    // Draw buzzer square
    ctx.fillStyle = buzzerStatus === 'On' ? 'red' : 'green';
    ctx.fillRect(x, y, roomSize, roomSize);

    // Draw buzzer text
    ctx.fillStyle = 'black';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Buzzer: ${buzzerStatus}`, x + roomSize / 2, y + roomSize + 20);

    // Draw level number at the middle
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(level, x + roomSize / 2, y + roomSize / 2);
}

// Function to draw all rooms and buzzer status
function drawAllRooms(waterSprayArray, buzzerArray) {
    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const levels = ['Level 1', 'Level 2'];
    const buzzers = ['Buzzer 1', 'Buzzer 2'];

    levels.forEach((level, levelIndex) => {
        // Draw level text
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        const yOffset = levelIndex * (roomSize + spacing * 2 + levelSpacing);
        ctx.fillText(level, 10, yOffset + 20);

        // Draw buzzer for each level
        const buzzerStatus = buzzerArray[levelIndex];
        const x = 10; // X position for buzzer
        const y = yOffset + 50; // Y position for buzzer
        const buzzerText = buzzers[levelIndex];
        drawBuzzer(x, y, buzzerStatus, buzzerText); // Draw buzzer

        // Draw rooms for each level
        for (let i = 0; i < 4; i++) {
            const roomIndex = levelIndex * 4 + i;
            const waterSpray = waterSprayArray[roomIndex];
            const row = levelIndex;
            const col = i;
            const x = 60 + col * (roomSize + spacing) + 200;
            const y = row * (roomSize + spacing * 2 + levelSpacing) + 50;
            const roomNumber = `L${levelIndex + 1}0${i + 1}`;
            drawRoom(x, y, waterSpray, roomNumber);
        }
    });
}

// Firebase references for water spray status
const roomRefs = [
    'FireAlarm/L1/WaterSpray/L101', 'FireAlarm/L1/WaterSpray/L102', 'FireAlarm/L1/WaterSpray/L103', 'FireAlarm/L1/WaterSpray/L104',
    'FireAlarm/L2/WaterSpray/L201', 'FireAlarm/L2/WaterSpray/L202', 'FireAlarm/L2/WaterSpray/L203', 'FireAlarm/L2/WaterSpray/L204'
].map(path => ref(database, path));

// Firebase references for buzzer status
const buzzerRefs = [
    ref(database, 'FireAlarm/L1/Buzzer'),
    ref(database, 'FireAlarm/L2/Buzzer')
];

// Listen for changes in water spray status, and update the canvas
const waterSprayArray = new Array(roomRefs.length).fill(null);
roomRefs.forEach((ref, index) => {
    onValue(ref, (snapshot) => {
        waterSprayArray[index] = snapshot.val();
        drawAllRooms(waterSprayArray, buzzerArray);
    });
});

// Listen for changes in buzzer status, and update the canvas
const buzzerArray = new Array(buzzerRefs.length).fill(null);
buzzerRefs.forEach((ref, index) => {
    onValue(ref, (snapshot) => {
        buzzerArray[index] = snapshot.val();
        drawAllRooms(waterSprayArray, buzzerArray);
    });
});

// Set canvas size based on the number of rooms and spacing
const canvasWidth = 4 * (roomSize + spacing) + 300;
const canvasHeight = 2 * (roomSize + spacing * 2 + levelSpacing) + 0; // Add extra height for info and levels
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Firebase reference for system status
const statusRef = ref(database, 'System/Status');

// Listen for changes in system status and update the icon
const statusIcon = document.getElementById('statusIcon');
onValue(statusRef, (snapshot) => {
    const status = snapshot.val();
    if (status === 'Off') {
        statusIcon.src = 'img/Sys_Off.png';
    } else if (status === 'On') {
        statusIcon.src = 'img/Sys_On.png';
    }
});

// Firebase reference for emergency status
const emergencyRef = ref(database, 'System/Emergency');

// Listen for changes in emergency status and update the emergency icon and text
const emergencyCondition = document.getElementById('emergencyCondition');
const emergencyIcon = document.getElementById('emergencyIcon');
onValue(emergencyRef, (snapshot) => {
    const emergencyStatus = snapshot.val();
    if (emergencyStatus === 'On') {
        emergencyCondition.style.display = 'block';
        emergencyIcon.style.display = 'block'; // Show the emergency icon
        emergencyIcon.src = 'img/emergency.png'; // Set the source of the emergency icon image
    } else {
        emergencyCondition.style.display = 'none';
        emergencyIcon.style.display = 'none'; // Hide the emergency icon
    }
});
