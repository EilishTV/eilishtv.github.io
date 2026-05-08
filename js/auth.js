// =======================================
// FIREBASE IMPORTS
// =======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut,
    setPersistence,
    browserLocalPersistence,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =======================================
// FIREBASE CONFIG
// =======================================

const firebaseConfig = {
    apiKey: "AIzaSyC3x7H9-JliDqEha3P-Ne_X9FyIFmxw7ec",
    authDomain: "eilishtv-935ee.firebaseapp.com",
    projectId: "eilishtv-935ee",
    storageBucket: "eilishtv-935ee.firebasestorage.app",
    messagingSenderId: "95065190642",
    appId: "1:95065190642:web:7174eb5746a591ebdce06b",
    measurementId: "G-TQFR3YRJJ6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await setPersistence(auth, browserLocalPersistence);


// =======================================
// ERROR HANDLER
// =======================================

function showError(message) {
    const el = document.getElementById("formError");
    if (el) el.textContent = message;
}

function clearError() {
    const el = document.getElementById("formError");
    if (el) el.textContent = "";
}


// =======================================
// FIRESTORE PROFILE FETCH
// =======================================

async function getUserProfile(uid) {
    const profilesRef = collection(db, "users", uid, "profiles");
    const q = query(profilesRef, where("main", "==", true));
    const snap = await getDocs(q);

    if (!snap.empty) {
        return snap.docs[0].data();
    }

    return {
        name: "User",
        avatar: "/images/avatars/default.png"
    };
}


// =======================================
// NAV UI SYNC (FIREBASE ONLY)
// =======================================

function updateNavUI(user, profile) {
    const navAvatars = document.querySelectorAll(".navAvatar");
    const userImg = document.querySelector(".userImg");
    const navName = document.getElementById("navProfileName");
    const emailEl = document.getElementById("userEmail");

    const name = profile?.name || user.displayName || "User";
    const avatar = profile?.avatar || user.photoURL || "/images/avatars/default.png";

    if (navName) navName.textContent = name;

    navAvatars.forEach(img => {
        if (img) img.src = avatar;
    });

    if (userImg) userImg.src = avatar;

    if (emailEl && user?.email) {
        emailEl.textContent = user.email;
    }
}


// =======================================
// SIGN UP
// =======================================

const registerBtn = document.querySelector(".continueBtn");

registerBtn?.addEventListener("click", async () => {

    clearError();

    try {

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value.trim();
        const name = document.getElementById("userName")?.value.trim();

        if (!email || !password || !name) {
            showError("Please complete all fields.");
            return;
        }

        if (password.length < 6) {
            showError("Password must contain at least 6 characters.");
            return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        await updateProfile(user, {
            displayName: name,
            photoURL: "/images/avatars/default.png"
        });

        await sendEmailVerification(user);

        const profilesRef = collection(db, "users", user.uid, "profiles");
        const profileDoc = doc(profilesRef);

        await setDoc(profileDoc, {
            name,
            avatar: "/images/avatars/default.png",
            main: true,
            createdAt: new Date()
        });

        window.location.href = "/identify/verify/";

    } catch (err) {

        console.error(err);

        if (err.code === "auth/email-already-in-use") {
            showError("This email is already registered.");
        } else {
            showError("Something went wrong.");
        }

    }

});


// =======================================
// LOGIN
// =======================================

const loginBtn = document.getElementById("loginBtn");

loginBtn?.addEventListener("click", async () => {

    clearError();

    try {

        const email = document.getElementById("emailInput")?.value.trim();
        const password = document.getElementById("passwordInput")?.value.trim();

        if (!email || !password) {
            showError("Please enter email and password.");
            return;
        }

        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        if (!user.emailVerified) {
            showError("Verify your email first.");
            await signOut(auth);
            return;
        }

        window.location.href = "/browse/";

    } catch (err) {
        console.error(err);
        showError("Incorrect email or password.");
    }

});


// =======================================
// AUTH STATE (SOURCE OF TRUTH)
// =======================================

onAuthStateChanged(auth, async (user) => {

    window.currentUser = user || null;

    const path = window.location.pathname;

    if (!user) {
        if (path.startsWith("/browse") || path.startsWith("/profile")) {
            window.location.href = "/identify/";
        }
        return;
    }

    if (!user.emailVerified && !path.includes("verify")) {
        window.location.href = "/identify/verify/";
        return;
    }

    const profile = await getUserProfile(user.uid);

    updateNavUI(user, profile);
});


// =======================================
// LOGOUT
// =======================================

document.addEventListener("click", async (e) => {
    if (e.target.id === "logoutBtn") {
        await signOut(auth);
        window.location.href = "/identify/";
    }
});


// =======================================
// EXPORT
// =======================================

export { auth };