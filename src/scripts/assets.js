`use strict`

const ASSETS = {
    setted: 0,
    loaded: 0,
    finishedLoading: false,
}

const BASE_URI = `src/assets/`;

function loadImg(src) {
    let img = new Image();
    img.src = `${BASE_URI}sprites/${src}`;
    ASSETS.setted++;
    img.addEventListener(`load`, () => {
        console.log(`loaded: `, src);
        ASSETS.loaded++;
        finishedLoading();
    });
    return img;
}

function loadAudio(src) {
    let audio = new Audio(`${BASE_URI}audio/${src}`);
    audio.begin = () => { this.currentTime = 0; this.play();}
    ASSETS.setted++;
    let event = audio.addEventListener(`canplaythrough`, () => {
        if (!ASSETS.finishedLoading) {
            console.log(`loaded: `, src);
            removeEventListener(`canplaythrough`, event)
            ASSETS.loaded++;
            finishedLoading();
        }
    })
    return audio;
}

function finishedLoading() {
    if (ASSETS.loaded === ASSETS.setted) {
        SpaceDog.start();
        SpaceDog.update();
        console.log(`Assets loaded`);
        ASSETS.finishedLoading = true;
    }
}

Object.assign(ASSETS, {
    fonts: {
        pixelFont: `src/assets/pixelFont.ttf`,
    },
    sprites: {
        skins: [
            [loadImg(`dog0.png`), loadImg(`dog1.png`)],
            [loadImg(`cat0.png`), loadImg(`cat1.png`)],
        ],
        enemies: {
            monsterIdle: [loadImg(`monster0.png`), loadImg(`monster1.png`), loadImg(`monster2.png`), loadImg(`monster3.png`), loadImg(`monster4.png`)],
            monsterShooting: [loadImg(`monster5.png`), loadImg(`monster6.png`), loadImg(`monster7.png`), loadImg(`monster8.png`), loadImg(`monster9.png`), loadImg(`monster10.png`), loadImg(`monster11.png`), loadImg(`monster12.png`), loadImg(`monster13.png`)],
        },
        proyectiles: {
            monster: [loadImg(`proyectile0.png`), loadImg(`proyectile1.png`), loadImg(`proyectile2.png`), loadImg(`proyectile3.png`), loadImg(`proyectile4.png`)]
        },
        asteroids: {
            green: [loadImg(`asteroid0.png`), loadImg(`asteroid1.png`)],
            gray: [loadImg(`asteroid2.png`), loadImg(`asteroid3.png`)],
        },
        stars: [loadImg(`stars.png`)],
        planets: [loadImg(`mars.png`), loadImg(`venus.png`)],
        particles: [loadImg(`particles0.png`), loadImg(`particles1.png`), loadImg(`particles2.png`)],
        death: [loadImg(`particles3.png`)],
    },
    audio: {
        music: [loadAudio(`AsteroidBelt.wav`), loadAudio(`ColdVoid.wav`), loadAudio(`LightYears.wav`)],
        effects: [loadAudio(`ExplosionPIOLA.wav`), loadAudio(`jump.wav`), loadAudio(`charge.wav`), loadAudio(`shoot.wav`)],
        select: [loadAudio(`select0.wav`), loadAudio(`select1.wav`)],
    },
    uiElements: {
        start: [loadImg(`button_start.png`)],
        title: [loadImg(`title_main.png`)],
        refresh: [loadImg(`button_refresh.png`)],
        title_settings: [loadImg(`title_settings.png`)],
        config: [loadImg(`button_config.png`)],
        back: [loadImg(`button_back.png`)],
        toggle: [loadImg(`toggle_off.png`), loadImg(`toggle_on.png`)],
        range: [loadImg(`range_track.png`), loadImg(`range_handle.png`)],
        pause: [loadImg(`button_pause.png`)],
    },
});