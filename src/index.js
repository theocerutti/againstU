/*
** PERSONNAL PROJECT, 2019
** Antoine Maillard
** server side
*/

const express = require('express');
const axios = require('axios');
const expressHbs = require('express-hbs');
const bodyParser = require('body-parser');
// const $ = require('jquery');

// $.getScript('get_api_lol.js');
var stat = {
    "status": 0,
    "data_acc": {},
    "data_match": {}
};

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/../views/');
app.use(expressHbs.express4());
app.use('/assets', express.static('./assets'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.redirect('/index');
})

app.get('/index', (req, res) => {
    res.render('index');
})

/*
** User send request on an account
** Get the user and the server.
** Use axios to get API's data and send them at response.
*/

app.post('/lol', async (req, res) => {
    const { body } = req;
    body.username = encodeURIComponent(body.username);
    if (body.server === "EU West") {
        await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + body.username + '?api_key=RGAPI-1998d3e5-13cf-4d4c-a321-bd1cc4733a81')
        .then((response) => {
            stat.status = response.status;
            stat.data_acc = response.data;
            stat.data_acc.profileIconId = "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + stat.data_acc.profileIconId + ".png";
        });
        if (stat.status === 200)
            res.send('Player found');
    } else if (body.server === "North America") {
        await axios.get('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + body.username + '?api_key=RGAPI-1998d3e5-13cf-4d4c-a321-bd1cc4733a81')
        .then((response) => {
            stat.status = response.status;
            stat.data_acc = response.data;
        });
        if (stat.status === 200)
            res.send('Player found');
    }
})

// ---------------------------------------------------------

/*
** page to see LOL stats 
** access on this page only by search
** and if the player is found
*/

app.get('/lol_stat', (req, res) => {
    res.render('lol_stat', { stat });
})

// ---------------------------------------------------------

app.get('/lol', (req, res) => {
    res.render('lol');
})

app.get('/dota', (req, res) => {
    res.render('dota');
})

app.use((req, res, next) => {
    res.sendStatus(404).statusMessage;
})

app.listen(8080);