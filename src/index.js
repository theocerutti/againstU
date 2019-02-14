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
    "data_champ": [[], []],
    "data_last": ["", "", ""],
    "winrate": 0,
    "data_match": {},
    "mtchs": [],
    "match_info": []
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

async function getIconChamp(id) {
    for (let i = 0; i < stat.data_champ[1].length; i++) {
        if (stat.data_champ[1][i].key == id)
            return ('http://ddragon.leagueoflegends.com/cdn/9.3.1/img/champion/' + stat.data_champ[1][i].image.full);
    }
}

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

async function fill_obj(i, response_mtch)
{
    let obj = {
        "idChamp": 0,
        "img": "",
        "win": "",
        "mode": "",
        "gameTime": 0,
        "level": 0,
        "minions": 0,
        "damageDealt": 0,
        "damageTaken": 0,
        "K": 0,
        "D": 0,
        "A": 0,    
        "KDA": 0,
        "item0": "",
        "item1": "",
        "item2": "",
        "item3": "",
        "item4": "",
        "item5": "",
        "item6": ""
    }

    obj.idChamp = stat.data_match.matches[i].champion;
    obj.img = await getIconChamp(obj.idChamp);
    for (let w = 0; w < 10; w++) {
        if (response_mtch.data.participants[w].championId === obj.idChamp) {
            if (response_mtch.data.participants[w].stats.win === true) {
                obj.win = "WIN";
                stat.winrate += 1;
            } else
                obj.win = "LOSE";
            obj.mode = response_mtch.data.gameMode;
            obj.gameTime = response_mtch.data.gameDuration;
            obj.level = response_mtch.data.participants[w].stats.champLevel;
            obj.minions = response_mtch.data.participants[w].stats.totalMinionsKilled;
            obj.damageDealt = response_mtch.data.participants[w].stats.totalDamageDealtToChampions;
            obj.damageTaken = response_mtch.data.participants[w].stats.totalDamageTaken;
            obj.K = response_mtch.data.participants[w].stats.kills;
            obj.D = response_mtch.data.participants[w].stats.deaths;
            obj.A = response_mtch.data.participants[w].stats.assists;
            obj.KDA = (obj.K + obj.A) / obj.D;
            obj.item0 = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/img/item/' + String(response_mtch.data.participants[w].stats.item0) + '.png';
            obj.item1 = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/img/item/' + String(response_mtch.data.participants[w].stats.item1) + '.png';
            obj.item2 = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/img/item/' + String(response_mtch.data.participants[w].stats.item2) + '.png';
            obj.item3 = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/img/item/' + String(response_mtch.data.participants[w].stats.item3) + '.png';
            obj.item4 = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/img/item/' + String(response_mtch.data.participants[w].stats.item4) + '.png';
            obj.item5 = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/img/item/' + String(response_mtch.data.participants[w].stats.item5) + '.png';
            obj.item6 = 'http://ddragon.leagueoflegends.com/cdn/9.3.1/img/item/' + String(response_mtch.data.participants[w].stats.item6) + '.png';
        } 
    }
    return (obj);
}

app.post('/lol', async (req, res) => {
    stat.match_info = [];
    const { body } = req;
    stat.winrate = 0;
    body.username = encodeURIComponent(body.username);
    stat.data_champ[0] = Object.keys(champions);
    for (key in champions)
        stat.data_champ[1].push(champions[key]);
    if (body.server === "EU West")
        body.server = "euw1";
    else if (body.server === "North America")
        body.server = "na1";
    try {
        let response = await axios.get('https://' + body.server + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + body.username + '?api_key=RGAPI-af61d6d5-b055-4425-9adb-a16439a29a3f')
        stat.status = response.status;
        stat.data_acc = response.data;
        stat.data_acc.profileIconId = 'http://avatar.leagueoflegends.com/' + body.server + '/' + body.username + '.png';
        let response3 = await axios.get('https://' + body.server + '.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + stat.data_acc.id + '?api_key=RGAPI-af61d6d5-b055-4425-9adb-a16439a29a3f')
        
        //get the possibly pick of the player
        let stock = [0, 0, 0];
        for (let w = 0, x = 0; w < 3; w++) {
            for (let i = 0; i < response3.data.length; i++) {
                if (response3.data[i].lastPlayTime > response3.data[x].lastPlayTime || stock[w] === 0) {
                    stock[w] = response3.data[i].championId;
                    x = i;
                }
                if (i === response3.data.length - 1)
                    response3.data[x].lastPlayTime = 0;
            }
        }
        for (let i = 0; i < 3; i++)
            stat.data_last[i] = await getIconChamp(stock[i]);
        //--------------------------------------------------------------

        var response2 = await axios.get('https://' + body.server + '.api.riotgames.com/lol/match/v4/matchlists/by-account/' + response.data.accountId + '?endIndex=10&beginIndex=0&api_key=RGAPI-af61d6d5-b055-4425-9adb-a16439a29a3f')
        stat.data_match = response2.data;
        stat.match_info = [];
        for (let i = 0; i < response2.data.matches.length; i++) {
            var response_mtch = await axios.get('https://' + body.server + '.api.riotgames.com/lol/match/v4/matches/' + response2.data.matches[i].gameId + '?api_key=RGAPI-af61d6d5-b055-4425-9adb-a16439a29a3f')
            stat.mtchs.push(response_mtch.data);

            // get the object we need to display important things on fight
          
            stat.match_info.push(await fill_obj(i, response_mtch));
            // --------------------------------------------------------------
        }
        stat.winrate *= 10;
        } catch (error) {
            res.send('nope');
        }
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

axios.get('http://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json')
.then(response => { champions = response.data.data })

// ---------------------------------------------------------

app.listen(8080);
