// =======================================
// RENDER NAV
// =======================================

const navContainer =
    document.getElementById("mainNav");

if (navContainer) {

    navContainer.innerHTML = `

    <nav>

        <a class="navLogo" href="/index.html">
            <img
                src="/images/extras/logo.png"
                alt="logo"
            >
        </a>

        <!-- MOBILE BUTTON -->
        <button class="mobileMenuBtn">

            <i class="fas fa-bars"></i>

        </button>

        <!-- MENU -->
        <div class="navMenu">

            <a href="/browse/">
                Inicio
            </a>

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

        <!-- SEARCH -->
        <form
            class="searchContainer"
            action="/browse/search/"
            method="GET"
        >

            <input
                type="text"
                class="searchInput"
                name="q"
                placeholder="Buscar..."
            >

            <button
                type="submit"
                class="searchBtn"
            >
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>

        </form>

        <!-- USER -->
        <div class="userMenu">

            <img
                class="userImg"
                src="/images/avatars/default.png"
                alt="avatar"
            >

            <div class="dropDown">

                <div
                    class="profileHeader"
                    id="openProfiles"
                >

                    <img
                        class="navAvatar"
                        src="/images/avatars/default.png"
                        alt="avatar"
                    >

                    <span id="navProfileName">
                        User
                    </span>

                    <i
                        class="fas fa-chevron-right"
                        id="profileArrow"
                    ></i>

                </div>

                <a href="/account/#profiles">
                    Perfill
                </a>

                <a href="/account/">
                    Cuenta
                </a>

                <a href="/account/history/">
                    Historial
                </a>

                <a
                    href="https://instagram.com/eilishtvwebsite"
                    target="_blank"
                >
                    Instagram
                </a>

                <a
                    href="https://instagram.com/santbeq"
                    target="_blank"
                >
                    Personal Instagram
                </a>

                <a href="mailto:eilishtvmanagement@gmail.com">
                    Help
                </a>

                <a href="#" id="logoutBtn">
                    Cerrar sesión
                </a>

            </div>

        </div>

    </nav>

    `;
}


// =======================================
// ELEMENTOS
// =======================================

const userMenu =
    document.querySelector(".userMenu");

const dropDown =
    document.querySelector(".dropDown");

const profileArrow =
    document.getElementById("profileArrow");


// =======================================
// DROPDOWN
// =======================================

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

    userMenu.addEventListener(
        "mouseenter",
        showMenu
    );

    userMenu.addEventListener(
        "mouseleave",
        hideMenu
    );

    dropDown.addEventListener(
        "mouseenter",
        showMenu
    );

    dropDown.addEventListener(
        "mouseleave",
        hideMenu
    );
}


// =======================================
// SEARCH
// =======================================

const searchBtn =
    document.querySelector(".searchBtn");

const searchInput =
    document.querySelector(".searchInput");

if (searchBtn && searchInput) {

    searchBtn.addEventListener("click", () => {

        searchInput.classList.toggle("show");

        if (
            searchInput.classList.contains("show")
        ) {
            searchInput.focus();
        }

    });

}


// =======================================
// FIREBASE NAV
// =======================================

function applyNavData() {

    const navName =
        document.getElementById("navProfileName");

    const navAvatar =
        document.querySelector(".navAvatar");

    const userImg =
        document.querySelector(".userImg");

    const storedName =
        localStorage.getItem("navProfileName");

    const storedAvatar =
        localStorage.getItem("navProfileAvatar");

    if (navName && storedName) {
        navName.textContent = storedName;
    }

    if (navAvatar && storedAvatar) {
        navAvatar.src = storedAvatar;
    }

    if (userImg && storedAvatar) {
        userImg.src = storedAvatar;
    }

}

applyNavData();


// =======================================
// AUTH LISTENER
// =======================================

const authWait = setInterval(() => {

    if (
        window.auth &&
        window.firebaseOnAuth
    ) {

        clearInterval(authWait);

        window.firebaseOnAuth(
            window.auth,
            (user) => {

                if (!user) return;

                applyNavData();

            }
        );

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
// OVERLAY
// =======================================

document.addEventListener("click", (e) => {

    if (
        e.target.closest("#openProfiles")
    ) {

        const overlay =
            document.getElementById(
                "profileOverlay"
            );

        if (overlay) {

            overlay.style.display = "flex";

            sessionStorage.removeItem(
                "profileSelected"
            );

        }

    }

});