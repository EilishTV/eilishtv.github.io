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
    sendEmailVerification,
    signInAnonymously,
    sendPasswordResetEmail, // <-- IMPORTACIÓN AÑADIDA AQUÍ
    EmailAuthProvider,           // <-- AÑADIDO AQUÍ
    reauthenticateWithCredential, // <-- AÑADIDO AQUÍ
    deleteUser                    // <-- AÑADIDO AQUÍ
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

window.miAuthFirebase = auth;


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
        sessionStorage.setItem(
    "needsVerify",
    "true"
);

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
// GUEST LOGIN
// =======================================

const guestBtn =
    document.getElementById("guestBtn");

guestBtn?.addEventListener("click", async () => {

    clearError();

    try {

        const cred =
            await signInAnonymously(auth);

        const user =
            cred.user;

        console.log(
            "[GUEST LOGIN]",
            user
        );

        localStorage.setItem(
            "navProfileName",
            "Guest"
        );

        localStorage.setItem(
            "navProfileAvatar",
            "/images/avatars/default.png"
        );

        window.location.href =
            "/browse/";

    } catch (err) {

        console.error(
            "[GUEST LOGIN ERROR]",
            err
        );

        showError(
            "Guest login failed."
        );
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

const needsVerify =
    sessionStorage.getItem(
        "needsVerify"
    );

if (
    !user.emailVerified &&
    !user.isAnonymous &&
    !path.includes("verify") &&
    needsVerify === "true"
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
            "Guest"
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
// PASSWORD RESET (FORGOT PASSWORD)
// =======================================

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

forgotPasswordBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    clearError();

    const email = document.getElementById("emailInput")?.value.trim();
    const el = document.getElementById("formError");

    if (!email) {
        if (el) el.classList.remove("success"); // Asegura que sea rojo
        showError("Please enter your email to reset password.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        
        // Si todo sale bien, añadimos la clase 'success' para ponerlo en verde
        if (el) el.classList.add("success");
        showError("Reset email sent! Please check your inbox.");

    } catch (err) {
        console.error("[PASSWORD RESET ERROR]", err);
        
        // Si hay error, removemos la clase 'success' para que vuelva a ser rojo
        if (el) el.classList.remove("success");

        if (err.code === "auth/invalid-email") {
            showError("The email address is not valid.");
        } else if (err.code === "auth/user-not-found") {
            showError("There is no user registered with this email.");
        } else {
            showError("Failed to send reset email. Try again.");
        }
    }
});

// =======================================
// ELIMINAR CUENTA CON MODAL REAL (SIN ALERTAS)
// =======================================

document.addEventListener('click', async (event) => {
    
    if (event.target && event.target.id === 'deleteAccountBtn') {
        
        // 1. Creamos e inyectamos la estructura del Modal dinámicamente en el HTML
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'custom-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="custom-modal-box">
                <h3>Eliminar Cuenta</h3>
                <p>¿Estás completamente seguro de que deseas eliminar tu cuenta de EilishTV? Esta acción borrará todos tus datos y no se puede deshacer.</p>
                
                <input type="password" id="modalPasswordInput" class="custom-modal-input" placeholder="Introduce tu contraseña actual" required>
                
                <div class="custom-modal-actions">
                    <button id="modalCancelBtn" class="custom-modal-btn custom-modal-btn-cancel">Cancelar</button>
                    <button id="modalConfirmBtn" class="custom-modal-btn custom-modal-btn-danger">Confirmar Baja</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        
        // Retraso mínimo para activar la animación de entrada de CSS (fade-in)
        setTimeout(() => modalOverlay.classList.add('active'), 10);

        // Referencias a los elementos internos del modal creado
        const cancelBtn = modalOverlay.querySelector('#modalCancelBtn');
        const confirmBtn = modalOverlay.querySelector('#modalConfirmBtn');
        const passwordInput = modalOverlay.querySelector('#modalPasswordInput');

        // Función reutilizable para cerrar y destruir el modal con transición suave
        const cerrarModal = () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => modalOverlay.remove(), 250); // Espera que termine la animación
        };

        // Si hace clic en Cancelar, cerramos todo
        cancelBtn.addEventListener('click', cerrarModal);

        // Si hace clic en Confirmar Baja, procesamos con Firebase
        confirmBtn.addEventListener('click', async () => {
            const password = passwordInput.value.trim();
            
            // Validación visual de campo vacío utilizando el CSS de error
            if (!password) {
                passwordInput.classList.add('input-error');
                passwordInput.focus();
                setTimeout(() => passwordInput.classList.remove('input-error'), 400);
                return;
            }

            try {
                // Instancia global o local de auth de tu script
                const usuarioActual = auth ? auth.currentUser : null;

                if (!usuarioActual) {
                    passwordInput.placeholder = "No hay sesión activa.";
                    cerrarModal();
                    return;
                }

                // Deshabilitamos los controles del modal mientras procesa Firebase
                confirmBtn.disabled = true;
                cancelBtn.disabled = true;
                passwordInput.disabled = true;
                confirmBtn.innerText = "Procesando...";

                // 2. Creamos la credencial de autenticación con la contraseña del modal
                const credencial = EmailAuthProvider.credential(usuarioActual.email, password);

                // 3. Reautenticación en caliente ante Firebase
                await reauthenticateWithCredential(usuarioActual, credencial);

                // 4. Eliminación definitiva de la cuenta en Authentication
                await deleteUser(usuarioActual);

                // 5. Limpieza de datos en LocalStorage de la interfaz
                localStorage.removeItem("navProfileName");
                localStorage.removeItem("navProfileAvatar");

                // Cerramos el modal de forma limpia antes de redirigir
                cerrarModal();
                window.location.href = "/"; 

            } catch (error) {
                console.error("[DELETE ACCOUNT ERROR]", error);
                
                // Si la clave está mal, le damos feedback visual con la animación CSS 'shake'
                if (error.code === 'auth/wrong-password') {
                    passwordInput.classList.add('input-error');
                    passwordInput.value = '';
                    passwordInput.placeholder = "Contraseña incorrecta, reintenta.";
                    
                    // Remueve la clase de error para que la animación pueda volver a ejecutarse si se equivoca de nuevo
                    setTimeout(() => passwordInput.classList.remove('input-error'), 400);

                    // Rehabilitamos los controles para el nuevo intento
                    confirmBtn.disabled = false;
                    cancelBtn.disabled = false;
                    passwordInput.disabled = false;
                    confirmBtn.innerText = "Confirmar Baja";
                    passwordInput.focus();
                } else {
                    // Cualquier otro error se muestra en el mismo placeholder de texto de forma discreta
                    passwordInput.value = '';
                    passwordInput.disabled = false;
                    confirmBtn.disabled = false;
                    cancelBtn.disabled = false;
                    confirmBtn.innerText = "Confirmar Baja";
                    passwordInput.placeholder = "Error al procesar baja.";
                }
            }
        });
    }
});

// =======================================
// EXPORT
// =======================================

export { auth, db };