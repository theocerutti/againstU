const express = require('express')
const axios = require('axios')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const app = express()
var BigNumber = require('bignumber.js')

var stat = {
    "status": 0,
    "data_acc": {},
    "data_champ": [[], []],
    "data_match": {},
    "mtchs": [{}, {}, {}, {}, {}]
};

var stat_dota = {
    api_key: '291F6255D9427DB13DEEC82679CBFC87',
    id64: 0,
    id32: '0',
    username: 'not found',
    server: 'not found',
    success: -1,
    PlayerSummaries: {},
    FriendList: {}
}

var convert = new BigNumber('76561197960265728');
function to32(steamId64) {
    steamId64 = new BigNumber(steamId64);
    var steamId32 = steamId64.minus(convert);
    return steamId32.toString();
}
var champions = {};

app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views/');
app.use('/assets', express.static('./assets'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.redirect('/index')
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
    stat.data_champ[0] = Object.keys(champions);
    for (key in champions) {
        stat.data_champ[1].push(champions[key]);
    }
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

app.get('/lol', (req, res) => {
    res.render('lol')
})

app.post('/dota_stat', async (req, res) => {
    const { body } = req
    let server = 'not found'
    if (body.server === "EU West")
        server = 'euw1'
    else if (body.server === "North America")
        server = 'na1'
    stat_dota.username = body.username
    stat_dota.server = body.server
    const res1_dota = await axios.get('http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + stat_dota.api_key + '&vanityurl=' + body.username)
    stat_dota.success = res1_dota.data.response.success
    if (stat_dota.success == 1) {
        stat_dota.id64 = res1_dota.data.response.steamid
        stat_dota.id32 = to32(stat_dota.id64)
        const res2_dota = await axios.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + stat_dota.api_key + '&steamids=' + stat_dota.id64)
        stat_dota.PlayerSummaries = res2_dota.data.response.players[0]
        const res3_dota = await axios.get('http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=' + stat_dota.api_key + '&steamid=' + stat_dota.id64 + '&relationship=friend')
        stat_dota.FriendList = res3_dota.data
    } else {
        console.log("Player not found!!")
    }
    if (stat_dota.success === 1)
        res.send('Player found')
})

app.get('/dota', (req, res) => {
    res.render('dota')
})

app.get('/dota_stat', (req, res) => {
    res.render('dota_stat', { stat_dota })
})

app.get('/lol_stat', (req, res) => {
    res.render('lol_stat', { stat });
})

app.use((req, res, next) => {
    res.sendStatus(404).statusMessage
})

/*
** Get JSON file about champions LOL
*/

axios.get('http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json')
.then(response => { champions = response.data.data })

// ---------------------------------------------------------

app.listen(8080);
