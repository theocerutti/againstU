/*
** PERSONNAL PROJECT, 2019
** Antoine Maillard
** server side
*/

const express = require('express');
const axios = require('axios');
const expressHbs = require('express-hbs');
const bodyParser = require('body-parser');

var stat = {
    "status": 0,
    "data_acc": {},
    "data_match": {},
    "mtchs": [{}, {}, {}, {}, {}]
};

var champions = {};

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
    if (body.server === "EU West")
        body.server = "euw1";
    else if (body.server === "North America")
        body.server = "na1";
    try {
        const response = await axios.get('https://' + body.server + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + body.username + '?api_key=RGAPI-1797dde5-2bb3-4acc-9c10-1cf343b57646')
        stat.status = response.status;
        stat.data_acc = response.data;
        stat.data_acc.profileIconId = 'http://avatar.leagueoflegends.com/' + body.server + '/' + body.username + '.png';
        const response2 = await axios.get('https://' + body.server + '.api.riotgames.com/lol/match/v4/matchlists/by-account/' + response.data.accountId + '?api_key=RGAPI-1797dde5-2bb3-4acc-9c10-1cf343b57646')
        stat.data_match = response2.data;
        for (var i = 0; i < 5; i++) {
            const response_mtch = await axios.get('https://' + body.server + '.api.riotgames.com/lol/match/v4/matches/' + stat.data_match.matches[i].gameId + '?api_key=RGAPI-1797dde5-2bb3-4acc-9c10-1cf343b57646')
            stat.mtchs[i] = response_mtch;
        }
    } catch (error) { console.log(error) }
    if (stat.status === 200)
        res.send('Player Found!');
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

/*
** Get JSON file about champions LOL
*/

axios.get('http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json')
.then(response => { champions = response.data.data })

// ---------------------------------------------------------

app.listen(8080);