import { auth, db } from './firebase.js';
import { collection, getDocs, orderBy, query, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const leaderboardContainer = document.getElementById('leaderboard-list');

const fetchLeaderboard = async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("sessions", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    
    leaderboardContainer.innerHTML = '';
    
    querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        const rank = index + 1;
        
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-4 glass-card rounded-lg mb-3';
        item.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-2xl font-bold text-purple-400">#${rank}</span>
                <div>
                    <p class="font-semibold">${data.email.split('@')[0]}</p>
                    <p class="text-sm text-gray-400">${data.sessions} sessions</p>
                </div>
            </div>
            <div class="text-right">
                <span class="text-2xl font-bold text-pink-400">${data.streak || 0}</span>
                <p class="text-xs text-gray-400">streak</p>
            </div>
        `;
        
        leaderboardContainer.appendChild(item);
    });
};

fetchLeaderboard();