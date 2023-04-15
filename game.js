const FPS = 30;
const SHIP_SIZE = 30;
const TURN_SPEED = 360;

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90/180 * Math.PI,
    rot: 0
}

setInterval(update, 1000 / FPS);

function keyDown(/** @type {keyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // Left arrow
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // Up arrow

            break;
        case 39: // right arrow
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp() {

}

function update() {
    //draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw ship
    ctx.strokeStyle = 'white',
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // nose
        ship.x + 4/3 * ship.r * Math.cos(ship.a),
        ship.y - 4/3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( // rear left
        ship.x - ship.r * (2/3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2/3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( // rear right
        ship.x - ship.r * (2/3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2/3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();


    // center dot for testing
    ctx.fillStyle = "white"
    ctx.fillRect(ship.x -1, ship.y - 1, 2, 2)

    //move ship
}