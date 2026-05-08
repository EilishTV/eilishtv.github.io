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
// SIGN UP
// =======================================

const registerBtn = document.querySelector(".continueBtn");

registerBtn?.addEventListener("click", async () => {

    clearError();

    try {

        const email = localStorage.getItem("signupEmail");
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
            photoURL: "/images/avatars/avatar1.jpeg"
        });

        await sendEmailVerification(user);

        const profilesRef = collection(db, "users", user.uid, "profiles");
        const profileDoc = doc(profilesRef);

        await setDoc(profileDoc, {
            name: name,
            avatar: "/images/avatars/avatar1.jpeg",
            main: true,
            createdAt: new Date()
        });

        localStorage.removeItem("signupEmail");

        window.location.href = "/identify/verify/";

    } catch (err) {

        console.error("Signup error:", err);

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

        console.error("Login error:", err);
        showError("Incorrect email or password.");

    }

});


// =======================================
// AUTH STATE (BÁSICO)
// =======================================

onAuthStateChanged(auth, (user) => {

    // 🔥 guardar user globalmente para toda la app
    window.currentUser = user || null;

    const path = window.location.pathname;

    if (user) {

        // si no verificó email → lo mandás a verify
        if (!user.emailVerified && !path.includes("verify")) {
            window.location.href = "/identify/verify/";
            return;
        }

    } else {

        // si no está logueado → bloquear zonas privadas
        if (path.startsWith("/browse") || path.startsWith("/profile")) {
            window.location.href = "/identify/";
            return;
        }

    }

});


// =======================================
// LOGOUT
// =======================================

document.addEventListener("click", async (e) => {

    if (e.target.id === "logoutBtn") {

        await signOut(auth);

        localStorage.removeItem("navProfileName");
        localStorage.removeItem("navProfileAvatar");
        sessionStorage.removeItem("profileSelected");

        window.location.href = "/identify/";

    }

});


// =======================================
// EXPORT
// =======================================

export { auth };

const emailEl = document.getElementById("userEmail");
if(emailEl && user.email){
    emailEl.textContent = user.email;
}