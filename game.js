const FPS = 30;
const SHIP_SIZE = 30;

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90/180 * Math.PI
}

setInterval(update, 1000 / FPS);

function update() {
    //draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw ship
    ctx.strokeStyle = 'white',
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // nose
        ship.x + ship.r * Math.cos(ship.a),
        ship.y - ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( // rear left
        ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( // rear right
        ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    //move ship
}