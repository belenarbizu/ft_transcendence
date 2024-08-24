
function update_play_form()
{
    var alias_home = document.getElementById("inputAliasHome");
    var alias_guest = document.getElementById("inputAliasGuest");
    var matchmaking = document.getElementById("radioMatchmaking");

    if (matchmaking.checked)
    {
        alias_home.disabled = true;
        alias_guest.disabled = true;
    }
    else
    {
        alias_home.disabled = false;
        alias_guest.disabled = false;
    }
}
