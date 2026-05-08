/* =========================
   NAV Y DROPDOWN USUARIO
========================= */
const userMenu = document.querySelector(".userMenu");
const dropDown = document.querySelector(".dropDown");
const profileArrow = document.getElementById("profileArrow");
const openProfiles = document.getElementById("openProfiles");

let closeTimer;

// Dropdown hover
if (userMenu && dropDown) {
    const showMenu = () => {
        clearTimeout(closeTimer);
        dropDown.style.display = "flex";
        if (profileArrow) profileArrow.style.opacity = "1";
    };

    const hideMenu = () => {
        closeTimer = setTimeout(() => {
            dropDown.style.display = "none";
            if (profileArrow) profileArrow.style.opacity = "0";
        }, 150);
    };

    userMenu.addEventListener("mouseenter", showMenu);
    userMenu.addEventListener("mouseleave", hideMenu);

    dropDown.addEventListener("mouseenter", showMenu);
    dropDown.addEventListener("mouseleave", hideMenu);
}

/* =========================
   BUSCADOR
========================= */
const searchBtn = document.querySelector(".searchBtn");
const searchInput = document.querySelector(".searchInput");

if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
        searchInput.classList.toggle("show");
        if (searchInput.classList.contains("show")) searchInput.focus();
    });
}

/* =========================
   LOGOUT
========================= */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.logoutUser) {
            window.logoutUser();
        } else {
            console.error("logoutUser no está disponible todavía");
        }
    });
}


/* =========================
   PERFIL ACTIVO EN NAV (SAFE FIX)
   - no pisa Firebase
   - sirve como fallback F5
   - no genera race conditions
========================= */

document.addEventListener("DOMContentLoaded", async () => {

    const navAvatars = document.querySelectorAll(".navAvatar");
    const userImg = document.querySelector(".userImg");
    const navName = document.getElementById("navProfileName");

    // =========================
    // 🔥 FALLBACK LOCAL STORAGE
    // =========================
    const storedName = localStorage.getItem("navProfileName");
    const storedAvatar = localStorage.getItem("navProfileAvatar");

    if (storedName && navName) {
        navName.textContent = storedName;
    }

    if (storedAvatar) {
        navAvatars.forEach(img => img.src = storedAvatar);
        if (userImg) userImg.src = storedAvatar;
    }

    // =========================
    // 🔥 EXPORT GLOBAL SAFE WAIT
    // =========================
    window.waitForElements = function () {
        return new Promise((resolve) => {

            const check = () => {
                const navAvatars = document.querySelectorAll(".navAvatar");
                const userImg = document.querySelector(".userImg");
                const navName = document.getElementById("navProfileName");

                if (navName && userImg) {
                    return resolve({
                        navAvatars,
                        userImg,
                        navName
                    });
                }

                requestAnimationFrame(check);
            };

            check();
        });
    };

});
/* =========================
   ABRIR OVERLAY DE PERFILES
========================= */
if (openProfiles) {
    openProfiles.addEventListener("click", () => {
        const overlay = document.getElementById("profileOverlay");
        if (overlay) {
            overlay.style.display = "flex";
            // Quitamos el estado de 'perfil seleccionado' para que el script del overlay cargue los perfiles
            sessionStorage.removeItem("profileSelected");
        }
        if (profileArrow) profileArrow.style.opacity = "0";
    });
}