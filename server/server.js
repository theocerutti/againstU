/*
** EPITECH PROJECT, 2019
** againstU
** File description:
** node.js server Antoine Maillard
*/

var axios = require('axios');
var express = require('express');

var server = express();

server.use(express.static('public'));

server.get('/', function(req, res) {
    res.redirect('/index/index.html');
});

server.use(function(req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send("Page introuvable!");
});

server.listen(8080);