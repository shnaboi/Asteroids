const FPS = 30;
const SHIP_SIZE = 23;
const SHIP_THRUST = 7 //acceleration of ship px/sec
const TURN_SPEED = 270; //degrees per second
const FRICTION = .2; //friction coefficient

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90/180 * Math.PI,
    rot: 0,
    thrust: false,
    velocity: {
        x: 0,
        y: 0
    }
}

setInterval(update, 1000 / FPS);

function keyDown(/** @type {keyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // Left arrow (rotate left)
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // Up arrow (thrust)
            ship.thrust = true;
            break;
        case 39: // right arrow (rotate right)
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {keyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // Left arrow on keyUp
            ship.rot = 0;
            break;
        case 38: // Up arrow on keyUp
            ship.thrust = false;
            break;
        case 39: // right arrow on keyUp
        ship.rot = 0;
            break;
    }
}

function update() {
    //draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //thrust ship
    if (ship.thrust) {
        ship.velocity.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.velocity.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

         // draw thruster
        ctx.strokeStyle = 'white',
        ctx.lineWidth = SHIP_SIZE / 25;
        ctx.beginPath();
        ctx.moveTo( // rear left
            ship.x - ship.r * (2/3 * Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y + ship.r * (2/3 * Math.sin(ship.a) - Math.cos(ship.a))
        );
        ctx.lineTo( // left peak
            ship.x - ship.r * (4.5/3 * Math.cos(ship.a) + Math.sin(ship.a) / 2),
            ship.y + ship.r * (4.5/3 * Math.sin(ship.a) - Math.cos(ship.a) / 2)
        );
        ctx.lineTo( // rear center
            ship.x - 2/3 * ship.r * Math.cos(ship.a),
            ship.y + 2/3 * ship.r * Math.sin(ship.a)
        );
        ctx.lineTo( // right peak
            ship.x - ship.r * (4.5/3 * Math.cos(ship.a) - Math.sin(ship.a) / 2),
            ship.y + ship.r * (4.5/3 * Math.sin(ship.a) + Math.cos(ship.a) / 2)
        );
        ctx.lineTo( // rear right
            ship.x - ship.r * (2/3 * Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y + ship.r * (2/3 * Math.sin(ship.a) + Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.stroke();
    } else {
        ship.velocity.x -= FRICTION * ship.velocity.x / FPS;
        ship.velocity.y -= FRICTION * ship.velocity.y / FPS;
    }

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

    // rotate ship
    ship.a += ship.rot;

    // move ship
    ship.x += ship.velocity.x;
    ship.y += ship.velocity.y;

    // handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 -ship.r;
    }
    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 -ship.r;
    }

    // center dot for testing
    ctx.fillStyle = "white"
    ctx.fillRect(ship.x -1, ship.y - 1, 2, 2)

}