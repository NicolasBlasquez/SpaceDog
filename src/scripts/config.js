"use strict"

const PROPS = {
    Planets: new Entity({
        name: "planets",
        sprites: [ASSETS.sprites.planets[0], ASSETS.sprites.planets[1]],
        layer: 2,
        start() {
            this.currentSprite = randomBetween(0, this.sprites.length - 1);
            this.randomSizeFactor = randomBetween(0.5, 1.5, false);
            this.transform.height = SpaceDog.canvas.height / 9 * this.randomSizeFactor;
            this.transform.width = this.transform.height * this.sprites[this.currentSprite].naturalWidth / this.sprites[this.currentSprite].naturalHeight;
            this.transform.x = SpaceDog.canvas.width + this.transform.width + 10 + randomBetween(0, 150);
            this.transform.y = randomBetween(50 + this.transform.height, SpaceDog.canvas.height - 50);
        },
        update() {
            this.transform.x -= 0.5 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
            if (this.transform.x < 0 - this.transform.width - 10) { this.start(); }
        },
    }),
    Stars: new Entity({
        name: "stars",
        sprites: ASSETS.sprites.stars,
        layer: 1,
        //818 470
        start() {
            this.transform.height = SpaceDog.canvas.height / 2;
            this.transform.width = this.transform.height * 818 / 470;
            this.transform.x = 0;
            this.transform.y = 0;
        },
        update() {
            this.transform.x += 0.2 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
            if (this.transform.x >= this.transform.width) { this.transform.x = 0; }
        },
        render() {
            let imageX = Math.ceil(SpaceDog.canvas.width / this.transform.width) + 1;
            let imageY = Math.ceil(SpaceDog.canvas.height / this.transform.height);

            for (let i = 0; i < imageY; i++) {
                for (let j = 0; j < imageX; j++) {
                    SpaceDog.context.drawImage(this.sprites[0], j * this.transform.width - this.transform.x, i * this.transform.height, this.transform.width, this.transform.height);
                }
            }
        }
    }),
};

const Dog = new Entity({
    name: "player",
    layer: 10,
    particleFrequency: 8,
    particleTimelapse: 0,
    spawnInmunity: false,
    skin: CONFIG.skinId,
    sprites: ASSETS.sprites.skins[CONFIG.skinId],
    update() {
        if (SpaceDog.currentView == 0) {
            this.transform.y += this.transform.speed[1] * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
            console.log(this.transform.speed[1], SpaceDog.deltaTime);
            this.transform.speed[1] += 0.195 * SpaceDog.deltaTime;
            this.transform.angularMomentum += 0.05 * SpaceDog.deltaTime;;
            this.particleTimelapse += 1 * SpaceDog.deltaTime;

            // Límites

            if (this.transform.y > SpaceDog.canvas.height) {
                if (this.spawnInmunity) {
                    this.transform.speed[1] = -12;
                } else {
                    this.transform.speed[1] = 0;
                    SpaceDog.gameOver();
                }
            } else if (this.transform.y < 0) {
                this.transform.y = 0;
                this.transform.speed[1] = 0
            }

            if (this.transform.angularMomentum > 2) {
                this.transform.angularMomentum = 2;
            } else if (this.transform.angularMomentum < -2) {
                this.transform.angularMomentum = -2;
            }

            // Partículas

            if (this.particleTimelapse >= this.particleFrequency) {
                this.particleTimelapse = 0;
                new Particle({
                    layer: 4,
                    sprites: [ASSETS.sprites.particles[0], ASSETS.sprites.particles[1], ASSETS.sprites.particles[2]],
                    start() {
                        this.currentSprite = randomBetween(0, 2);
                        this.transform.height = Dog.transform.height / 4.5;
                        this.transform.width = this.transform.height * this.sprites[this.currentSprite].naturalWidth / this.sprites[this.currentSprite].naturalHeight
                        this.transform.x = Dog.transform.x - Dog.transform.width / 3;
                        this.transform.y = Dog.transform.y;
                        this.transform.direction = Dog.transform.rotation + randomBetween(-15, 15);
                        this.transform.rotation = Dog.transform.rotation + randomBetween(-15, 15);
                    },
                    update() {
                        this.opacity -= 0.02 * SpaceDog.deltaTime;
                        this.transform.width += 0.2 * SpaceDog.deltaTime;
                        this.transform.height += 0.2 * SpaceDog.deltaTime;
                        this.transform.x -= Math.cos(degToRad(this.transform.direction)) * 3 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                        this.transform.y -= Math.sin(degToRad(this.transform.direction)) * 3 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                    }
                });
            }
        } else if (SpaceDog.currentView == 1) {
            this.transform.y = SpaceDog.canvas.height / 2;
            this.transform.rotation = 0;
        } else if (SpaceDog.currentView == 2) {
            this.hidden = false;
            this.transform.x = SpaceDog.canvas.width / 4;
            this.transform.y = SpaceDog.canvas.height / 2;
            this.transform.width = SpaceDog.canvas.width / 5;
            this.transform.height = this.transform.width / 120 * 92;
            if (this.hovering) {
                this.cursor = 1;
            } else { this.cursor = 0 }
        }
    },
    start() {
        this.transform.x = SpaceDog.canvas.width / 8;
        this.transform.width = SpaceDog.canvas.width / 12;
        this.transform.height = this.transform.width / 120 * 92;
        setInterval(() => {
            if (Dog.currentSprite == 0) { Dog.currentSprite = 1; } else { Dog.currentSprite = 0; }
        }, 250);
    },
    jump() {
        if (SpaceDog.paused || UI_ELEMENTS.Buttons.Pause.hovering) return;
        if (SpaceDog.currentView == 0) {
            this.transform.speed[1] = -6.5;
            this.transform.rotation = 18;
            ASSETS.audio.effects[1].currentTime = 0;
            ASSETS.audio.effects[1].play();
        }
    },
    onClick() {
        if (SpaceDog.currentView == 2) {
            this.skin = (this.skin + 1) % 2;
            this.sprites = ASSETS.sprites.skins[this.skin];
            CONFIG.skinId = this.skin;
            SpaceDog.LocalDataManager.save();
        }
    }
});

