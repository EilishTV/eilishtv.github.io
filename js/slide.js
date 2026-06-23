const container = document.getElementById("proximamente");

// ================== CONFIG ==================
const banners = [
        {   badge: "Ya disponible",
        logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Billie_Eilish_-_Hit_Me_Hard_and_Soft_-_The_Tour_In_3D_logo.png",
        descripcion: "Una experiencia visual inmersiva que transforma el álbum en un viaje intenso y envolvente",
        poster: "https://www.seattlemusicnews.com/wp-content/uploads/2024/12/billie-eilish-seattle-climate-pledge-arena-by-henry-hwu-1.jpg",
        video: "../images/extras/BILLIE EILISH – HIT ME HARD AND SOFT_ THE TOUR (LIVE IN 3D) _ Official Trailer 2 (2026 Movie) (2).mp4",
        botones: ["Ver más", "Recordarme"],
        url: "/browse/watch/index.html?id=0047"
    },

        {   badge: "Próximamente",
        logo: "https://m.media-amazon.com/images/S/pv-target-images/376607ff1bb4ae48c0d92498c28ff45664a40070f09baa619d1f53abb8128e2e.png",
        descripcion: "Asesinato. Sexo. Música. Esto no es una obra de ficción.",
        poster: "https://www.rollingstone.com/wp-content/uploads/2023/02/swarm.jpg?w=1296&h=730&crop=1",
        video: "VIDEO_2.mp4",
        botones: ["Ver más", "Recordarme"],
        url: "/browse/watch/index.html?id=0042"
    },


    {   badge: "Próximamente",
        logo: "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/34b3fc4c-f94c-4c33-9d4d-1bfbb1862140/compose?format=webp&width=1600",
        descripcion: "Lisa Simpson es descubierta por los artistas Billie Eilish y Finneas O'Connell.",
        poster: "https://i.ytimg.com/vi/tRAnZjrzORE/maxresdefault.jpg",
        video: "VIDEO_2.mp4",
        botones: ["Ver más", "Recordarme"],
        url: "/browse/watch/index.html?id=0050"
    }    
];

// Estado global del componente
let currentIndex = 0;
let sonidoActivo = true;
let videoListo = false;
let minimoTiempoCumplido = false;
let esperaScrollTimeout = null;
let bannerVisible = true;
let loopTimeout = null;

// ================== ESTILOS CONTENEDOR ==================
container.style.position = "relative";
container.style.width = "calc(100% - 30px)";
container.style.margin = "15px";
container.style.height = "500px";
container.style.borderRadius = "12px";
container.style.overflow = "hidden";
container.style.fontFamily = "Arial, sans-serif";
container.style.color = "white";

// ================== CREACIÓN DE ELEMENTOS (DOM) ==================

// Contenedor de Media (Fondo)
const mediaContainer = document.createElement("div");
mediaContainer.style.position = "absolute";
mediaContainer.style.inset = "0";
mediaContainer.style.zIndex = "0";
container.appendChild(mediaContainer);

const poster = document.createElement("img");
poster.style.width = "100%";
poster.style.height = "100%";
poster.style.objectFit = "cover";
poster.style.objectPosition = "center center";
poster.style.position = "absolute";
poster.style.inset = "0";
poster.style.transition = "opacity 0.8s ease";
mediaContainer.appendChild(poster);

const video = document.createElement("video");
video.style.width = "100%";
video.style.height = "100%";
video.style.objectFit = "cover";
video.style.objectPosition = "center center";
video.style.position = "absolute";
video.style.inset = "0";
video.style.opacity = "0";
video.style.transition = "opacity 0.8s ease";
video.autoplay = false;
video.muted = !sonidoActivo;
video.playsInline = true;
video.preload = "metadata";
mediaContainer.appendChild(video);

// Overlay
const overlay = document.createElement("div");
overlay.style.position = "absolute";
overlay.style.inset = "0";
overlay.style.zIndex = "1";
container.appendChild(overlay);

// Contenido info
const content = document.createElement("div");
content.style.position = "relative";
content.style.zIndex = "2";
content.style.maxWidth = "600px";
container.appendChild(content);

// Badge dinámico (se llena en cargarBanner)
const badge = document.createElement("div");
badge.style.position = "absolute";
badge.style.padding = "6px 14px";
badge.style.background = "#0a102a";
badge.style.borderRadius = "20px";
badge.style.fontSize = "14px";
badge.style.fontWeight = "bold";
badge.style.zIndex = "3";
container.appendChild(badge);

