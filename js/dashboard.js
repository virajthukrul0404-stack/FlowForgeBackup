import { auth, db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import Chart from 'chart.js/auto';

const user = auth.currentUser;
if (!user) window.location.href = 'login.html';

// Fetch User Data
const fetchUserData = async () => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    
    // Update DOM elements
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('streak-count').textContent = data.streak || 0;
    document.getElementById('sessions-count').textContent = data.sessions || 0;
    
    // Initialize Chart
    initChart(data.sessions || 0);
};

const initChart = (totalSessions) => {
    const ctx = document.getElementById('focus-chart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Focus Minutes',
                data: [25, 50, 75, 100, 125, 150, 175],
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
};

// Initialize
fetchUserData();