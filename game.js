const FPS = 30;
const SHIP_SIZE = 23;
const SHIP_THRUST = 7 //acceleration of ship px/sec
const SHIP_EXPLOSION = 2; // ship explosion time in sec
const SHIP_BLINK_DUR = .15; // blink duration in frames
const SHIP_INV_DUR = 3; // ship invincible duration in sec
const TURN_SPEED = 270; //degrees per second
const GUN_MAX = 7;
const GUN_SPD = 500;
const GUN_DIST = .69 //max distance bullet can travel as fraction of screen size
const FRICTION = .2; //friction coefficient
const ROIDS_JAG = .25; // % of jaggedness of asteroid
const ROIDS_NUM = 3; //initial number of asteroids
const ROIDS_SIZE = 100; //init asteroid size in pixels
const ROIDS_SPD = 50; // init starting speed in pixels/sec
const ROIDS_VERT = 9; // avg amount of vertices of each asteroid
const SHOW_BOUNDING = false; // show bounding circles
const SHOW_CENTER_DOT = false; //show ship center dot

let death = false;

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

let ship = newShip();

// setup asteroids
let roidsArray = [];
createAsteroids();

// setup game loop
setInterval(update, 1000 / FPS);

function createAsteroids() {
    roidsArray = [];
    let x, y;
    for (let i = 0; i < ROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distanceBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
        roidsArray.push(newAsteroid(x, y));
    }
}

function distanceBetweenPoints(xShip, yShip, xRoid, yRoid) {
    return Math.sqrt(Math.pow(xRoid - xShip, 2) + Math.pow(yRoid - yShip, 2));
}

function triggerRespawn() {
    console.log('trigger respawn')
    death = false;
    respawn();
}

function respawn() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.velocity.x = 0;
    ship.velocity.y = 0;
}

function explodeShip() {
    ship.explodeTime = Math.floor(SHIP_EXPLOSION * FPS)
}

