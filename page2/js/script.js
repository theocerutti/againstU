var pseudo;
var server_country;

async function getPseudo()
{
    pseudo = document.getElementById("input_pseudo").value;
}

async function getServerCountry()
{
    server_country = document.getElementById("select_server").value;
}

async function main()
{
    await getPseudo();
    await getServerCountry();

    var newLink = document.createElement('p');
    newLink.id = "p_test";
    var text = document.createTextNode(all);
    newLink.appendChild(text);
    document.body.appendChild(newLink)
}
