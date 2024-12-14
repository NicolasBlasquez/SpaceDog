"use strict"

const GAME_VERSION = "Alpha 0.1.1";

const CONFIG = {
    resolution: {
        displayText: "1280x720",
        width: 1280,
        height: 720,
    },
    skinId: 0,
    particleCountLimit: 20,
    uiBrightnessChange: 1.5,
    showFPScounter: false,
    muteSfx: false,
    muteMusic: false,
    consoleMessageDuration: 5000,
}

const FPS = {
    count: 0,
    currentFPS: 0,
    lastTimestamp: 0,
    deltaTimestamp: 0,
}

class Engine {
    constructor() {
        this.canvas = document.querySelector("canvas");
        this.context = document.querySelector("canvas").getContext("2d");
        this.entities = [];
        this.objects = [];
        this.particles = [];
        this.backgrounds = [];
        this.paused = false;
        this.clicking = false;

        this.gameStarted = false;

        this.deltaTime = 1;
        this.resolutionFactor = 1;

        this.biomes = [];
        this.currentBiome = 0;

        /**
         * The current view
         * 0: Playing
         * 1: Main menu
         * 2: Config menu
         */
        this.currentView = 1;
        this.update = this.update.bind(this);
    }

    update(timestamp) {
        if (!this.paused) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.fillStyle = this.biomes[this.currentBiome] ? this.biomes[this.currentBiome].backdrop : "black";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = 0; i < this.objects.length; i++) {
                if (this.objects[i].opacity > 0) {
                    this.objects[i].update();
                    this.objects[i].render();
                } else {
                    this.objects[i].update();
                }
            }
            this.biomes[this.currentBiome].update();
        }

        // Frames Per Second

        let time = timestamp ? timestamp : 0

        FPS.count++;

        if (time - FPS.lastTimestamp > 1000) {
            FPS.currentFPS = FPS.count
            FPS.lastTimestamp = time;
            FPS.count = 0
        }

        this.deltaTime = (time - FPS.deltaTimestamp) / 8.3;

        FPS.deltaTimestamp = time;

        requestAnimationFrame(this.update);
    }

    start() {
        this.canvas.height = CONFIG.resolution.height;
        this.canvas.width = CONFIG.resolution.width;

        this.context.imageSmoothingEnabled = false;
        this.resolutionFactor = CONFIG.resolution.height / 720;

        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].start();
        }

        this.biomes[this.currentBiome].start();
    }

    sortEntities() {
        this.objects = this.objects.sort((a, b) => a.layer - b.layer);
    }

    gameOver() {
        if (this.entities["player"].spawnInmunity) return;
        if (this.currentView != 0) return;

        this.currentView = 1;
        this.gameStarted = false;

        ASSETS.audio.effects[0].currentTime = 0;
        ASSETS.audio.effects[0].play();

        for (let i = 0; i < 15; i++) {
            new Particle({
                sprites: [ASSETS.sprites.particles[0], ASSETS.sprites.particles[1], ASSETS.sprites.particles[2]],
                speed: randomBetween(1, 4, false) * SpaceDog.deltaTime * SpaceDog.resolutionFactor,
                layer: 32,
                start() {
                    this.currentSprite = randomBetween(0, 2);
                    this.transform.height = Dog.transform.height / 4.5;
                    this.transform.width = this.transform.height * this.sprites[this.currentSprite].naturalWidth / this.sprites[this.currentSprite].naturalHeight
                    this.transform.x = Dog.transform.x;
                    this.transform.y = Dog.transform.y;
                    this.transform.rotation = randomBetween(-15, 15);
                    this.transform.direction = randomBetween(0, 360);
                },
                update() {
                    this.opacity -= 0.01 * SpaceDog.deltaTime;
                    this.transform.width += 0.1 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                    this.transform.height += 0.1 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                    this.transform.x += Math.cos(degToRad(this.transform.direction)) * this.speed;
                    this.transform.y += Math.sin(degToRad(this.transform.direction)) * this.speed;
                }
            });
        }
        new Particle({
            sprites: [ASSETS.sprites.death[0]],
            layer: 32,
            start() {
                this.transform.height = Dog.transform.height;
                this.transform.width = this.transform.height
                this.transform.x = Dog.transform.x;
                this.transform.y = Dog.transform.y;
            },
            update() {
                this.opacity -= 0.02 * SpaceDog.deltaTime;
                this.transform.width += 3.5 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                this.transform.height += 3.5 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
            }
        });

        Dog.hidden = true;
    }

    addParticle(particle) {
        this.objects.push(particle);
        this.particles.push(particle);
        if (this.particles.length > CONFIG.particleCountLimit) {
            let leftOutParticle = this.particles.shift();
            this.particles = this.particles.filter(p => p != leftOutParticle);
            this.objects = this.objects.filter(p => p != leftOutParticle);
        }
        particle.start();

        this.sortEntities();
    }

    addEntity(entity) {
        this.objects.push(entity);
        this.entities.push(entity); this.entities[entity.name] = entity;
        this.sortEntities();
    }

    deleteEntity(entity) {
        this.objects = this.objects.filter(e => e != entity);
    }

    // Events

    onClick(engine) {
        for (let i = 0; i < this.entities.length; i++) {
            if (!this.entities[i].hidden && checkHitbox(engine.Cursor.transform.x, engine.Cursor.transform.y, this.entities[i].transform.x, this.entities[i].transform.y, this.entities[i].transform.width, this.entities[i].transform.height)) {
                this.entities[i].onClick();
            }
        }
    }
    onMouseMove(engine) {
        let cursor = 0;
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].hovering = false;
            if (!this.entities[i].hidden && checkHitbox(engine.Cursor.transform.x, engine.Cursor.transform.y, this.entities[i].transform.x, this.entities[i].transform.y, this.entities[i].transform.width, this.entities[i].transform.height)) {
                this.entities[i].onMouseMove();
                this.entities[i].hovering = true;
                if (this.entities[i].cursor >= cursor) {
                    cursor = this.entities[i].cursor;
                }
            }
        }
        engine.Cursor.changeCursor(cursor);
    }
    onKeyDown(engine, e) {
        if (e.repeat) return;
        if (e.code == "Space" || e.code == "ArrowUp") {
            engine.clicking = true;
            engine.entities["player"].jump();
        }
        if (e.code == "Escape" && SpaceDog.currentView == 0) {
            SpaceDog.paused = !SpaceDog.paused;
        }
    }
    onKeyUp(engine, e) {
        if (e.code == "Space" || e.code == "ArrowUp") {
            engine.clicking = false;

        }
    }
    onMouseDown(engine) {
        engine.clicking = true;
        engine.entities["player"].jump();

        for (let i = 0; i < this.entities.length; i++) {
            if (!this.entities[i].hidden && checkHitbox(engine.Cursor.transform.x, engine.Cursor.transform.y, this.entities[i].transform.x, this.entities[i].transform.y, this.entities[i].transform.width, this.entities[i].transform.height)) {
                this.entities[i].onMouseDown();
            }
        }

    }
    onMouseUp(engine) {
        engine.clicking = false;
        this.entities.forEach(e => {
            e.onMouseUp();
        })
    }
}

