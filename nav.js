// =======================================
// NAV RENDER
// =======================================

const navContainer = document.getElementById("mainNav");

if (navContainer) {

    navContainer.innerHTML = `

    <nav>

        <a class="navLogo" href="/index.html">
            <img src="/images/extras/logo.png" alt="logo">
        </a>

        <div class="navMenu">

            <!-- LINK NORMAL -->
            <a href="/browse/">
                Inicio
            </a>

            <!-- SOLO FLECHA ABRE MENU -->
            <i class="fas fa-chevron-down menuToggle"></i>

            <a href="#">
                Películas
            </a>

            <a href="#">
                Shows
            </a>

            <a href="/browse/my-list/">
                Mi Lista
            </a>

        </div>

        <form class="searchContainer" action="/browse/search/" method="GET">

            <input
                type="text"
                class="searchInput"
                name="q"
                placeholder="Buscar..."
            >

            <button type="submit" class="searchBtn">
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>

        </form>

        <div class="userMenu">

            <img class="userImg" src="/images/avatars/default.png" alt="avatar">

            <div class="dropDown">

                <div class="profileHeader" id="openProfiles">

                    <img class="navAvatar" src="/images/avatars/default.png" alt="avatar">

                    <span id="navProfileName">User</span>

                    <i class="fas fa-chevron-right" id="profileArrow"></i>

                </div>

                <a href="/account/#profiles">Perfil</a>
                <a href="/account/">Cuenta</a>
                <a href="/account/history/">Historial</a>

                <a href="https://instagram.com/eilishtvwebsite">Instagram</a>
                <a href="https://instagram.com/santbeq">Personal Instagram</a>
                <a href="mailto:eilishtvmanagement@gmail.com">Help</a>

                <a href="#" id="logoutBtn">Cerrar sesión</a>

            </div>

        </div>

    </nav>

    `;
}


// =======================================
// MOBILE MENU (SOLO FLECHA - FIX REAL)
// =======================================

const navMenu = document.querySelector(".navMenu");
const menuToggle = document.querySelector(".menuToggle");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", (e) => {

        e.stopPropagation();

        navMenu.classList.toggle("open");

    });

}

// cerrar al click afuera
document.addEventListener("click", (e) => {

    if (
        window.innerWidth <= 768 &&
        navMenu &&
        !navMenu.contains(e.target)
    ) {
        navMenu.classList.remove("open");
    }

});


// =======================================
// DROPDOWN USER
// =======================================

const userMenu = document.querySelector(".userMenu");
const dropDown = document.querySelector(".dropDown");
const profileArrow = document.getElementById("profileArrow");

let closeTimer;

if (userMenu && dropDown) {

    const showMenu = () => {

        clearTimeout(closeTimer);

        dropDown.style.display = "flex";

        if (profileArrow) {
            profileArrow.style.opacity = "1";
        }

    };

    const hideMenu = () => {

        closeTimer = setTimeout(() => {

            dropDown.style.display = "none";

            if (profileArrow) {
                profileArrow.style.opacity = "0";
            }

        }, 120);

    };

    userMenu.addEventListener("mouseenter", showMenu);
    userMenu.addEventListener("mouseleave", hideMenu);

    dropDown.addEventListener("mouseenter", showMenu);
    dropDown.addEventListener("mouseleave", hideMenu);
}


// =======================================
// SEARCH
// =======================================

const searchBtn = document.querySelector(".searchBtn");
const searchInput = document.querySelector(".searchInput");

if (searchBtn && searchInput) {

    searchBtn.addEventListener("click", () => {

        searchInput.classList.toggle("show");

        if (searchInput.classList.contains("show")) {
            searchInput.focus();
        }

    });

}


// =======================================
// FIREBASE NAV SYNC (LOCALSTORAGE)
// =======================================

function applyNavData() {

    const navName = document.getElementById("navProfileName");
    const navAvatar = document.querySelector(".navAvatar");
    const userImg = document.querySelector(".userImg");

    const storedName = localStorage.getItem("navProfileName");
    const storedAvatar = localStorage.getItem("navProfileAvatar");

    if (navName && storedName) {
        navName.textContent = storedName;
    }

    if (storedAvatar) {

        if (navAvatar) navAvatar.src = storedAvatar;
        if (userImg) userImg.src = storedAvatar;

    }

}

applyNavData();


// =======================================
// FIREBASE HOOK (GLOBAL SAFE)
// =======================================

const waitAuth = setInterval(() => {

    if (window.auth && window.firebaseOnAuth) {

        clearInterval(waitAuth);

        window.firebaseOnAuth(window.auth, (user) => {

            if (!user) return;

            applyNavData();

        });

    }

}, 50);


// =======================================
// LOGOUT
// =======================================

document.addEventListener("click", async (e) => {

    if (e.target.id === "logoutBtn") {

        e.preventDefault();

        if (window.logoutUser) {
            await window.logoutUser();
        }

    }

});


// =======================================
// OVERLAY PROFILES
// =======================================

document.addEventListener("click", (e) => {

    if (e.target.closest("#openProfiles")) {

        const overlay = document.getElementById("profileOverlay");

        if (overlay) {

            overlay.style.display = "flex";

            sessionStorage.removeItem("profileSelected");

        }

    }

});