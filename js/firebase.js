import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Navigation Logic ---
const updateNav = () => {
    const navContainer = document.getElementById('nav-buttons');
    if (!navContainer) return; // Not on index.html

    const user = auth.currentUser;
    if (user) {
        navContainer.innerHTML = `
            <button onclick="logout()" class="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">
                Logout
            </button>
        `;
    } else {
        navContainer.innerHTML = `
            <button onclick="window.location.href='login.html'" class="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">
                Login
            </button>
        `;
    }
};

// --- Auth Logic ---

// Register
export const register = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            sessions: 0,
            streak: 0,
            lastStudyDate: null,
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error("Registration Error:", error);
        throw error;
    }
};

// Login
export const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

// Logout
export const logout = async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    updateNav();
    
    // Redirect logic
    if (user) {
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // If on protected pages, redirect to login
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('timer.html') || 
            window.location.pathname.includes('leaderboard.html') ||
            window.location.pathname.includes('rooms.html')) {
            window.location.href = 'login.html';
        }
    }
});