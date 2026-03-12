import { db } from './firebase.js';
import { doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const checkAndUpdateStreak = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const lastStudyDate = data.lastStudyDate; // ISO String
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (lastStudyDate === today) {
        // Already studied today
        return;
    }

    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastStudyDate === yesterdayStr) {
        // Consecutive day, increment streak
        await updateDoc(userRef, {
            streak: data.streak + 1,
            lastStudyDate: today
        });
    } else {
        // Streak broken, reset to 1
        await updateDoc(userRef, {
            streak: 1,
            lastStudyDate: today
        });
    }
};