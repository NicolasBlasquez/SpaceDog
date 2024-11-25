"use strict"

function createGradient(context, height, color1, color2) {
    const gradient = context.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

function randomBetween(min, max, round = true) {
    let random = Math.random() * (max - min) + min;
    return round ? Math.round(random) : random;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

function checkHitbox(x, y, objectX, objectY, objectWidth, objectHeight) {
    if (
        x >= objectX - objectWidth / 2 && x <= objectX + objectWidth / 2
        &&
        y >= objectY - objectHeight / 2 && y <= objectY + objectHeight / 2
    ) return true; else return false;
}