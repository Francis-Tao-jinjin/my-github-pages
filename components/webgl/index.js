import createCanvas from './create-canvas';
import loadImages from './image-loader';
import { Raindrops } from './Raindrop';
import gsap from 'gsap';
import { RainRenderer } from './rain-renderer';
import { random } from './random';

let textureRainFg;
let textureRainBg;
let dropColor;
let dropAlpha;

let textureFg;
let textureFgCtx;
let textureBg;
let textureBgCtx;

let textureBgSize = {
    // width: 384,
    // height: 256,
    width: 853,
    height: 1280,
};

let textureFgSize = {
    // width:96,
    // height:64,
    width: 341,
    height: 512,
};

let raindrops;
let renderer;
let canvas;

let parallax = {x:0 , y:0};

let weatherData = null;
let curWeatherData = null;
let blend = { v: 0};

export function loadTextures() {
    loadImages([
        { name: 'dropAlpha', src: '/images/webgl/drop-alpha.png' },
        { name: 'dropColor', src: '/images/webgl/drop-color.png' },

        { name: 'textureRainFg', src: '/images/webgl/flower-mini.jpeg' },
        { name: 'textureRainBg', src: '/images/webgl/flower.jpeg' },

        // { name: 'textureRainFg', src: '/images/webgl/texture-sun-fg.png' },
        // { name: 'textureRainBg', src: '/images/webgl/texture-sun-bg.png' },

        // { name: 'textureRainFg', src: '/images/webgl/rome-1.jpeg' },
        // { name: 'textureRainBg', src: '/images/webgl/rome-1.jpeg' },
    ]).then((images) => {
        textureRainFg = images.textureRainFg.img;
        textureRainBg = images.textureRainBg.img;

        dropAlpha = images.dropAlpha.img;
        dropColor = images.dropColor.img;

        init();
    });
};

function init() {
    canvas = document.getElementById('glcanvas');
    // let dpi = window.devicePixelRatio;
    let dpi = 1;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    raindrops = new Raindrops(
        canvas.width,
        canvas.height,
        dpi,
        dropAlpha,
        dropColor,
        {
            trailRate: 1,
            trailScaleRange: [0.2, 0.45],
            collisionRadius: 0.45,
            dropletsCleaningRadiusMultiplier: 0.28,
        }
    );

    textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
    textureFgCtx = textureFg.getContext('2d');
    textureBg = createCanvas(textureBgSize.width, textureBgSize.height);
    textureBgCtx = textureBg.getContext('2d');

    generateTextures(textureRainFg, textureRainBg);

    renderer = new RainRenderer(canvas, raindrops.canvas, textureFg, textureBg, null, {
        brightness: 1.04,
        alphaMultiply: 6,
        alphaSubtract: 3,
    });

    setupEvents();
}

function setupEvents(){
    setUpResize();
    setupParallax();
    setupWeather();
    // setupFlash();
}

function setUpResize() {
    window.addEventListener('resize', (event) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderer.resize();
        raindrops.onResize();
    });
}

function setupParallax() {
    document.addEventListener('mousemove', (event) => {
        let x = event.pageX;
        let y = event.pageY;

        gsap.to(parallax, {
            duration: 1,
            x: ((x / canvas.width) * 2) - 1,
            y: ((y / canvas.height) * 2) - 1,
            ease: 'power4.out',
            onUpdate:()=>{
                renderer.parallaxX = parallax.x;
                renderer.parallaxY = parallax.y;
            },
        });
    });
}

// function setupFlash() {
//     setInterval(() => {
//         if (chance(curWeatherData.flashChance)) {
//             flash(curWeatherData.bg, curWeatherData.fg, curWeatherData.flashBg, curWeatherData.flashFg);
//         }
//     }, 500);
// }

function setupWeather() {
    setupWeatherData();
    updateWeather();
}

function setupWeatherData() {
    let defaultWeather = {
        raining: true,
        minR: 20,
        maxR: 50,
        rainChance: 0.35,
        rainLimit: 6,
        dropletsRate:50,
        dropletsSize:[3,5.5],
        trailRate:1,
        trailScaleRange:[0.25,0.35],
        fg: textureRainFg,
        bg: textureRainBg,
        flashFg: null,
        flashBg: null,
        flashChance: 0,
        collisionRadiusIncrease: 0.0002,
    };

    function weather(data) {
        return {
            ...defaultWeather,
            ...data,
        }
    }

    weatherData = {
        rain: weather({
            rainChance:0.35,
            dropletsRate:50,
            raining:true,
            // trailRate:2.5,
            fg:textureRainFg,
            bg:textureRainBg
        }),
    };
}

function updateWeather() {
    curWeatherData = weatherData.rain;
    raindrops.options = {
        ...raindrops.options,
        ...curWeatherData,
    };
    raindrops.clearDrops();

    gsap.fromTo(blend, {
        v: 0,
    }, {
        duration: 1,
        v:1,
        onUpdate: () => {
            generateTextures(curWeatherData.fg, curWeatherData.bg, blend.v);
            renderer.updateTextures();
        }
    });
}

function flash(baseBg, baseFg, flashBg, flashFg) {
    let flashValue = { v:0 };
    function transitionFlash(to, t = 0.025) {
        return new Promise((resolve, reject) => {
            gsap.to(flashValue, {
                duration: t,
                v:to,
                ease: 'power4.out',
                onUpdate: () => {
                    generateTextures(baseFg, baseBg);
                    generateTextures(flashFg, flashBg, flashValue.v);
                    renderer.updateTextures();
                },
                onComplete: () => {
                    resolve();
                },
            })
        });
    }

    let lastFlash = transitionFlash(1);
    const t = random(2, 7);
    for (let i = 0; i < t; i++) {
        lastFlash = lastFlash.then(() => {
            return transitionFlash(random(0.1, 1));
        });
    }
    lastFlash = lastFlash.then(() => {
        return transitionFlash(1, 0.1);
    }).then(() => {
        transitionFlash(0, 0.25);
    });
}

function generateTextures(fg, bg, alpha = 1){
    textureFgCtx.globalAlpha = alpha;
    textureFgCtx.drawImage(fg, 0, 0, textureFgSize.width, textureFgSize.height);
  
    textureBgCtx.globalAlpha = alpha;
    textureBgCtx.drawImage(bg, 0, 0, textureBgSize.width, textureBgSize.height);
  }
  
