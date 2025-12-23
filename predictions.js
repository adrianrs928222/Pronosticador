const express = require('express');
const router = express.Router();
const axios = require('axios');

const calculateEV = require('./evcalculator');

const API_KEY = process.env.SPORTMONKS_API_KEY;

// Aquí ponemos todas las ligas que queremos
const ligas = [
    {id: 140, nombre: 'LaLiga'},
    {id: 39, nombre: 'Premier League'},
    {id: 135, nombre: 'Serie A'},
    {id: 78, nombre: 'Bundesliga'},
    {id: 61, nombre: 'Ligue 1'}
];

router.get('/', async (req, res) => {
    try {
        let partidos = [];

        for(const liga of ligas){
            const url = `https://soccer.sportmonks.com/api/v2.0/fixtures/league/${liga.id}?api_token=${API_KEY}&include=localTeam,visitorTeam`;
            const response = await axios.get(url);
            const data = response.data.data;

            data.forEach(partido => {
                partidos.push({
                    idpartido: partido.id,
                    local: partido.localTeam.data.name,
                    visitante: partido.visitorTeam.data.name,
                    liga: liga.nombre,
                    fecha: partido.time.starting_at.date_time,
                    probabilidad_local: Math.random() * 0.6 + 0.2,
                    probabilidad_empate: Math.random() * 0.3 + 0.1,
                    probabilidad_visitante: Math.random() * 0.6 + 0.1,
                    cuotas_local: Math.random() * 2 + 1.5,
                    cuotas_empate: Math.random() * 2 + 2.5,
                    cuotas_visitante: Math.random() * 3 + 2,
                    btts: Math.random() > 0.5 ? 'sí' : 'no',
                    goles25: Math.random() > 0.5 ? 'más' : 'menos',
                    goles15: Math.random() > 0.5 ? 'más' : 'menos'
                });
            });
        }

        // Calculamos EV
        partidos = partidos.map(p => ({
            ...p,
            ev_local: calculateEV(p.probabilidad_local, p.cuotas_local),
            ev_empate: calculateEV(p.probabilidad_empate, p.cuotas_empate),
            ev_visitante: calculateEV(p.probabilidad_visitante, p.cuotas_visitante)
        }));

        res.json(partidos);

    } catch(err){
        console.error(err);
        res.status(500).json({error: 'Error obteniendo los partidos'});
    }
});

router.get('/:idpartido', async (req, res) => {
    const id = req.params.idpartido;
    try {
        // Aquí normalmente buscarías el partido real
        // Para ejemplo usamos datos aleatorios
        const partido = {
            idpartido: id,
            local: "Real Madrid",
            visitante: "Barcelona",
            probabilidad_local: 0.55,
            probabilidad_empate: 0.25,
            probabilidad_visitante: 0.20,
            cuotas_local: 1.9,
            cuotas_empate: 3.4,
            cuotas_visitante: 4.0,
            ev_local: 0.045,
            ev_empate: -0.15,
            ev_visitante: -0.2,
            btts: 'sí',
            goles25: 'más',
            goles15: 'menos'
        };
        res.json(partido);
    } catch(err){
        console.error(err);
        res.status(500).json({error:'Error obteniendo el partido'});
    }
});

module.exports = router;