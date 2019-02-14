function get_id_dota() {
    const steamid = $('#input_steamid').val();

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/dota_stat",
        data: JSON.stringify({
            steamid
        }),
        headers: {
            'content-type': 'application/json',
        },
        success: (response) => {
            if (response === "player_not_found") {
                alert("Player not found or private profile")
            } else {
                window.location.replace('dota_stat')
            }
        }
    });
}
