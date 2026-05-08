import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    getFirestore, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============================================
// FIREBASE
// ============================================
const firebaseConfig = { 
    /* tus credenciales */
};

const app = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// DOM READY
// ============================================
document.addEventListener("DOMContentLoaded", () => {

    const overlay = document.getElementById("profileOverlay");
    const profilesContainer = document.getElementById("profiles");

    if (!overlay || !profilesContainer) return;

    // ============================================
    // FALLBACK VISUAL (NUNCA QUEDA VACÍO)
    // ============================================
    function renderFallbackProfile() {

        profilesContainer.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "profileWrapper";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.style.backgroundImage = `url(/images/avatars/avatar1.jpeg)`;
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";

        const name = document.createElement("div");
        name.className = "profileName";
        name.textContent = "Perfil";

        wrapper.appendChild(avatar);
        wrapper.appendChild(name);

        wrapper.addEventListener("click", () => {

            localStorage.setItem("navProfileName", "Perfil");
            localStorage.setItem(
                "navProfileAvatar",
                "/images/avatars/avatar1.jpeg"
            );

            sessionStorage.setItem("profileSelected", "true");

            overlay.style.display = "none";

            if (window.updateNavAvatars) {
                window.updateNavAvatars(
                    "/images/avatars/avatar1.jpeg",
                    "Perfil"
                );
            }
        });

        profilesContainer.appendChild(wrapper);
    }

    // ============================================
    // GUARDAR PERFIL LOCAL
    // ============================================
    function saveLocalProfile(profile) {

        localStorage.setItem(
            "cachedProfile",
            JSON.stringify(profile)
        );

        localStorage.setItem(
            "navProfileName",
            profile.name
        );

        localStorage.setItem(
            "navProfileAvatar",
            profile.avatar
        );
    }

    // ============================================
    // CARGAR PERFIL LOCAL
    // ============================================
    function getLocalProfile() {

        try {
            return JSON.parse(
                localStorage.getItem("cachedProfile")
            );
        } catch {
            return null;
        }
    }

    // ============================================
    // MOSTRAR OVERLAY
    // ============================================
    async function showProfilesOverlay(user) {

        overlay.style.display = "flex";

        profilesContainer.innerHTML = `
            <p style="color:white;">Cargando perfiles...</p>
        `;

        try {

            const profilesRef = collection(
                db,
                "users",
                user.uid,
                "profiles"
            );

            const snapshot = await getDocs(profilesRef);

            let profiles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // ============================================
            // SI NO HAY NINGÚN PERFIL
            // ============================================
            if (!profiles.length) {

                const cached = getLocalProfile();

                if (cached) {
                    profiles = [cached];
                } else {

                    renderFallbackProfile();

                    // BOTÓN CREAR PERFIL
                    const addProfile = document.createElement("div");
                    addProfile.className = "profileWrapper addProfile";

                    addProfile.innerHTML = `
                        <div class="avatar addAvatar">
                            <i class="fas fa-plus"></i>
                        </div>
                        <div class="profileName">Crear perfil</div>
                    `;

                    addProfile.addEventListener("click", () => {
                        window.location.href = "/account/#profiles";
                    });

                    profilesContainer.appendChild(addProfile);

                    return;
                }
            }

            profilesContainer.innerHTML = "";

            // ============================================
            // SOLO 1 PERFIL
            // ============================================
            const profile = profiles[0];

            const wrapper = document.createElement("div");
            wrapper.className = "profileWrapper";

            const avatar = document.createElement("div");
            avatar.className = "avatar";

            const avatarUrl =
                profile.avatar ||
                "/images/avatars/avatar1.jpeg";

            avatar.style.backgroundImage = `url(${avatarUrl})`;
            avatar.style.backgroundSize = "cover";
            avatar.style.backgroundPosition = "center";

            const name = document.createElement("div");
            name.className = "profileName";
            name.textContent = profile.name || "Perfil";

            wrapper.appendChild(avatar);
            wrapper.appendChild(name);

            wrapper.addEventListener("click", () => {

                saveLocalProfile({
                    name: profile.name || "Perfil",
                    avatar: avatarUrl
                });

                sessionStorage.setItem(
                    "profileSelected",
                    "true"
                );

                overlay.style.display = "none";

                if (window.updateNavAvatars) {
                    window.updateNavAvatars(
                        avatarUrl,
                        profile.name || "Perfil"
                    );
                }
            });

            profilesContainer.appendChild(wrapper);

            // ============================================
            // BOTÓN EDITAR
            // ============================================
            let editBtn = document.querySelector(".editProfileBtn");

            if (!editBtn) {

                editBtn = document.createElement("button");

                editBtn.className = "editProfileBtn";

                editBtn.textContent = "Editar perfil";

                editBtn.addEventListener("click", () => {
                    window.location.href = "/profile/";
                });

                overlay.appendChild(editBtn);
            }

        } catch (error) {

            console.error("Error cargando perfiles:", error);

            // ============================================
            // FALLBACK SI FIRESTORE FALLA
            // ============================================
            const cached = getLocalProfile();

            profilesContainer.innerHTML = "";

            if (cached) {

                const wrapper = document.createElement("div");
                wrapper.className = "profileWrapper";

                const avatar = document.createElement("div");
                avatar.className = "avatar";

                avatar.style.backgroundImage = `
                    url(${cached.avatar})
                `;

                avatar.style.backgroundSize = "cover";
                avatar.style.backgroundPosition = "center";

                const name = document.createElement("div");
                name.className = "profileName";
                name.textContent = cached.name;

                wrapper.appendChild(avatar);
                wrapper.appendChild(name);

                wrapper.addEventListener("click", () => {

                    sessionStorage.setItem(
                        "profileSelected",
                        "true"
                    );

                    overlay.style.display = "none";

                    if (window.updateNavAvatars) {
                        window.updateNavAvatars(
                            cached.avatar,
                            cached.name
                        );
                    }
                });

                profilesContainer.appendChild(wrapper);

            } else {

                renderFallbackProfile();
            }
        }
    }

    // ============================================
    // AUTH
    // ============================================
    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            sessionStorage.removeItem("profileSelected");

            overlay.style.display = "none";

            return;
        }

        // ============================================
        // SI YA HAY PERFIL SELECCIONADO
        // ============================================
        if (
            sessionStorage.getItem("profileSelected") === "true"
        ) {

            const savedAvatar =
                localStorage.getItem("navProfileAvatar");

            const savedName =
                localStorage.getItem("navProfileName");

            if (
                savedAvatar &&
                savedName &&
                window.updateNavAvatars
            ) {

                window.updateNavAvatars(
                    savedAvatar,
                    savedName
                );
            }

            overlay.style.display = "none";

            return;
        }

        await showProfilesOverlay(user);
    });

    // ============================================
    // ABRIR MANUALMENTE
    // ============================================
    const openProfilesBtn =
        document.getElementById("openProfiles");

    openProfilesBtn?.addEventListener("click", async () => {

        sessionStorage.removeItem("profileSelected");

        const user = auth.currentUser;

        if (!user) return;

        await showProfilesOverlay(user);
    });
});