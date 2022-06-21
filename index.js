const rankText = document.getElementById('rank-text');
const rankImage = document.getElementById('rank-img');
const body = document.querySelector('html')

let user
let platform
let animate

let averageVolume

let colors = {
    "Bronze": "#5c4300",
    "Silver": "#636363",
    "Gold": "#806401",
    "Platinum": "#6f9b9e",
    "Diamond": "#0b3373",
    "Champion": "#370542",
    "Grand Champion": "#75060d",
    "Supersonic Legend": "#b1aab3"
}

let divisionToNumber = {
    "Division I": 1,
    "Division II": 2,
    "Division III": 3,
    "Division IV": 4
}

function getAverageVolume(audioData) {
    let total = 0

    audioData.forEach(element => {
        total += element
    })

    return total / audioData.length
}

function audioListener(audioData) {
    if (!animate) {
        rankImage.style.width = `40%`
        rankText.style.transform = `translateY(0%)`
        rankText.style.fontSize = `40px`
        return
    }

    averageVolume = getAverageVolume(audioData)

    rankImage.style.width = `${40 + (averageVolume * 7)}%`
    rankText.style.transform = `translateY(${-averageVolume * 150}%)`
    rankText.style.fontSize = `${40 + (averageVolume * 5)}px`
}

function createParticle() {
    const particle = document.createElement("particle")

    document.body.appendChild(particle)

    const x = (window.innerWidth / 2) + (Math.random() - 0.5) * 300;
    const y = Math.random() * 300 + 200;
    const destinationX = (Math.random() - 0.5) * 600 * (averageVolume + 1);
    const destinationY = (Math.random() - 0.5) * 300 * (averageVolume + 1);
    
    particle.style.width = particle.style.height = `${10}px`;
    const animation = particle.animate([
        { transform: `translate(${x}px, ${y}px)`, opacity: 0.75 },
        { transform: `translate(${x + destinationX}px, ${y + destinationY}px)`, opacity: 0 },
    ], {
        duration: 2000,
        easing: "cubic-bezier(0, .9, .57, 1)"
    })

    animation.onfinish = () => {
        particle.remove()
    }
}

function handleParticles() {
    if (averageVolume > 0.1 && animate) {
        for (let i = 0; i < (averageVolume * 100) / 5; i++)
            createParticle()
    }
}

async function main() {
    const data = await fetch(`https://api.tracker.gg/api/v2/rocket-league/standard/profile/${platform}/${user}`).then(res => res.json()).catch(() => setTimeout(main, 10000));

    const playlists = data.data.segments.filter(segment => segment.type == "playlist")

    let highest

    playlists.forEach(element => {
        if (element.metadata.name.startsWith("Ranked")) {
            const mmr = element.stats.rating.value

            if (highest ? mmr > highest.mmr : true) {
                highest = { mmr: mmr, icon: element.stats.tier.metadata.iconUrl, rank: element.stats.tier.metadata.name, division: element.stats.division.metadata.name, playlist: element.metadata.name }
            }
        }
    })

    const regex = new RegExp("(.+)[^ I| II| III]")
    const [ rankName ] = regex.exec(highest.rank)
    
    if (highest.rank != "Supersonic Legend") {
        const division = []

        for (let i = 0; i < 4; i++) {
            division.push(i < divisionToNumber[highest.division] ? `<span class="alt-code">&#9632;</span>` : `<span class="alt-code">&#9633;</span>`)
        }
        
        rankText.innerHTML = `${highest.playlist} ● ${highest.rank} ${division.join("")} ● ${highest.mmr} MMR`
    } else {
        rankText.innerHTML = `${highest.playlist} ● ${highest.rank} ● ${highest.mmr} MMR`
    }

    rankImage.src = highest.icon

    body.style.backgroundColor = colors[rankName]
}

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.user) {
            user = properties.user.value
        }

        if (properties.platform) {
            platform = properties.platform.value
        }

        if (properties.animate) {
            animate = properties.animate.value
        }

        main()
    }
};

window.wallpaperRegisterAudioListener(audioListener);

setInterval(main, 300000)
setInterval(handleParticles, 30)