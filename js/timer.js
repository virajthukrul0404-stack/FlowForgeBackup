import { auth, db } from './firebase.js';
import { doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { checkAndUpdateStreak } from './streak.js';

let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;

// DOM Elements
const display = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

// Format time MM:SS
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const updateDisplay = () => {
    display.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - FlowForge`;
};

const startTimer = () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            completeSession();
        }
    }, 1000);
};

const pauseTimer = () => {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
};

const resetTimer = () => {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 25 * 60;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    document.title = "FlowForge";
};

const completeSession = async () => {
    clearInterval(timerInterval);
    isRunning = false;
    alert("Session Complete! Great job.");
    
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        
        // Update session count
        await updateDoc(userRef, {
            sessions: increment(1)
        });

        // Update streak
        await checkAndUpdateStreak(user.uid);
    }

    resetTimer();
};

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize
updateDisplay();