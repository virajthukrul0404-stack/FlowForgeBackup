import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const roomForm = document.getElementById('room-form');
const roomList = document.getElementById('room-list');

const createRoom = async (e) => {
    e.preventDefault();
    const roomName = document.getElementById('room-name').value;
    
    if (!roomName) return;
    
    try {
        await addDoc(collection(db, "rooms"), {
            roomName: roomName,
            creatorId: auth.currentUser.uid,
            participants: [auth.currentUser.uid],
            createdAt: new Date().toISOString()
        });
        
        roomForm.reset();
        fetchRooms();
    } catch (error) {
        console.error("Error creating room:", error);
    }
};

const fetchRooms = async () => {
    const roomsRef = collection(db, "rooms");
    const querySnapshot = await getDocs(roomsRef);
    
    roomList.innerHTML = '';
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const item = document.createElement('div');
        item.className = 'p-4 glass-card rounded-lg mb-3 flex justify-between items-center';
        item.innerHTML = `
            <div>
                <h3 class="font-bold text-lg">${data.roomName}</h3>
                <p class="text-sm text-gray-400">${data.participants.length} participants</p>
            </div>
            <button class="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                Join
            </button>
        `;
        
        roomList.appendChild(item);
    });
};

roomForm.addEventListener('submit', createRoom);
fetchRooms();