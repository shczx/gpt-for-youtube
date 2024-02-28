getcaps();

async function getcaps() {
    const en_track = window.ytplayer.config.args.raw_player_response.captions
                      .playerCaptionsTracklistRenderer.captionTracks.filter(x => x.languageCode === "en");

    if (en_track.length === 0) {
        return;
    }

    fetch(
        en_track[0].baseUrl
    )
        .then(function (response) {
            return response.text();
        })
        .then(function (xmltext) {
            xmltext = xmltext.substring(39);
            let cap = xmltext.replace(
                /<transcript><text start="[+-]?([0-9]*[.])?[0-9]+" dur="[+-]?([0-9]*[.])?[0-9]+">/gm,
                ' '
            );
            cap = cap.replace(
                /<\/text><text start="[+-]?([0-9]*[.])?[0-9]+" dur="[+-]?([0-9]*[.])?[0-9]+">/gm,
                ' '
            );
            cap = cap.replace(/<\/text><\/transcript>/gm, ' ');
            cap = cap.replace(/&amp;#39;/gm, '\'');
            console.log(cap);
            window.postMessage({ type: 'NEW', text: cap }, '*');
        });
}
