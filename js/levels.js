/**
 * EilishTV - Levels Logic Corrected
 */

window.initLevelsUI = function() {
    // Simulación de horas
    const hours = 75; 

    const progressPath = document.getElementById("gaugeProgress");
    const rankTitle = document.getElementById("rankTitle");
    const hoursVal = document.getElementById("hoursVal");
    const nextRankMsg = document.getElementById("nextRankMsg");
    const rewardsContainer = document.getElementById("rewardsContainer");
    const starIcon = document.querySelector(".gauge-content i");

    if (!progressPath) return;

    const rankConfig = {
        "Bronce": { min: 0, target: 10, color: "#cd7f32", benefits: ["Acceso al catálogo estándar"] },
        "Plata": { min: 10, target: 75, color: "#c0c0c0", benefits: ["Acceso a la personalización de perfiles"] },
        "Oro": { min: 75, target: 250, color: "#ffcc00", benefits: ["Acceso Anticipado: 12hs antes que todos"] },
        "Diamante": { min: 250, target: 500, color: "#00d4ff", benefits: ["Follow en Instagram", "15% Descuento Merch", "Acceso Anticipado: 24h", "Soporte prioritario"] }
    };

    let currentRank = "Bronce";
    if (hours >= 250) currentRank = "Diamante";
    else if (hours >= 75) currentRank = "Oro";
    else if (hours >= 10) currentRank = "Plata";

    const config = rankConfig[currentRank];

    // --- LA CORRECCIÓN AQUÍ ---
    // Calculamos el progreso SOLO dentro del rango del nivel actual
    // Si estoy en Diamante (250-500) y tengo 251, el progreso debe ser casi 0.
    const range = config.target - config.min;
    const hoursIntoLevel = hours - config.min;
    const percentage = Math.min(Math.max(hoursIntoLevel / range, 0), 1); 

    const maxDash = 220;
    const offset = maxDash - (maxDash * percentage);

    setTimeout(() => {
        progressPath.style.strokeDashoffset = offset;
        progressPath.style.stroke = config.color;
        rankTitle.textContent = currentRank;
        rankTitle.style.color = config.color;
        if(starIcon) starIcon.style.color = config.color;
        hoursVal.textContent = hours;
        
        if(currentRank !== "Diamante") {
            const next = getNextRank(currentRank);
            const remaining = rankConfig[next].min - hours;
            nextRankMsg.textContent = `Faltan ${remaining} horas para el nivel ${next}`;
        } else {
            nextRankMsg.textContent = "¡Estatus máximo alcanzado!";
        }

        if (rewardsContainer) renderBenefits(config.benefits, config.color);
    }, 100);
};

function renderBenefits(benefits, color) {
    const container = document.getElementById("rewardsContainer");
    if (!container) return;
    container.innerHTML = benefits.map(text => `
        <div class="card fade" style="margin-bottom: 12px; display: flex; align-items: center; gap: 15px; border-left: 5px solid ${color}; padding: 15px; background: #fff;">
            <div style="background: ${color}22; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas fa-check" style="color: ${color}; font-size: 14px;"></i>
            </div>
            <span style="font-weight: 500; color: #333; font-size: 14px;">${text}</span>
        </div>
    `).join('');
}

function getNextRank(current) {
    const ranks = { "Bronce": "Plata", "Plata": "Oro", "Oro": "Diamante" };
    return ranks[current] || "";
}