function keyDown(/** @type {keyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 32: // Space bar (shoot gun)
            shootGun();
            break;
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
        case 32: // Space bar (allow shooting)
            ship.canShoot = true;
            break;
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

function newAsteroid(x, y) {
    let newRoid = {
        x: x,
        y: y,
        // xv and yv is the velocity * direction
        xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < .5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < .5 ? 1 : -1),
        // r = radius, a = angle in 360 radiuns
        r: ROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * ROIDS_VERT + ROIDS_VERT / 1.25),
        offset: []
    };
    // create the vertex offset array for each asteroid
    for (let i = 0; i < newRoid.vert; i++) {
        newRoid.offset.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return newRoid;
}

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90/180 * Math.PI,
        rot: 0,
        thrust: false,
        velocity: {
            x: 0,
            y: 0
        },
        explodeTime: 0,
        blinkTime: Math.floor(SHIP_INV_DUR / SHIP_BLINK_DUR),
        respawnTime: Math.floor(SHIP_BLINK_DUR * FPS),
        canShoot: true,
        lasers: []
    }
}

function shootGun() {
    // create laser object
    if (ship.canShoot && ship.lasers.length < GUN_MAX) {
        ship.lasers.push({ // from nose of the ship
            x: ship.x + 4/3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4/3 * ship.r * Math.sin(ship.a),
            xv: GUN_SPD * Math.cos(ship.a) / FPS,
            yv: -GUN_SPD * Math.sin(ship.a) / FPS,
            dist: 0
        })
    }

    // prevent further shooting
    ship.canShoot = false;
}

function update() {
    let exploding = ship.explodeTime > 0;
    let blinkOn = ship.blinkTime % 2 == 0;

    //draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //thrust ship
    if (ship.thrust) {
        if (!exploding && blinkOn) {
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
        }
    } else {
        ship.velocity.x -= FRICTION * ship.velocity.x / FPS;
        ship.velocity.y -= FRICTION * ship.velocity.y / FPS;
    }

    //draw ship & death animation
    // death animation
    if (!exploding) {
        if (blinkOn) {
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
        }

        // handle respawn blink
        if (ship.blinkTime > 0) {
            ship.respawnTime--;
            if (ship.respawnTime == 0) {
                ship.respawnTime = Math.floor(SHIP_BLINK_DUR * FPS);
                ship.blinkTime--;
            }
        }
    } else {
        ctx.strokeStyle = 'white',
        ctx.lineWidth = SHIP_SIZE / 20;
        ctx.beginPath();
        ctx.moveTo( // nose
            ship.x + 4/3 * ship.r * Math.cos(ship.a),
            ship.y - 4/3 * ship.r * Math.sin(ship.a)
        );
        ctx.lineTo( // rear left
            ship.x + ship.r * (2/3 * Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y - ship.r * (2/3 * Math.sin(ship.a) - Math.cos(ship.a))
        );
        ctx.lineTo( // rear right
            ship.x + ship.r * (2/3 * Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y - ship.r * (2/3 * Math.sin(ship.a) + Math.cos(ship.a))
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo( // nose
            ship.x + 4/3 * ship.r * Math.cos(ship.a),
            ship.y - 4/3 * ship.r * Math.sin(ship.a)
        );
        ctx.lineTo( // rear left
            ship.x - ship.r * (2/3 * Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y - ship.r * (2/3 * Math.sin(ship.a) - Math.cos(ship.a))
        );
        ctx.lineTo( // rear right
            ship.x - ship.r * (2/3 * Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y - ship.r * (2/3 * Math.sin(ship.a) + Math.cos(ship.a))
        );
        ctx.stroke();
    }

    // draw lasers

    for (let i = 0; i < ship.lasers.length; i++) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.fillRect(ship.lasers[i].x, ship.lasers[i].y, 2, 2); 
        ctx.stroke();  
    }

    // bounding toggle
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = 'cyan';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r + 1, 0, Math.PI * 2, true);
        ctx.stroke();
    }

    //draw asteroids
    let x, y, r, a, vert, offset;
    for (let i = 0; i < roidsArray.length; i++) {
        ctx.strokeStyle = 'slategrey';
        ctx.lineWidth = SHIP_SIZE / 20;
        //get roid properties
        x = roidsArray[i].x;
        y = roidsArray[i].y;
        r = roidsArray[i].r;
        a = roidsArray[i].a;
        vert = roidsArray[i].vert;
        offset = roidsArray[i].offset;

        // draw path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offset[0] * Math.cos(a),
            y + r * offset[0] * Math.sin(a)
        )

        // draw the asteroid polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offset[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offset[j] * Math.sin(a + j * Math.PI * 2 / vert)
            )
        }
        ctx.closePath();
        ctx.stroke();

        // BOUNDING ASTEROIDS
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.arc(x, y, r-2, 0, Math.PI * 2, true);
            ctx.stroke();
        }
    }

    // GAME MOTION

    // check for collision
    if (!exploding) {
        if (ship.blinkTime == 0) {
            for (let i = 0; i < roidsArray.length; i++) {
                if (distanceBetweenPoints(ship.x, ship.y, roidsArray[i].x, roidsArray[i].y) < ship.r + roidsArray[i].r) {
                    // death = true;
                    explodeShip();
                }
            }
        }

        // rotate ship
        ship.a += ship.rot;

        // move ship
        ship.x += ship.velocity.x;
        ship.y += ship.velocity.y;
    } else {
        ship.explodeTime--;

        if (ship.explodeTime == 0) {
            ship = newShip();
        }
    }

    // handle ship edge of screen
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

    // move lasers
    for (let i = ship.lasers.length -1; i >= 0; i--) {
        //check dist travelled
        if (ship.lasers[i].dist > GUN_DIST * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        //update laser position
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

        //calc dist travelled (x^2 + y^2 = total)
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + 
            Math.pow(ship.lasers[i].yv, 2));

        //handle edge of screen
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        } else if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.width;
        } else if (ship.lasers[i].y > canvas.width) {
            ship.lasers[i].y = 0;
        }
    }

    // move the asteroid
    for (let i = 0; i < roidsArray.length; i++) {
        roidsArray[i].x += roidsArray[i].xv;
        roidsArray[i].y += roidsArray[i].yv;

        // handle edge of screen
        if (roidsArray[i].x < 0 - roidsArray[i].r) {
            roidsArray[i].x = canvas.width + roidsArray[i].r;
        } else if (roidsArray[i].x > canvas.width + roidsArray[i].r) {
            roidsArray[i].x = 0 -roidsArray[i].r;
        }
        if (roidsArray[i].y < 0 - roidsArray[i].r) {
            roidsArray[i].y = canvas.height + roidsArray[i].r;
        } else if (roidsArray[i].y > canvas.height + roidsArray[i].r) {
            roidsArray[i].y = 0 -roidsArray[i].r;
        }
    }

    // center dot for testing
    // ctx.fillStyle = "white"
    // ctx.fillRect(ship.x -1, ship.y - 1, 2, 2)

}

// fix respawn issue with do once while loop perhaps