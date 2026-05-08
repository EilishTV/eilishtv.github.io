const input = document.getElementById("searchInput");

// obtener query desde la URL
const params = new URLSearchParams(window.location.search);
const query = params.get("q");

// poner lo buscado en el input
if(query){
    input.value = decodeURIComponent(query);
}

// volver a buscar cuando presiona Enter
input.addEventListener("keydown", function(e){

    if(e.key === "Enter"){

        const newQuery = input.value.trim();

        if(newQuery !== ""){
            window.location.href = `/browse/search?q=${encodeURIComponent(newQuery)}`;
        }

    }

});