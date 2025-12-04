// contador 

// Fecha de la próxima fiesta (año, mes-1, día, hora, minuto)
const evento = new Date("2025-08-12T17:07:00").getTime();

const interval = setInterval(() => {
  const ahora = new Date().getTime();
  const distancia = evento - ahora;

  const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

  document.getElementById("days").innerText = dias.toString().padStart(2, '0');
  document.getElementById("hours").innerText = horas.toString().padStart(2, '0');
  document.getElementById("minutes").innerText = minutos.toString().padStart(2, '0');
  document.getElementById("seconds").innerText = segundos.toString().padStart(2, '0');

  if (distancia < 0) {
    clearInterval(interval);
    document.getElementById("countdown").innerHTML = "<span></span>";
  }
}, 1000);
