const express = require('express')
const axios = require('axios')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const app = express()
var BigNumber = require('bignumber.js')
var moment = require('moment')

var stat = {
    "status": 0,
    "data_acc": {},
    "data_match": {},
    "mtchs": [{}, {}, {}, {}, {}]
};

var stat_dota = {
    api_key: '291F6255D9427DB13DEEC82679CBFC87',
    id64: 0,
    id32: 0,
    success: 1,
    PlayerSummaries: {},
    RecentMatches: {},
    RecentMatchesDetail: [],
    RecentSelfMatchesDetail: [],
    HeroesInfo: {},
    ItemsInfo: {}
}

var convert = new BigNumber('76561197960265728');
function to64(steamId32) {
    steamId32 = new BigNumber(steamId32);
    var steamId64 = steamId32.plus(convert);
    return steamId64.toString();
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
    stat_dota.id32 = body.steamid
    stat_dota.server = body.server
    try {
        stat_dota.id64 = to64(stat_dota.id32)
        const info_player_summaries = await axios.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + stat_dota.api_key + '&steamids=' + stat_dota.id64)
        stat_dota.PlayerSummaries = info_player_summaries.data.response.players[0]
        const info_match_history = await axios.get('https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=' + stat_dota.api_key + '&account_id=' + stat_dota.id32 + '&matches_requested=5')
        stat_dota.RecentMatches = info_match_history.data
        for (var match = 0; match < 5; match++) {
            var info_full_match = await axios.get('http://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v001?key=' + stat_dota.api_key + '&match_id=' + stat_dota.RecentMatches.result.matches[match].match_id)
            stat_dota.RecentMatchesDetail[match] = info_full_match.data
        }
        var info_self_match = await axios.get('https://api.opendota.com/api/players/' + stat_dota.id32 + '/recentMatches?api_key=' + stat_dota.api_key + '&limit=5')
        stat_dota.RecentSelfMatchesDetail = info_self_match.data
        const info_heroes = await axios.get('http://api.steampowered.com/IEconDOTA2_570/GetHeroes/v1?key=' + stat_dota.api_key + '&language=en_us')
        stat_dota.HeroesInfo = info_heroes.data.result
        const info_items = await axios.get('http://api.steampowered.com/IEconDOTA2_570/GetGameItems/v1?key=' + stat_dota.api_key + '&language=en_us')
        stat_dota.ItemsInfo = info_items.data.result
    } catch (error) {
        res.send('player_not_found');
    }
    if (stat_dota.success === 1)
        res.send('Player found')
})

app.get('/dota', (req, res) => {
    res.render('dota')
})

app.get('/dota_stat', (req, res) => {
    res.render('dota_stat', { stat_dota, moment })
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
