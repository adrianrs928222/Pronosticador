const express = require('express');
const router = express.Router();
const axios = require('axios');
const calculateEV = require('./evcalculator');

const API_KEY = process.env.SPORTMONKS_API_KEY;
const leagueIds = [140, 39, 135, 78, 61]; // laliga, premier, serie a, bundesliga, ligue1

router.get('/', async (req, res) => {
    try {
        let matches = [];

        for(const leagueId of leagueIds){
            const url = `https://soccer.sportmonks.com/api/v2.0/fixtures/league/${leagueId}?api_token=${API_KEY}&include=localTeam,visitorTeam`;
            const response = await axios.get(url);
            const data = response.data.data;

            data.forEach(match => {
                matches.push({
                    matchid: match.id,
                    home: match.localTeam.data.name,
                    away: match.visitorTeam.data.name,
                    league: match.league_id,
                    date: match.time.starting_at.date_time,
                    probabilityhome: Math.random() * 0.6 + 0.2,
                    probabilitydraw: Math.random() * 0.3 + 0.1,
                    probabilityaway: Math.random() * 0.6 + 0.1,
                    oddshome: Math.random() * 2 + 1.5,
                    oddsdraw: Math.random() * 2 + 2.5,
                    oddsaway: Math.random() * 3 + 2,

                    // nuevas predicciones
                    btts: Math.random() > 0.5 ? 'sí' : 'no',
                    goles25: Math.random() > 0.5 ? 'más' : 'menos',
                    goles15: Math.random() > 0.5 ? 'más' : 'menos'
                });
            });
        }

        matches = matches.map(match => ({
            ...match,
            evhome: calculateEV(match.probabilityhome, match.oddshome),
            evdraw: calculateEV(match.probabilitydraw, match.oddsdraw),
            evaway: calculateEV(match.probabilityaway, match.oddsaway)
        }));

        res.json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'error obteniendo partidos'});
    }
});

router.get('/:matchid', async (req, res) => {
    const matchId = req.params.matchid;
    try {
        const match = {
            matchid: matchId,
            home: "real madrid",
            away: "barcelona",
            probabilityhome: 0.55,
            probabilitydraw: 0.25,
            probabilityaway: 0.20,
            oddshome: 1.9,
            oddsdraw: 3.4,
            oddsaway: 4.0,
            evhome: 0.045,
            evdraw: -0.15,
            evaway: -0.2,
            btts: 'sí',
            goles25: 'más',
            goles15: 'menos'
        };
        res.json(match);
    } catch(err){
        console.error(err);
        res.status(500).json({error:'error obteniendo partido'});
    }
});

module.exports = router;