const target = document.querySelector("main");

const goto = (e) => {
    const alt = e.target.alt;
    let movie;
        
    if (alt === "Inside Out") {
        movie = alt;
        setData(movie);
    } else if (alt === "A tail of two kitties") {
        movie = alt;
        setData(movie);
    } else if (alt === "Bao") {
        movie = alt;
        setData(movie);
    } else if (alt === "Tangled") {
        movie = alt;
        setData(movie);
    } else if (alt === "Soul") {
        movie = alt;
        setData(movie);
    } else if (alt === "Moana") {
        movie = alt;
        setData(movie);
    } else if (alt === "Incredibles 2") {
        movie = alt;
        setData(movie);
    } else if (alt === "Assembled") {
        movie = alt;
        setData(movie);
    } else if (alt === "Burrow") {
        movie = alt;
        setData(movie);
    } else if (alt === "The Simpsons") {
        movie = alt;
        setData(movie);
    } else if (alt === "Legends") {
        movie = alt;
        setData(movie);
    } else if (alt === "Raya") {
        movie = alt;
        setData(movie);
    } else if (alt === "Auntie EDNA") {
        movie = alt;
        setData(movie);
    } else if (alt === "Mickey mouse") {
        movie = alt;
        setData(movie);
    } else if (alt === "The falcon and the winter soldier") {
        movie = alt;
        setData(movie);
    } else if (alt === "My music story") {
        movie = alt;
        setData(movie);
    } else {
        movie = '';
    }

    let loc = location.href;
    loc = loc.split("/");
    loc.pop();
    loc = "/".join(loc);
    
    location.replace(loc + 'detail.html');
    e.preventDefault();
}

const setData = (data) => {
    localStorage.setItem('movieData', JSON.stringify(data));
};

target.addEventListener("click", goto);

// Obtener el popup, el botón de cierre y el botón de cerrar
var popup = document.getElementById("popup");
var closeBtn = document.getElementById("closeBtn");
var dismissBtn = document.getElementById("dismissBtn");

// Mostrar el popup después de 3 segundos (3000ms)
window.onload = function() {
  setTimeout(function() {
    popup.style.display = "flex";
  }, 5000);  // 3000ms = 5 segundos
}

// Cerrar el popup cuando se hace clic en la "X"
closeBtn.onclick = function() {
  popup.style.display = "none";
}

// Cerrar el popup cuando se hace clic en el botón "Cerrar"
dismissBtn.onclick = function() {
  popup.style.display = "none";
}

// Cerrar el popup si se hace clic fuera del contenido del popup
window.onclick = function(event) {
  if (event.target === popup) {
    popup.style.display = "none";
  }
}
