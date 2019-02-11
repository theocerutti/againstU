function get_id_dota() {
    const username = $('#input_pseudo').val();
    const server = $('#select_server').val();

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/dota_stat",
        data: JSON.stringify({
            username,
            server
        }),
        headers: {
            'content-type': 'application/json',
        },
        success: (response) => {
            window.location.replace('dota_stat')
        }
    });
}
