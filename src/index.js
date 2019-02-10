const express = require('express');
const axios = require('axios');
const expressHbs = require('express-hbs');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/../views');
app.use(expressHbs.express4());
app.use("/assets", express.static("./assets"));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.redirect('/index');
})

app.get('/index', (req, res) => {
    res.render('index');
})

app.get('/dota', (req, res) => {
    res.render('dota');
})

app.post('/dota', async (req, res) => {
    const { body } = req;
    console.log("j'ai recu une reponse")
    var country;
    console.log(body);
    if (body.server === "EU West")
        country = 'euw1';
    else if (body_server == "North America")
        country = 'na1';
    await axios.get("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=291F6255D9427DB13DEEC82679CBFC87&vanityurl=" + body.username)
        .then((response) => {
        });
    if (stat.status === 200) {
        res.send('Player found');
    }
})

app.get('/dota_stat', (req, res) => {
    res.render('dota_stat', { stat_dota });
})

app.use((req, res, next) => {
    res.sendStatus(404).statusMessage;
})

app.listen(8080);