const UI_ELEMENTS = {
    Titles: {
        Main: new UIelement({
            name: "game_title",
            layer: 64,
            sprites: ASSETS.uiElements.title,
            start() {
                this.transform.x = SpaceDog.canvas.width / 2;
                this.transform.y = SpaceDog.canvas.height / 3.5;
                this.transform.width = SpaceDog.canvas.width / 2.5;
                this.transform.height = SpaceDog.canvas.width / 2.5 / 113 * 34;
            },
            update() {
                this.hidden = SpaceDog.currentView == 1 ? false : true;
            },
        }),
        Settings: new UIelement({
            name: "title_settings",
            sprites: ASSETS.uiElements.title_settings,
            start() {
                this.transform.height = SpaceDog.canvas.height / 10;
                this.transform.width = this.transform.height / 15 * 69;
                this.transform.x = SpaceDog.canvas.width / 2;
                this.transform.y = SpaceDog.canvas.height / 12;
            },
            update() {
                this.hidden = SpaceDog.currentView == 2 ? false : true;
            }
        }),
    },
    Displays: {
        FPSCounter: new Entity({
            name: "fps_counter",
            layer: 64,
            start() {
                this.transform.height = SpaceDog.canvas.height / 120;
                this.transform.y = this.transform.height * 6
            },
            render() {
                if (CONFIG.showFPScounter) {
                    SpaceDog.context.save();
                    SpaceDog.context.fillStyle = "white";
                    SpaceDog.context.textAlign = "center";
                    SpaceDog.context.font = `${this.transform.height * 2}px 'pixelFont'`;
                    SpaceDog.context.fillText(`${FPS.currentFPS} FPS`, SpaceDog.canvas.height / 12 / 1.2, this.transform.y);
                    SpaceDog.context.restore();
                }
            },
        }),
    },
    ConfigElements: {
        ToggleFPSCounter: new Toggle({
            name: "toggle_fps_counter",
            text: `Toggle FPS counter`,
            state: CONFIG.showFPScounter,
            start() {
                this.transform.height = SpaceDog.canvas.height / 18;
                this.transform.width = this.transform.height / 24 * 45;
                this.transform.x = SpaceDog.canvas.width / 2 + this.transform.width / 2;
                this.transform.y = SpaceDog.canvas.height / 2 - this.transform.height * 4;
            },
            onClick() {
                CONFIG.showFPScounter = !CONFIG.showFPScounter;
                this.setState(CONFIG.showFPScounter);

                SpaceDog.LocalDataManager.save();

                ASSETS.audio.select[0].currentTime = 0;
                ASSETS.audio.select[0].play();
            },
            update() {
                this.setState(CONFIG.showFPScounter);
                this.hidden = SpaceDog.currentView == 2 ? false : true;
            },
            setState(state) {
                this.state = state;
                UI_ELEMENTS.Buttons.Back.setPos();
                this.currentSprite = CONFIG.showFPScounter ? 1 : 0;
            }
        }),
        ToggleMusic: new Toggle({
            name: `toggle_mute_music`,
            text: `Mute music`,
            state: CONFIG.muteMusic,
            start() {
                this.transform.height = SpaceDog.canvas.height / 18;
                this.transform.width = this.transform.height / 24 * 45;
                this.transform.x = SpaceDog.canvas.width / 2 + this.transform.width / 2;
                this.transform.y = SpaceDog.canvas.height / 2 - this.transform.height * 2;
            },
            onClick() {
                CONFIG.muteMusic = !CONFIG.muteMusic;
                this.state = CONFIG.muteMusic;

                SpaceDog.AudioManager.muteMusic(CONFIG.muteMusic)

                SpaceDog.LocalDataManager.save();

                this.currentSprite = this.currentSprite == 0 ? 1 : 0;

                ASSETS.audio.select[0].currentTime = 0;
                ASSETS.audio.select[0].play();
            },
            update() {
                this.setState(CONFIG.muteMusic);
                this.hidden = SpaceDog.currentView == 2 ? false : true;
            },
            setState(state) {
                this.state = state;
                this.currentSprite = CONFIG.muteMusic ? 1 : 0;
            }
        }),
        ToggleSFX: new Toggle({
            name: `toggle_sfx`,
            text: `Mute SFX`,
            state: CONFIG.muteSfx,
            start() {
                this.transform.height = SpaceDog.canvas.height / 18;
                this.transform.width = this.transform.height / 24 * 45;
                this.transform.x = SpaceDog.canvas.width / 2 + this.transform.width / 2;
                this.transform.y = SpaceDog.canvas.height / 2;
            },
            onClick() {
                CONFIG.muteSfx = !CONFIG.muteSfx;
                this.state = CONFIG.muteSfx;

                SpaceDog.AudioManager.muteSFX(CONFIG.muteSfx);

                SpaceDog.LocalDataManager.save();

                this.currentSprite = this.currentSprite == 0 ? 1 : 0;

                ASSETS.audio.select[0].currentTime = 0;
                ASSETS.audio.select[0].play();
            },
            update() {
                this.setState(CONFIG.muteSfx);
                this.hidden = SpaceDog.currentView == 2 ? false : true;
            },
            setState(state) {
                this.state = state;
                this.currentSprite = CONFIG.muteSfx ? 1 : 0;
            }
        }),
        RangeResolution: new RangeBar({
            name: `range_resolution`,
            text: `Resolution`,
            steps: [{ displayText: "1920x1080", width: 1920, height: 1080 }, { displayText: "1280x720", width: 1280, height: 720 }, { displayText: "640x360", width: 640, height: 360 }],
            start() {
                this.transform.height = SpaceDog.canvas.height / 18;
                this.transform.width = this.transform.height / 24 * 304;
                this.transform.x = SpaceDog.canvas.width / 2 + this.transform.width / 2;
                this.transform.y = SpaceDog.canvas.height / 2 + this.transform.height * 3;
            },
            update() {
                this.value = CONFIG.resolution;
            },
            callback(value) {
                CONFIG.resolution = value;
                UI_ELEMENTS.Buttons.Refresh.active = true;
                SpaceDog.LocalDataManager.save();
            }
        }),
        RangeParticleLimit: new RangeBar({
            name: `range_particle_limit`,
            text: `Particle count limit`,
            value: CONFIG.particleCountLimit,
            min: 0,
            max: 30,
            start() {
                this.transform.height = SpaceDog.canvas.height / 18;
                this.transform.width = this.transform.height / 24 * 304;
                this.transform.x = SpaceDog.canvas.width / 2 + this.transform.width / 2;
                this.transform.y = SpaceDog.canvas.height / 2 + this.transform.height * 6;
            },
            update() {
                this.value = CONFIG.particleCountLimit;
            },
            callback(value) {
                CONFIG.particleCountLimit = value;
                while (SpaceDog.particles.length > CONFIG.particleCountLimit) {
                    delete SpaceDog.particles.shift();
                    SpaceDog.particles = SpaceDog.particles.filter(p => !!p);
                }
                SpaceDog.LocalDataManager.save();
            }
        })
    },
    Buttons: {
        Start: new UIelement({
            name: "button_start",
            layer: 64,
            brightness: 1,
            cursor: 1,
            sprites: ASSETS.uiElements.start,
            start() {
                let size = SpaceDog.canvas.width / 4;
                this.transform.x = SpaceDog.canvas.width / 2;
                this.transform.y = SpaceDog.canvas.height / 1.5;
                this.transform.width = size;
                this.transform.height = size / 94 * 31;
            },
            update() {
                this.hidden = SpaceDog.currentView == 1 ? false : true;
                if (!this.blinkingInterval) {
                    if (this.hovering) {
                        this.brightness = CONFIG.uiBrightnessChange;
                    } else this.brightness = 1;
                }

            },
            onClick() {
                if (!this.blinkingInterval) {
                setTimeout(() => {
                    SpaceDog.currentView = 0;

                    Dog.spawnInmunity = true;
                    Dog.opacity = 0.5;
                    setTimeout(() => {
                        Dog.spawnInmunity = false;
                        Dog.opacity = 1;
                    }, 2000);

                    Dog.brightness = 1;

                    SpaceDog.Cursor.changeCursor(0);
                    clearInterval(this.blinkingInterval);
                    this.blinkingInterval = undefined;

                    SpaceDog.gameStarted = true;
                }, 500);

                    this.blinkingInterval = setInterval(() => {
                        this.brightness = this.brightness > 1500 ? 1 : 3000;
                        Dog.brightness = Dog.brightness > 1500 ? 1 : 3000;
                    }, 40);

                    ASSETS.audio.select[1].currentTime = 0;
                    ASSETS.audio.select[1].play();
    
                    Dog.hidden = false;
                    Dog.brightness = 1000;
                }


            },
        }),
        Config: new UIelement({
            name: "button_config",
            layer: 64,
            cursor: 1,
            sprites: ASSETS.uiElements.config,
            start() {
                this.transform.width = SpaceDog.canvas.width / 15;
                this.transform.height = this.transform.width;
                this.transform.x = SpaceDog.canvas.width - this.transform.width / 1.2;
                this.transform.y = SpaceDog.canvas.height - this.transform.height / 1.2;
            },
            update() {
                this.hidden = SpaceDog.currentView == 1 ? false : true;
                if (this.hovering) {
                    this.brightness = CONFIG.uiBrightnessChange;
                } else this.brightness = 1;
            },
            onClick() {
                SpaceDog.currentView = 2;
                SpaceDog.Cursor.changeCursor(0);
                ASSETS.audio.select[0].currentTime = 0;
                ASSETS.audio.select[0].play();
            }
        }),
        Back: new UIelement({
            name: "button_back",
            layer: 64,
            cursor: 1,
            sprites: ASSETS.uiElements.back,
            start() {
                this.transform.height = SpaceDog.canvas.height / 12;
                this.transform.width = this.transform.height;
                this.transform.x = this.transform.width / 1.2;
            },
            update() {
                this.hidden = SpaceDog.currentView == 2 ? false : true;
                if (this.hovering) {
                    this.brightness = CONFIG.uiBrightnessChange;
                } else this.brightness = 1;
            },
            onClick() {
                SpaceDog.currentView = 1;
                Dog.transform.x = SpaceDog.canvas.width / 8;
                Dog.transform.width = SpaceDog.canvas.width / 12;
                Dog.transform.height = Dog.transform.width / 120 * 92;

                SpaceDog.Cursor.changeCursor(0);
                ASSETS.audio.select[0].currentTime = 0;
                ASSETS.audio.select[0].play();
            },
            setPos() {
                this.transform.y = this.transform.height + (CONFIG.showFPScounter ? UI_ELEMENTS.Displays.FPSCounter.transform.height * 3 : 0);
            }
        }),
        Refresh: new UIelement({
            name: "button_refresh",
            layer: 64,
            cursor: 1,
            sprites: ASSETS.uiElements.refresh,
            active: false,
            start() {
                let range = UI_ELEMENTS.ConfigElements.RangeResolution;
                this.transform.width = range.transform.height / 1.05;
                this.transform.height = this.transform.width;
                this.transform.x = range.transform.x + range.transform.width / 2 + this.transform.width / 1.5;
                this.transform.y = range.transform.y;
            },
            update() {
                this.hidden = SpaceDog.currentView == 2 && this.active ? false : true;
                if (this.hovering) {
                    this.brightness = CONFIG.uiBrightnessChange;
                } else this.brightness = 1;
            },
            onClick() {
                ASSETS.audio.select[0].currentTime = 0;
                ASSETS.audio.select[0].play();

                window.location.reload();
            }
        }),
        Pause: new UIelement({
            name: "button_pause",
            layer: 64,
            cursor: 1,
            sprites: ASSETS.uiElements.pause,
            start() {
                this.transform.width = SpaceDog.canvas.width / 15;
                this.transform.height = this.transform.width;
                this.transform.x = SpaceDog.canvas.width - this.transform.width / 1.2;
                this.transform.y = this.transform.height / 1.2;
            },
            update() {
                this.hidden = SpaceDog.currentView == 0 ? false : true;
                if (this.hovering) {
                    this.brightness = CONFIG.uiBrightnessChange;
                } else this.brightness = 1;
            },
            onClick() {
                ASSETS.audio.select[0].currentTime = 0;
                ASSETS.audio.select[0].play();

                SpaceDog.paused = !SpaceDog.paused;
            }
        }),
    },
};

