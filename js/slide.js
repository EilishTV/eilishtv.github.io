const container = document.getElementById("proximamente");

// ================== CONFIG ==================
const data = {
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Billie_Eilish_-_Hit_Me_Hard_and_Soft_-_The_Tour_In_3D_logo.png",
    descripcion: "Una experiencia visual inmersiva que transforma el álbum en un viaje intenso y envolvente",
    poster: "https://www.seattlemusicnews.com/wp-content/uploads/2024/12/billie-eilish-seattle-climate-pledge-arena-by-henry-hwu-1.jpg",
    video: "../images/extras/BILLIE EILISH – HIT ME HARD AND SOFT_ THE TOUR (LIVE IN 3D) _ Official Trailer 2 (2026 Movie) (2).mp4",
    botones: ["Ver más", "Recordarme"]
};

// ================== ESTILOS CONTENEDOR ==================
container.style.position = "relative";
container.style.width = "calc(100% - 30px)";
container.style.margin = "15px";
container.style.height = "500px";
container.style.borderRadius = "12px";
container.style.overflow = "hidden";
container.style.fontFamily = "Arial, sans-serif";
container.style.color = "white";

// ================== MEDIA ==================
const mediaContainer = document.createElement("div");
mediaContainer.style.position = "absolute";
mediaContainer.style.inset = "0";
mediaContainer.style.zIndex = "0";
container.appendChild(mediaContainer);

// Poster
const poster = document.createElement("img");
poster.src = data.poster;
poster.style.width = "100%";
poster.style.height = "100%";
poster.style.objectFit = "cover";
poster.style.objectPosition = "center center";
poster.style.position = "absolute";
poster.style.inset = "0";
poster.style.transition = "opacity 0.8s ease";
mediaContainer.appendChild(poster);

// Video
const video = document.createElement("video");
video.src = data.video;
video.style.width = "100%";
video.style.height = "100%";
video.style.objectFit = "cover";
video.style.objectPosition = "center center";
video.style.position = "absolute";
video.style.inset = "0";
video.style.opacity = "0";
video.style.transition = "opacity 0.8s ease";
video.autoplay = false;
video.muted = true;
video.playsInline = true;
video.preload = "metadata";
mediaContainer.appendChild(video);

// ... (mantenemos el inicio del código igual)

// ================== BOTÓN VOLUMEN ==================
const volumeBtn = document.createElement("i");
// Iniciamos con el icono de volumen activo
volumeBtn.className = "fas fa-volume-up"; 

volumeBtn.style.position = "absolute";
volumeBtn.style.right = "25px";
volumeBtn.style.bottom = "25px";
volumeBtn.style.fontSize = "22px";
volumeBtn.style.color = "white";
volumeBtn.style.cursor = "pointer";
volumeBtn.style.zIndex = "3";
volumeBtn.style.opacity = "0"; // Se muestra al hacer hover
volumeBtn.style.transition = "opacity 0.3s ease";

container.appendChild(volumeBtn);

// CAMBIO CLAVE: Iniciamos el estado en true y el video desmuteado
let sonidoActivo = true;
video.muted = false; 

container.addEventListener("mouseenter", () => {
    volumeBtn.style.opacity = "1";
});

container.addEventListener("mouseleave", () => {
    volumeBtn.style.opacity = "0";
});

// Reforzamos la visibilidad si el mouse está cerca del área del botón
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
    e.preventDefault(); // Evitamos cualquier acción extra

    sonidoActivo = !sonidoActivo;

    if (sonidoActivo) {
        video.muted = false;
        volumeBtn.className = "fas fa-volume-up";
        console.log("Sonido activado");
    } else {
        video.muted = true;
        volumeBtn.className = "fas fa-volume-mute";
        console.log("Sonido silenciado");
    }
});

// ... (Overlay y resto del contenido igual)

