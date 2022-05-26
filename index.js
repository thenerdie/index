const rankText = document.getElementById('rank-text');
const rankImage = document.getElementById('rank-img');

let user
let platform

function audioListener(audioData) {
    
}

async function main() {
    const data = await fetch(`https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform}/${user}`).then(res => res.json());

    const playlists = data.data.segments.filter(segment => segment.type == "playlist")

    let highest

    playlists.forEach(element => {
        if (element.metadata.name.startsWith("Ranked")) {
            const mmr = element.stats.rating.value

            if (highest ? mmr > highest.mmr : true) {
                highest = { mmr: mmr, icon: element.stats.tier.metadata.iconUrl, rank: element.stats.tier.metadata.name }
            }
        }
    })

    rankText.textContent = `${highest.rank} ● ${highest.mmr} MMR`
    rankImage.src = highest.icon
}

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.user) {
            user = properties.user.value
        }

        if (properties.platform) {
            platform = properties.platform.value
        }

        main()
    }
};

window.wallpaperRegisterAudioListener(audioListener);

setInterval(main, 300000)