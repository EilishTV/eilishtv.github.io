import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tu configuración de Firebase (Asegúrate de que coincida con auth.js)
const firebaseConfig = { 
    apiKey: "AIzaSyC3x7H9-JliDqEha3P-Ne_X9FyIFmxw7ec",
    authDomain: "eilishtv-935ee.firebaseapp.com",
    projectId: "eilishtv-935ee",
    storageBucket: "eilishtv-935ee.firebasestorage.app",
    messagingSenderId: "95065190642",
    appId: "1:95065190642:web:644917173b2221b66b07c8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("profileOverlay");
    const profilesContainer = document.getElementById("profiles");

    if (!overlay || !profilesContainer) return;

    async function showProfilesOverlay(user) {
        overlay.style.display = "flex";
        profilesContainer.innerHTML = "<p>Cargando perfiles...</p>";

        try {
            const profilesRef = collection(db, "users", user.uid, "profiles");
            const snapshot = await getDocs(profilesRef);
            const profiles = snapshot.docs.map(doc => doc.data());

            profilesContainer.innerHTML = "";

            // 1. Renderizar perfiles
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
                    // Guardamos el perfil actual para que persista en el celu
                    localStorage.setItem("navProfileName", profile.name);
                    localStorage.setItem("navProfileAvatar", avatarUrl);
                    
                    overlay.style.display = "none";
                });

                profilesContainer.appendChild(wrapper);
            });

            // 2. Botón Añadir (si hay menos de 5)
            if (profiles.length < 5) {
                const addProfile = document.createElement("div");
                addProfile.className = "profileWrapper addProfile";
                addProfile.innerHTML = `
                    <div class="avatar addAvatar"><i class="fas fa-plus"></i></div>
                    <div class="profileName">Añadir</div>
                `;
                addProfile.onclick = () => window.location.href = "/account/#profiles";
                profilesContainer.appendChild(addProfile);
            }

        } catch (error) {
            console.error("Error cargando perfiles:", error);
            profilesContainer.innerHTML = "<p>Error al cargar perfiles. Reintenta.</p>";
        }
    }

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            sessionStorage.removeItem("profileSelected");
            return;
        }

        if (sessionStorage.getItem("profileSelected") === "true") {
            overlay.style.display = "none";
            return;
        }

        await showProfilesOverlay(user);
    });
});