const BIOMES = [
    new Biome({
        name: `asteroid_belt`,
        backdrop: createGradient(SpaceDog.context, SpaceDog.canvas.height, "#041542", "#020a1d"),
        monsterSpawnInterval: randomBetween(240, 1500, false),
        monsterSpawnTimelapse: 0,
        asteroidSpawnInterval: randomBetween(120, 250, false),
        asteroidSpawnTimelapse: 0,
        shooting: false,
        entitiesParams: [
            {
                name: "mostro",
                sprites: ASSETS.sprites.enemies.monsterIdle,
                currentSprite: 0,
                animationInterval: 14,
                animationTime: 0,
                layer: 4,
                start() {
                    this.transform.width = SpaceDog.canvas.height / 6;
                    this.transform.height = this.transform.width;
                    this.transform.y = randomBetween(this.transform.height / 3 + this.transform.height, SpaceDog.canvas.height - this.transform.height / 3, false);
                    this.transform.x = SpaceDog.canvas.width + this.transform.width / 2;
                },
                update() {
                    this.animationTime += SpaceDog.deltaTime;
                    if (this.animationTime >= this.animationInterval) {
                        this.animationTime = 0;
                        this.currentSprite = (this.currentSprite + 1) % this.sprites.length;
                        if (this.shooting) {

                            if (!this.proyectile && this.currentSprite == this.sprites.length - 2) {
                                let monster = this;
                                let proyectile = new Entity({
                                    name: `monster_proyectile`,
                                    layer: 3,
                                    speed: 5,
                                    animationInterval: 12,
                                    animationTime: 0,
                                    sprites: ASSETS.sprites.proyectiles.monster,
                                    start() {
                                        this.transform.x = monster.transform.x;
                                        this.transform.y = monster.transform.y;
                                        this.transform.width = monster.transform.width / 2;
                                        this.transform.height = monster.transform.height / 2;
                                        this.transform.rotation = monster.transform.rotation;

                                        ASSETS.audio.effects[3].currentTime = 0;
                                        ASSETS.audio.effects[3].play();
                                    },
                                    update() {
                                        this.animationTime += SpaceDog.deltaTime;
                                        if (this.animationTime >= this.animationInterval) {
                                            this.animationTime = 0;
                                            this.currentSprite = (this.currentSprite + 1) % this.sprites.length;
                                        }
                                        this.transform.x -= (Math.cos(degToRad(this.transform.rotation)) * this.speed + 3) * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                                        this.transform.y -= (Math.sin(degToRad(this.transform.rotation)) * this.speed) * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                                        if (this.transform.x < this.transform.width * -1) {
                                            SpaceDog.deleteEntity(this);
                                        }

                                        let distanceX = this.transform.x - Dog.transform.x;
                                        let distanceY = this.transform.y - Dog.transform.y;

                                        let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                                        if (distance < (Dog.transform.height / 2 + this.transform.height / 2)) {
                                            SpaceDog.gameOver();
                                        }
                                    },
                                });
                                monster.proyectile = proyectile;
                                proyectile.start();
                            } else if (this.currentSprite == this.sprites.length - 1) {
                                this.sprites = ASSETS.sprites.enemies.monsterIdle;
                                this.currentSprite = 0;
                                this.shooting = false;
                            }
                        }

                    }

                    this.transform.x -= 3 * SpaceDog.deltaTime * SpaceDog.resolutionFactor;;

                    if (!SpaceDog.gameStarted) return;

                    let distanceX = this.transform.x - Dog.transform.x;
                    let distanceY = this.transform.y - Dog.transform.y;

                    if (distanceX < 0) this.flipped = true;

                    if (!this.proyectile && this.transform.x < Dog.transform.x + SpaceDog.canvas.width / 2) {
                        this.sprites = ASSETS.sprites.enemies.monsterShooting;
                        if (!this.shooting) {
                            ASSETS.audio.effects[2].currentTime = 0;
                            ASSETS.audio.effects[2].play();
                        }
                        this.shooting = true;
                    }

                    this.transform.rotation = radToDeg(Math.atan(distanceY / distanceX)) * (this.flipped ? -1 : 1);
                    let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                    if (distance < (Dog.transform.height / 2 + this.transform.height / 2)) {
                        SpaceDog.gameOver();
                    }
                },
            },
            {
                name: "asteroid",
                sprites: ASSETS.sprites.asteroids.green,
                layer: 5,
                start() {
                    this.linearSpeed = randomBetween(3, 5, false);
                    this.rotationSpeed = randomBetween(-2.5, 2.5, false);
                    this.currentSprite = randomBetween(1, 3, true) == 1 ? 1 : 0;
                    this.transform.width = SpaceDog.canvas.height / 7 * (this.sprites[this.currentSprite].naturalHeight / 20) * randomBetween(0.8, 1.2, false);
                    this.transform.height = this.transform.width * this.sprites[this.currentSprite].naturalHeight / this.sprites[this.currentSprite].naturalWidth;
                    this.transform.y = randomBetween(this.transform.height / 2 + this.transform.height, SpaceDog.canvas.height - this.transform.height / 2, false);
                    this.transform.x = SpaceDog.canvas.width + this.transform.width / 2;
                },
                update() {
                    this.transform.x -= this.linearSpeed * SpaceDog.deltaTime * SpaceDog.resolutionFactor;
                    this.transform.rotation -= this.rotationSpeed * SpaceDog.deltaTime;

                    let distanceX = this.transform.x - Dog.transform.x;
                    let distanceY = this.transform.y - Dog.transform.y;

                    let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                    if (distance < this.transform.height) {
                        SpaceDog.gameOver();
                    }
                },
            },
        ],
        update() {
            if (SpaceDog.gameStarted) {
                this.monsterSpawnTimelapse += 1 * SpaceDog.deltaTime;
                if (this.monsterSpawnTimelapse >= this.monsterSpawnInterval) {
                    this.monsterSpawnTimelapse = 0;
                    let entity = new Entity(this.entitiesParams[0]);
                    entity.start();
                    this.monsterSpawnInterval = randomBetween(240, 1500, false);
                }
                this.asteroidSpawnTimelapse += 1 * SpaceDog.deltaTime;
                if (this.asteroidSpawnTimelapse >= this.asteroidSpawnInterval) {
                    this.asteroidSpawnTimelapse = 0;
                    let entity = new Entity(this.entitiesParams[1]);
                    entity.start();
                    this.asteroidSpawnInterval = randomBetween(120, 250, false);
                }
            }
        },
    }),
    new Biome({
        name: `gas_giants`,
        backdrop: createGradient(SpaceDog.context, SpaceDog.canvas.height, "#162129", "#050505"),
    }),
]


