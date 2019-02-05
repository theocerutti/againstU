/*
** EPITECH PROJECT, 2019
** againstU
** File description:
** script.js
*/

function toogle(img) {
    if (document.getElementById("test").src == "file:///home/theo/GITHUB/inScript/webScript/againstU/lib/images/big_lol.png") {
        document.getElementById("test").src="../lib/images/lol.png";
        console.log(document.getElementById("test").src + " 1");
    } else {
        document.getElementById("test").src="file:///home/theo/GITHUB/inScript/webScript/againstU/lib/images/big_lol.png";
        console.log(document.getElementById("test").src + " 2");
    }
}
