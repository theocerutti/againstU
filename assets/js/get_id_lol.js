/*
** get_id()
** Antoine Maillard
** get the user value and the server value
*/

function get_id()
{
    const username = $('#username').val();
    const server = $('#select_server').val();

    $.ajax({
        method: 'POST',
        url: 'http://localhost:8080/lol',
        data: JSON.stringify({ username, server}),
        headers: {
            'content-type': 'application/json',
        },
        success: (response) => {
            window.location.replace('/lol_stat');
        }
    });
}