const logo = document.createElement("img");
logo.style.transition = "transform 0.6s ease";
logo.style.transformOrigin = "left top";
content.appendChild(logo);

const desc = document.createElement("p");
desc.style.lineHeight = "1.5";
content.appendChild(desc);

const btnContainer = document.createElement("div");
btnContainer.style.display = "flex";
content.appendChild(btnContainer);

// Botón Volumen
const volumeBtn = document.createElement("i");
volumeBtn.className = sonidoActivo ? "fas fa-volume-up" : "fas fa-volume-mute"; 
volumeBtn.style.position = "absolute";
volumeBtn.style.right = "25px";
volumeBtn.style.bottom = "25px";
volumeBtn.style.fontSize = "22px";
volumeBtn.style.color = "white";
volumeBtn.style.cursor = "pointer";
volumeBtn.style.zIndex = "3";
volumeBtn.style.opacity = "0"; 
volumeBtn.style.transition = "opacity 0.3s ease";
container.appendChild(volumeBtn);

// ================== INDICADORES (PUNTOS ABAJO) ==================
const indicatorsContainer = document.createElement("div");
indicatorsContainer.style.position = "absolute";
indicatorsContainer.style.bottom = "25px";
indicatorsContainer.style.left = "50%";
indicatorsContainer.style.transform = "translateX(-50%)";
indicatorsContainer.style.display = "flex";
indicatorsContainer.style.gap = "8px";
indicatorsContainer.style.zIndex = "3";
container.appendChild(indicatorsContainer);

// Renderizar los puntitos dinámicamente
banners.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.borderRadius = "50%";
    dot.style.background = "rgba(255, 255, 255, 0.4)";
    dot.style.cursor = "pointer";
    dot.style.transition = "background 0.3s, transform 0.3s";
    
    dot.addEventListener("click", (e) => {
        e.stopPropagation();
        cambiarBanner(index);
    });
    indicatorsContainer.appendChild(dot);
});

function actualizarIndicadores() {
    Array.from(indicatorsContainer.children).forEach((dot, index) => {
        if (index === currentIndex) {
            dot.style.background = "white";
            dot.style.transform = "scale(1.2)";
        } else {
            dot.style.background = "rgba(255, 255, 255, 0.4)";
            dot.style.transform = "scale(1)";
        }
    });
}

// ================== LÓGICA DE CARGA DE DATOS ==================
function cargarBanner(index) {
    const data = banners[index];
    if (!data) return;

    // Resetear estados de video para el nuevo elemento
    videoListo = false;
    minimoTiempoCumplido = false;
    
    // Detener video actual y cambiar src
    video.pause();
    video.style.opacity = "0";
    poster.style.opacity = "1";
    logo.style.transform = "scale(1) translateY(0px)";

    // Asignar nuevas URLs y Textos dinámicos
    badge.textContent = data.badge || "Próximamente"; // <-- Texto del badge dinámico
    poster.src = data.poster;
    video.src = data.video;
    video.load(); 
    
    logo.src = data.logo;
    desc.textContent = data.descripcion;

    // Limpiar y recrear botones
    btnContainer.innerHTML = "";
    data.botones.forEach(texto => {
        const btn = document.createElement("button");
        btn.textContent = texto;
        btn.style.padding = "12px 28px";
        btn.style.borderRadius = "30px";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "16px";
        btn.style.fontWeight = "bold";
        btn.style.transition = "0.3s";

        if (texto === "Ver más") {
            btn.style.background = "white";
            btn.style.color = "black";
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                window.location.href = data.url;
            });
        } else {
            btn.style.background = "rgba(255,255,255,0.2)";
            btn.style.color = "white";
            btn.style.border = "1px solid white";
        }

        btn.onmouseenter = () => btn.style.transform = "scale(1.05)";
        btn.onmouseleave = () => btn.style.transform = "scale(1)";
        btnContainer.appendChild(btn);
    });

    actualizarIndicadores();
    aplicarResponsive(); // Asegura estilos correctos tras re-inyectar contenido

    // Iniciar temporizador de espera inicial (3 segundos para reproducir)
    if (loopTimeout) clearTimeout(loopTimeout);
    loopTimeout = setTimeout(() => {
        minimoTiempoCumplido = true;
        intentarReproducir();
    }, 3000);
}

function cambiarBanner(nuevoIndex) {
    currentIndex = nuevoIndex;
    cargarBanner(currentIndex);
}

function siguienteBanner() {
    currentIndex = (currentIndex + 1) % banners.length;
    cambiarBanner(currentIndex);
}