// ================== LÓGICA VIDEO (Ajuste para asegurar sonido) ==================
function intentarReproducir() {
    if (videoListo && minimoTiempoCumplido && bannerVisible) {
        // Al intentar reproducir, nos aseguramos de respetar el estado de sonidoActivo
        video.muted = !sonidoActivo; 
        
        video.play().catch(error => {
            console.log("Autoplay con sonido bloqueado, intentando muteado:", error);
            // Si el navegador bloquea el sonido, muteamos para que al menos se vea el video
            video.muted = true;
            sonidoActivo = false;
            volumeBtn.className = "fas fa-volume-mute";
        });

        video.style.opacity = "1";
        poster.style.opacity = "0";
        logo.style.transform = "scale(0.65) translateY(120px)";
    }
}

// Eliminamos el event listener de click en el container que muteaba/desmuteaba
// para que no interfiera con el botón específico de volumen.
/* 
container.addEventListener("click", () => {
    video.muted = false;
}); 
*/

// ... (Resto del código del IntersectionObserver y Responsive se mantiene igual)

// ================== OVERLAY ==================
const overlay = document.createElement("div");
overlay.style.position = "absolute";
overlay.style.inset = "0";
overlay.style.background = "linear-gradient(to right, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1))";
overlay.style.zIndex = "1";
container.appendChild(overlay);


// ================== CONTENIDO ==================
const content = document.createElement("div");
content.style.position = "relative";
content.style.zIndex = "2";
content.style.padding = "120px 60px 60px 60px";
content.style.maxWidth = "600px";
container.appendChild(content);

// ================== BADGE ==================
const badge = document.createElement("div");
badge.textContent = "Proximamente";
badge.style.position = "absolute";
badge.style.top = "30px";
badge.style.left = "60px";
badge.style.padding = "6px 14px";
badge.style.background = "#0a102a";
badge.style.borderRadius = "20px";
badge.style.fontSize = "14px";
badge.style.fontWeight = "bold";
badge.style.zIndex = "3";
container.appendChild(badge);

// Logo
const logo = document.createElement("img");
logo.src = data.logo;
logo.style.width = "300px";
logo.style.display = "block";
logo.style.marginBottom = "20px";
logo.style.transition = "transform 0.6s ease";
logo.style.transformOrigin = "left top";
content.appendChild(logo);

// Descripción
const desc = document.createElement("p");
desc.textContent = data.descripcion;
desc.style.fontSize = "18px";
desc.style.lineHeight = "1.5";
desc.style.marginBottom = "25px";
content.appendChild(desc);

// Botones
const btnContainer = document.createElement("div");
btnContainer.style.display = "flex";
btnContainer.style.gap = "15px";
content.appendChild(btnContainer);

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
        window.location.href = "/browse/watch/index.html?id=0047";
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

// ================== LÓGICA VIDEO ==================
let videoListo = false;
let minimoTiempoCumplido = false;
let esperaScrollTimeout = null;
let bannerVisible = true;

setTimeout(() => {
    minimoTiempoCumplido = true;
    intentarReproducir();
}, 3000);

video.addEventListener("canplaythrough", () => {
    videoListo = true;
    intentarReproducir();
});

function intentarReproducir() {
    if (videoListo && minimoTiempoCumplido && bannerVisible) {
        video.play();
        video.style.opacity = "1";
        poster.style.opacity = "0";
        logo.style.transform = "scale(0.65) translateY(120px)";
    }
}

video.addEventListener("ended", () => {
    video.style.opacity = "0";
    poster.style.opacity = "1";
    video.currentTime = 0;

    logo.style.transform = "scale(1) translateY(0px)";

    minimoTiempoCumplido = false;

    setTimeout(() => {
        minimoTiempoCumplido = true;
        intentarReproducir();
    }, 10000);
});

container.addEventListener("click", () => {
    video.muted = false;
});

// ================== VISIBILIDAD ==================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            bannerVisible = false;

            if (esperaScrollTimeout) {
                clearTimeout(esperaScrollTimeout);
                esperaScrollTimeout = null;
            }

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
        content.style.padding = "90px 25px 25px 25px";

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

aplicarResponsive();
window.addEventListener("resize", aplicarResponsive);