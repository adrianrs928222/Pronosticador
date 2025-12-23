/* -------------------- server.js -------------------- */ const express = require('express'); const axios = require('axios'); const cors = require('cors'); require('dotenv').config();

const app = express(); const port = process.env.PORT || 10000;

app.use(cors()); app.use(express.json());

const API_KEY = process.env.API_FOOTBALL_KEY; const BASE_URL = 'https://v3.football.api-sports.io';

// Obtener partidos de hoy con predicciones reales app.get('/matches/today', async (req, res) => { try { const response = await axios.get(${BASE_URL}/fixtures?date=${new Date().toISOString().split('T')[0]}, { headers: { 'x-apisports-key': API_KEY } }); const matches = response.data.response;

const resultado = await Promise.all(matches.map(async match => {
        const homeId = match.teams.home.id;
        const awayId = match.teams.away.id;

        const [homeStatsRes, awayStatsRes] = await Promise.all([
            axios.get(`${BASE_URL}/teams/statistics?team=${homeId}&season=2025`, { headers: { 'x-apisports-key': API_KEY } }),
            axios.get(`${BASE_URL}/teams/statistics?team=${awayId}&season=2025`, { headers: { 'x-apisports-key': API_KEY } })
        ]);

        const homeGoals = homeStatsRes.data.response.goals.for.minute['total']?.average || 1;
        const awayGoals = awayStatsRes.data.response.goals.for.minute['total']?.average || 1;

        // Predicción Ambos anotan
        const probHome = homeGoals / 3;
        const probAway = awayGoals / 3;
        const ambosAnotan = (probHome * probAway) > 0.5 ? 'Sí' : 'No';

        // Predicción +1.5 y +2.5 goles
        const golesEsperados = homeGoals + awayGoals;
        const mas15 = golesEsperados > 1.5 ? 'Sí' : 'No';
        const mas25 = golesEsperados > 2.5 ? 'Sí' : 'No';

        return { ...match, ambosAnotan, mas15, mas25 };
    }));

    res.json(resultado);
} catch (error) {
    res.status(500).json({ error: error.message });
}

});

app.listen(port, () => console.log(Servidor corriendo en puerto ${port}));

/* -------------------- style.css -------------------- */ *{margin:0;padding:0;box-sizing:border-box;} body{font-family:'Roboto',sans-serif;background:linear-gradient(135deg,#1e3c72,#2a5298);color:#fff;min-height:100vh;} .container{max-width:1300px;margin:50px auto;padding:30px;background:rgba(0,0,0,0.8);border-radius:15px;box-shadow:0 15px 40px rgba(0,0,0,0.5);backdrop-filter:blur(5px);} h1{text-align:center;margin-bottom:25px;font-size:2.5rem;text-shadow:2px 2px 8px rgba(0,0,0,0.7);letter-spacing:1px;} .filtros{text-align:center;margin-bottom:20px;} #liga-select{padding:10px 20px;font-size:16px;border-radius:8px;border:none;outline:none;background:linear-gradient(45deg,#ff4e50,#f9d423);color:#000;cursor:pointer;transition:all 0.3s ease;} #liga-select:hover{transform:scale(1.05);} table{width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;margin-bottom:30px;box-shadow:0 10px 30px rgba(0,0,0,0.3);} thead{background:linear-gradient(90deg,#ff4e50,#f9d423);} th{padding:12px;text-align:center;font-weight:bold;color:#fff;text-transform:uppercase;font-size:14px;} td{padding:12px;text-align:center;font-size:13px;transition:all 0.3s ease;} tr:nth-child(even){background:rgba(255,255,255,0.05);} tr:hover{background:rgba(255,255,255,0.2);transform:scale(1.01);} .positivo{background:#4caf50;color:#fff;font-weight:bold;border-radius:6px;} .negativo{background:#f44336;color:#fff;font-weight:bold;border-radius:6px;} #modal-partido{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);padding:30px;border-radius:15px;box-shadow:0 20px 50px rgba(0,0,0,0.7);z-index:1000;display:none;width:90%;max-width:600px;animation:fadeIn 0.5s ease;} #modal-partido h2{margin-bottom:15px;font-size:1.8rem;text-align:center;color:#f9d423;text-shadow:1px 1px 5px rgba(0,0,0,0.7);} #modal-partido p{margin-bottom:10px;font-size:14px;} canvas{width:100% !important;height:auto !important;background:rgba(255,255,255,0.1);border-radius:12px;margin-bottom:30px;} @keyframes fadeIn{0%{opacity:0;transform:translate(-50%,-60%);}100%{opacity:1;transform:translate(-50%,-50%);}} @media(max-width:1200px){table,thead,tbody,th,td,tr{display:block;}th{position:sticky;top:0;background:linear-gradient(90deg,#ff4e50,#f9d423);}td{text-align:right;padding-left:50%;position:relative;}td::before{position:absolute;left:10px;width:45%;white-space:nowrap;font-weight:bold;content:attr(data-label);color:#fff;}tr{margin-bottom:15px;border-bottom:2px solid rgba(255,255,255,0.2);}} #modal-partido button{padding:10px 20px;background:linear-gradient(45deg,#f9d423,#ff4e50);border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;transition:all 0.3s ease;} #modal-partido button:hover{transform:scale(1.05);}

/* -------------------- app.js -------------------- */ const tabla = document.querySelector('#tabla-partidos tbody'); const ligaSelect = document.querySelector('#liga-select'); const modal = document.getElementById('modal-partido'); const detalleP = document.getElementById('detalle');

async function cargarPartidos() { const res = await fetch('/matches/today'); const data = await res.json();

tabla.innerHTML = '';
const ligas = new Set();

data.forEach(match => {
    const fecha = match.fixture.date.split('T')[0];
    const hora = match.fixture.date.split('T')[1].split('+')[0];
    const local = match.teams.home.name;
    const visitante = match.teams.away.name;
    const ambos = match.ambosAnotan;
    const mas15 = match.mas15;
    const mas25 = match.mas25;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td data-label="Fecha">${fecha}</td>
        <td data-label="Hora">${hora}</td>
        <td data-label="Local">${local}</td>
        <td data-label="Visitante">${visitante}</td>
        <td data-label="Ambos anotan">${ambos}</td>
        <td data-label="+1.5 goles">${mas15}</td>
        <td data-label="+2.5 goles">${mas25}</td>
    `;

    tr.addEventListener('click', () => mostrarModal(match));
    tabla.appendChild(tr);

    ligas.add(match.league.name);
});

ligaSelect.innerHTML = '<option value="">Todas las ligas</option>' + Array.from(ligas).map(l => `<option value="${l}">${l}</option>`).join('');

}

function mostrarModal(match){ detalleP.innerHTML = <strong>${match.teams.home.name} vs ${match.teams.away.name}</strong><br> Liga: ${match.league.name}<br> Fecha: ${match.fixture.date}<br> Estadio: ${match.fixture.venue.name || 'N/A'}<br> Ciudad: ${match.fixture.venue.city || 'N/A'}<br> Ambos anotan: ${match.ambosAnotan}<br> +1.5 goles: ${match.mas15}<br> +2.5 goles: ${match.mas25}<br>; modal.style.display = 'block'; }

function cerrarModal(){ modal.style.display = 'none'; }

ligaSelect.addEventListener('change', () => { const liga = ligaSelect.value; Array.from(tabla.children).forEach(tr => { if(!liga) tr.style.display = ''; else tr.style.display = tr.children[4].textContent.includes(liga) ? '' : 'none'; }); });

cargarPartidos();