// ================== LÓGICA REPRODUCCIÓN REFORZADA ==================
function intentarReproducir() {
    if (videoListo && minimoTiempoCumplido && bannerVisible) {
        video.muted = !sonidoActivo; 
        
        video.play().catch(error => {
            console.log("Autoplay con sonido bloqueado por navegador, reproduciendo muteado.");
            video.muted = true;
            sonidoActivo = false;
            volumeBtn.className = "fas fa-volume-mute";
            video.play().catch(err => console.log("Error crítico al reproducir video:", err));
        });

        video.style.opacity = "1";
        poster.style.opacity = "0";
        
        if (window.innerWidth >= 1024) {
            logo.style.transform = "scale(0.65) translateY(120px)";
        }
    }
}

video.addEventListener("canplaythrough", () => {
    videoListo = true;
    intentarReproducir();
});

video.addEventListener("ended", () => {
    video.style.opacity = "0";
    poster.style.opacity = "1";
    video.currentTime = 0;
    logo.style.transform = "scale(1) translateY(0px)";
    minimoTiempoCumplido = false;

    // Espera 10 segundos antes de pasar al siguiente banner si termina el video
    if (loopTimeout) clearTimeout(loopTimeout);
    loopTimeout = setTimeout(() => {
        siguienteBanner();
    }, 10000);
});

// ================== EVENTOS VOLUMEN Y HOVER ==================
container.addEventListener("mouseenter", () => { volumeBtn.style.opacity = "1"; });
container.addEventListener("mouseleave", () => { volumeBtn.style.opacity = "0"; });

container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const distanciaDerecha = rect.right - e.clientX;
    const distanciaAbajo = rect.bottom - e.clientY;

    if (distanciaDerecha < 120 && distanciaAbajo < 120) {
        volumeBtn.style.opacity = "1";
    }
});

volumeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();

    sonidoActivo = !sonidoActivo;
    video.muted = !sonidoActivo;

    if (sonidoActivo) {
        volumeBtn.className = "fas fa-volume-up";
        intentarReproducir();
    } else {
        volumeBtn.className = "fas fa-volume-mute";
    }
});

// ================== VISIBILIDAD (IntersectionObserver) ==================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            bannerVisible = false;
            if (esperaScrollTimeout) clearTimeout(esperaScrollTimeout);
            if (loopTimeout) clearTimeout(loopTimeout);

            video.pause();
            video.currentTime = 0;
            video.style.opacity = "0";
            poster.style.opacity = "1";
            logo.style.transform = "scale(1) translateY(0px)";
        } else {
            bannerVisible = true;
            esperaScrollTimeout = setTimeout(() => {
                intentarReproducir();
            }, 3000);
        }
    });
}, { threshold: 0.3 });

observer.observe(container);

// ================== RESPONSIVE ==================
function aplicarResponsive() {
    if (window.innerWidth < 1024) {
        container.style.height = "auto";
        container.style.aspectRatio = "4 / 5";

        content.style.position = "absolute";
        content.style.inset = "0";
        content.style.width = "100%";
        content.style.maxWidth = "none";
        content.style.height = "100%";
        content.style.display = "flex";
        content.style.flexDirection = "column";
        content.style.padding = "90px 25px 50px 25px"; // Extra padding inferior para los puntitos

        logo.style.width = "220px";
        logo.style.marginBottom = "14px";
        desc.style.fontSize = "15px";
        desc.style.marginBottom = "18px";

        btnContainer.style.flexDirection = "column";
        btnContainer.style.gap = "10px";
        btnContainer.style.marginTop = "auto";

        badge.style.left = "25px";
        badge.style.top = "20px";

        overlay.style.background = "linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.96) 100%)";
    } else {
        container.style.height = "500px";
        container.style.aspectRatio = "auto";

        content.style.position = "relative";
        content.style.inset = "auto";
        content.style.width = "auto";
        content.style.maxWidth = "600px";
        content.style.height = "auto";
        content.style.display = "block";
        content.style.padding = "120px 60px 60px 60px";

        logo.style.width = "300px";
        logo.style.marginBottom = "20px";
        desc.style.fontSize = "18px";
        desc.style.marginBottom = "25px";

        btnContainer.style.flexDirection = "row";
        btnContainer.style.gap = "15px";
        btnContainer.style.marginTop = "0";

        badge.style.left = "60px";
        badge.style.top = "30px";

        overlay.style.background = "linear-gradient(to right, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1))";
    }
}

window.addEventListener("resize", aplicarResponsive);

// INICIALIZACIÓN PRIMERA CARGA
cargarBanner(currentIndex);