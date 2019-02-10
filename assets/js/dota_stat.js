function get_id_dota() {
    const username = $('#input_pseudo').val();
    const country = $('#select_server').val();

    console.log(username, country);

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/dota_stat",
        data: JSON.stringify({
            username,
            country
        }),
        headers: {
            'content-type': 'application/json',
        },
        success: (response) => {
            alert(response);
        }
    });
}
