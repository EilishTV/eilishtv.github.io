import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = { 
    /* Asegúrate de completar esto con tus credenciales */ 
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("profileOverlay");
    const profilesContainer = document.getElementById("profiles");

    if (!overlay || !profilesContainer) return;

    // ============================================
    // FUNCIÓN: MOSTRAR OVERLAY DE PERFILES
    // ============================================
    async function showProfilesOverlay(user) {
        overlay.style.display = "flex";

        const profilesRef = collection(db, "users", user.uid, "profiles");
        const snapshot = await getDocs(profilesRef);
        const profiles = snapshot.docs.map(doc => doc.data());

        profilesContainer.innerHTML = "";

        // 1. Renderizar cada perfil existente
        profiles.forEach(profile => {
            const wrapper = document.createElement("div");
            wrapper.className = "profileWrapper";

            const avatar = document.createElement("div");
            avatar.className = "avatar";
            const avatarUrl = profile.avatar || "/images/avatars/avatar1.jpeg";

            avatar.style.backgroundImage = `url(${avatarUrl})`;
            avatar.style.backgroundSize = "cover";
            avatar.style.backgroundPosition = "center";

            const name = document.createElement("div");
            name.className = "profileName";
            name.textContent = profile.name;

            wrapper.appendChild(avatar);
            wrapper.appendChild(name);

            wrapper.addEventListener("click", () => {
                if (window.updateNavAvatars) {
                    window.updateNavAvatars(avatarUrl, profile.name);
                }
                sessionStorage.setItem("profileSelected", "true");
                overlay.style.display = "none";
            });

            profilesContainer.appendChild(wrapper);
        });

        // 2. Botón Añadir Perfil (Lleva a la creación en la pestaña de cuenta)
        if (profiles.length < 5) {
            const addProfile = document.createElement("div");
            addProfile.className = "profileWrapper addProfile";
            
            const addAvatar = document.createElement("div");
            addAvatar.className = "avatar addAvatar";
            addAvatar.innerHTML = '<i class="fas fa-plus"></i>'; // Icono de suma
            
            const addName = document.createElement("div");
            addName.className = "profileName";
            addName.textContent = "Añadir";

            addProfile.appendChild(addAvatar);
            addProfile.appendChild(addName);
            
            addProfile.addEventListener("click", () => {
                // Te lleva directamente a la pestaña de perfiles en tu account.html
                window.location.href = "/account/#profiles";
            });
            profilesContainer.appendChild(addProfile);
        }

        // 3. Botón Editar Perfiles (Lleva a la página de perfil dedicada)
        let editBtn = document.querySelector(".editProfileBtn");
        if (!editBtn) {
            editBtn = document.createElement("button");
            editBtn.className = "editProfileBtn";
            editBtn.textContent = "Editar perfiles";
            editBtn.addEventListener("click", () => {
                // Te lleva a la página dedicada de edición (/profile/)
                window.location.href = "/profile/";
            });
            overlay.appendChild(editBtn);
        }
    }

    // ============================================
    // LÓGICA DE ESTADO DE AUTENTICACIÓN
    // ============================================
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            sessionStorage.removeItem("profileSelected");
            return;
        }

        // Si ya seleccionó perfil en esta sesión, no mostramos el overlay
        if (sessionStorage.getItem("profileSelected") === "true") {
            overlay.style.display = "none";
            return;
        }

        await showProfilesOverlay(user);
    });

    // ============================================
    // ABRIR MANUALMENTE DESDE NAVBAR
    // ============================================
    const openProfilesBtn = document.getElementById("openProfiles");
    openProfilesBtn?.addEventListener("click", async () => {
        sessionStorage.removeItem("profileSelected");
        const user = auth.currentUser;
        if (!user) return;
        await showProfilesOverlay(user);
    });
});