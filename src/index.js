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
    "data_last": ["", "", ""],
    "winrate": 0,
    "data_match": {},
    "mtchs": [],
    "match_info": []
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
        let response = await axios.get('https://' + body.server + '.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + body.username + '?api_key=RGAPI-89416cf6-f3f8-4d12-ae69-21784ce64838')
        stat.status = response.status;
        stat.data_acc = response.data;
        stat.data_acc.profileIconId = 'http://avatar.leagueoflegends.com/' + body.server + '/' + body.username + '.png';
        var response2 = await axios.get('https://' + body.server + '.api.riotgames.com/lol/match/v4/matchlists/by-account/' + response.data.accountId + '?endIndex=10&beginIndex=0&api_key=RGAPI-89416cf6-f3f8-4d12-ae69-21784ce64838')
        stat.data_match = response2.data;
        stat.match_info = [];
        for (let i = 0; i < 10; i++) {
            var response_mtch = await axios.get('https://' + body.server + '.api.riotgames.com/lol/match/v4/matches/' + stat.data_match.matches[i].gameId + '?api_key=RGAPI-89416cf6-f3f8-4d12-ae69-21784ce64838')
            stat.mtchs.push(response_mtch.data);

            // get the object we need to display important things on fight
          
            stat.match_info.push(await fill_obj(i, response_mtch));
            // --------------------------------------------------------------
        }
        stat.winrate *= 10;
        let response3 = await axios.get('https://' + body.server + '.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + stat.data_acc.id + '?api_key=RGAPI-89416cf6-f3f8-4d12-ae69-21784ce64838')
        
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

axios.get('http://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json')
.then(response => { champions = response.data.data })

// ---------------------------------------------------------

app.listen(8080);
