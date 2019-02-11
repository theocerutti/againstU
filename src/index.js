const express = require('express')
const axios = require('axios')
const expressHbs = require('express-hbs')
const bodyParser = require('body-parser')
const app = express()
var BigNumber = require('bignumber.js')

var stat_dota = {
    id64: 0,
    id32: '0',
    username: 'not found',
    server: 'not found',
    success: -1
}

var convert = new BigNumber('76561197960265728');
function to32(steamId64) {
    steamId64 = new BigNumber(steamId64);
    var steamId32 = steamId64.minus(convert);
    return steamId32.toString();
}

app.set('view engine', 'hbs')
app.set('views', __dirname + '/../views')
app.use(expressHbs.express4())
app.use("/assets", express.static("./assets"))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.redirect('/index')
})

app.get('/index', (req, res) => {
    res.render('index')
})

app.get('/dota', (req, res) => {
    res.render('dota')
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
    const res1_dota = await axios.get("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=291F6255D9427DB13DEEC82679CBFC87&vanityurl=" + body.username)
    stat_dota.id64 = res1_dota.data.response.steamid
    stat_dota.id32 = to32(stat_dota.id64)
    stat_dota.success = res1_dota.data.response.success
    // const res2_dota = await axios.get("")
    if (stat_dota.success === 1)
        res.send('Player found')
})

app.get('/dota_stat', (req, res) => {
    res.render('dota_stat', { stat_dota })
})

app.use((req, res, next) => {
    res.sendStatus(404).statusMessage
})

app.listen(8080)