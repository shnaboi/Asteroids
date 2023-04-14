const FPS = 30;

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

setInterval(update, 1000 / FPS);

function update() {
    //draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw ship

    //move ship
}