class AudioManager {
    constructor(params) {
        this.musicPlaying = false;

        this.music = ASSETS.audio.music;
        this.sfx = [...ASSETS.audio.effects, ...ASSETS.audio.select];

        Object.assign(this, params);

        this.muteMusic(CONFIG.muteMusic);
        this.muteSFX(CONFIG.muteSfx);

        ASSETS.audio.music.forEach(a => {
            a.addEventListener("ended", () => {
                this.playMusic();
            })
        });
    }
    playMusic() {
        this.music[randomBetween(0, 2)].play();
        this.musicPlaying = true;
    }
    muteMusic(boolean = true) {
        this.music.forEach(e => {
            e.muted = boolean;
        });
        this.mutedMusic = boolean;
    }
    muteSFX(boolean = true) {
        this.sfx.forEach(e => {
            e.muted = boolean;
        });
        this.mutedSfx = boolean;
    }
}

class Cursor {
    constructor() {
        this.transform = {};
        this.sprites = [
            "src/assets/sprites/cursor_default.png",
            "src/assets/sprites/cursor_pointer.png",
            "src/assets/sprites/cursor_hand.png",
            "src/assets/sprites/cursor_hold.png",
        ];
        this.globalCursor = undefined;
        this.start();
    }
    start() {
        window.addEventListener("mousemove", (e) => {
            this.setCoordinates(e.clientX, e.clientY);
        });

        // Mobile device events

        window.addEventListener("touchmove", (e) => {
            if (e.changedTouches.length == 1) {
                this.setCoordinates(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        });
        window.addEventListener("touchstart", (e) => {
            if (e.changedTouches.length == 1) {
                SpaceDog.touchDevice = true;
                this.setCoordinates(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                SpaceDog.onMouseDown(SpaceDog);
            }

        });
        window.addEventListener("touchend", (e) => {
            if (e.changedTouches.length == 1) {
                this.setCoordinates(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                SpaceDog.onMouseUp(SpaceDog);
            }
        });
    }
    changeCursor(number) {
        if (this.globalCursor) SpaceDog.canvas.style.cursor = `url("${this.sprites[this.globalCursor]}"), auto`;
        else SpaceDog.canvas.style.cursor = `url("${this.sprites[number]}"), auto`;
    }

    setCoordinates(clientX, clientY) {
        this.transform.x = (clientX - SpaceDog.canvas.offsetLeft) * SpaceDog.canvas.width / SpaceDog.canvas.clientWidth;
        this.transform.y = (clientY - SpaceDog.canvas.offsetTop) * SpaceDog.canvas.height / SpaceDog.canvas.clientHeight;
    }
}

class LocalDataManager {
    constructor(params) {
        Object.assign(this, params);
        if (localStorage.getItem("saved_game")) {
            this.load();
        } else {
            localStorage.setItem("saved_game", true);
            this.save();
        }
    }
    save() {
        localStorage.setItem("saved_game", true);
        localStorage.setItem("config", JSON.stringify(CONFIG));
    }
    load() {
        Object.assign(CONFIG, JSON.parse(localStorage.getItem("config")));
    }
    eraseAllData() {
        for (let i = 0; i < localStorage.length; i++) { let key = localStorage.key(i); localStorage.removeItem(key); }
        // this.load();
    }
}

const SpaceDog = new Engine();
SpaceDog.LocalDataManager = new LocalDataManager();
SpaceDog.AudioManager = new AudioManager();
SpaceDog.Cursor = new Cursor();

// Events

window.addEventListener("click", () => {
    SpaceDog.onClick(SpaceDog);
    if (!SpaceDog.AudioManager.musicPlaying) {
        SpaceDog.AudioManager.playMusic()
    }
});

window.addEventListener("mousemove", () => {
    SpaceDog.onMouseMove(SpaceDog);
});

window.addEventListener("mousedown", () => {
    if (!SpaceDog.touchDevice) {
        SpaceDog.onMouseDown(SpaceDog);
    }
    SpaceDog.touchDevice = false;
});

window.addEventListener("mouseup", () => {
    SpaceDog.onMouseUp(SpaceDog);
});

window.addEventListener("keydown", (e) => {
    SpaceDog.onKeyDown(SpaceDog, e);
});

window.addEventListener("keyup", (e) => {
    SpaceDog.onKeyUp(SpaceDog, e);
});