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


// =======================================
// INIT
// =======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

await setPersistence(auth, browserLocalPersistence);


// =======================================
// ERROR HANDLER
// =======================================

function showError(message) {

    const el = document.getElementById("formError");

    if (el) {
        el.textContent = message;
    }
}

function clearError() {

    const el = document.getElementById("formError");

    if (el) {
        el.textContent = "";
    }
}


// =======================================
// GET PROFILE
// =======================================

async function getUserProfile(uid) {

    const profilesRef =
        collection(db, "users", uid, "profiles");

    const q =
        query(profilesRef, where("main", "==", true));

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
// SIGN UP
// =======================================

const registerBtn =
    document.querySelector(".continueBtn");

registerBtn?.addEventListener("click", async () => {

    clearError();

    try {

        // =======================================
        // EMAIL (VIENE DE TEXT, NO INPUT)
        // =======================================

        const email =
            document.getElementById("userEmail")
                ?.textContent
                .trim();

        const password =
            document.getElementById("password")
                ?.value
                .trim();

        const name =
            document.getElementById("userName")
                ?.value
                .trim();

        // =======================================
        // VALIDACIÓN
        // =======================================

        if (!email || !password || !name) {
            showError("Please complete all fields.");
            return;
        }

        if (password.length < 6) {
            showError("Password must contain at least 6 characters.");
            return;
        }

        // =======================================
        // FIREBASE AUTH
        // =======================================

        const cred =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = cred.user;

        // =======================================
        // UPDATE PROFILE AUTH
        // =======================================

        await updateProfile(user, {
            displayName: name,
            photoURL: "/images/avatars/default.png"
        });

        // =======================================
        // EMAIL VERIFICATION
        // =======================================

        await sendEmailVerification(user);

        // =======================================
        // FIRESTORE PROFILE
        // =======================================

        const profilesRef =
            collection(db, "users", user.uid, "profiles");

        const profileDoc =
            doc(profilesRef);

        await setDoc(profileDoc, {
            name,
            avatar: "/images/avatars/default.png",
            main: true,
            createdAt: new Date()
        });

        // =======================================
        // LOCAL STORAGE (NAV FIX INMEDIATO)
        // =======================================

        localStorage.setItem("navProfileName", name);

        localStorage.setItem(
            "navProfileAvatar",
            "/images/avatars/default.png"
        );

        // =======================================
        // REDIRECT
        // =======================================

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

const loginBtn =
    document.getElementById("loginBtn");

loginBtn?.addEventListener("click", async () => {

    clearError();

    try {

        const email =
            document.getElementById("emailInput")
            ?.value
            .trim();

        const password =
            document.getElementById("passwordInput")
            ?.value
            .trim();

        if (!email || !password) {

            showError(
                "Please enter email and password."
            );

            return;
        }

        const cred =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = cred.user;

        // =======================================
        // EMAIL VERIFY CHECK
        // =======================================

        if (!user.emailVerified) {

            showError("Verify your email first.");

            await signOut(auth);

            return;
        }

        // =======================================
        // GET PROFILE
        // =======================================

        const profile =
            await getUserProfile(user.uid);

        // =======================================
        // SAVE LOCAL STORAGE
        // =======================================

        localStorage.setItem(
            "navProfileName",
            profile?.name || "User"
        );

        localStorage.setItem(
            "navProfileAvatar",
            profile?.avatar ||
            "/images/avatars/default.png"
        );

        // =======================================
        // REDIRECT
        // =======================================

        window.location.href = "/browse/";

    } catch (err) {

        console.error(err);

        showError(
            "Incorrect email or password."
        );
    }

});


// =======================================
// AUTH STATE
// =======================================

onAuthStateChanged(auth, async (user) => {

    console.log("[AUTH]", user);

    window.currentUser = user || null;

    const path =
        window.location.pathname;

    // =======================================
    // NO USER
    // =======================================

    if (!user) {

        console.log("[AUTH] no user");

        localStorage.removeItem(
            "navProfileName"
        );

        localStorage.removeItem(
            "navProfileAvatar"
        );

        if (
            path.startsWith("/browse") ||
            path.startsWith("/profile") ||
            path.startsWith("/account")
        ) {

            window.location.href =
                "/identify/";
        }

        return;
    }

    // =======================================
    // EMAIL NOT VERIFIED
    // =======================================

    if (
        !user.emailVerified &&
        !path.includes("verify")
    ) {

        console.log(
            "[AUTH] email not verified"
        );

        window.location.href =
            "/identify/verify/";

        return;
    }

    try {

        // =======================================
        // GET PROFILE
        // =======================================

        const profile =
            await getUserProfile(user.uid);

        console.log("[PROFILE]", profile);

        // =======================================
        // UPDATE STORAGE
        // =======================================

        localStorage.setItem(
            "navProfileName",
            profile?.name ||
            user.displayName ||
            "User"
        );

        localStorage.setItem(
            "navProfileAvatar",
            profile?.avatar ||
            user.photoURL ||
            "/images/avatars/default.png"
        );

    } catch (err) {

        console.error(
            "[AUTH PROFILE ERROR]",
            err
        );
    }

});


// =======================================
// GLOBAL LOGOUT
// =======================================

window.logoutUser = async function () {

    try {

        localStorage.removeItem(
            "navProfileName"
        );

        localStorage.removeItem(
            "navProfileAvatar"
        );

        await signOut(auth);

        window.location.href =
            "/identify/";

    } catch (err) {

        console.error(
            "[LOGOUT ERROR]",
            err
        );
    }

};


// =======================================
// EXPORT
// =======================================

export { auth, db };