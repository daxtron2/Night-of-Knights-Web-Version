var game = new Phaser.Game(1600, 900, Phaser.AUTO, '', { preload: preload, create: create, update: update }, false, false);
var cursors;

function preload() {
    game.load.image("fog", "images/fog.png");
    game.load.image("floor", "images/background_new.png");
    //game.load.image("player", "images/player1.png");
    //*Loads the Spritesheet for the player sprite moving*//
    game.load.spritesheet("player", "images/playerMove.png", 19, 28, 3);
    cursors = game.input.keyboard.createCursorKeys();
}
var player, floor;
var faceRight = true;
function create() {
    //initialize the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //add the background
    game.add.sprite(0, 0, "fog");

    //add the floor
    floor = game.add.sprite(0, game.world.height - 134, "floor");
    game.physics.arcade.enable(floor);
    floor.body.immovable = true;
    floor.body.setSize(1600, 80, 0, 54);

    //add the player
    player = game.add.sprite(0, 0, "player");
    //*creates the "Walk" animation*//
    player.animations.add('walk', [0, 1, 2]);

    //scale the player
    player.scale.setTo(7, 7);

    //set player pivot
    player.pivot.set(6, 14);

    //enable physics for player
    game.physics.arcade.enable(player);

    //change player's physics settings
    player.body.gravity.y = 1000;
    player.body.collideWorldBounds = true;

}

function update() {
    playerCollisions();
    playerMovement();

}

var playerTouchingGround;
function playerCollisions() {
    playerTouchingGround = game.physics.arcade.collide(player, floor);

}

function addGravity() {
    //player.body.gravity.y *= 1.3;
    //player.body.gravity.y += 1009;
    player.body.velocity.y += 25;
}

function playerMovement() {
    //check for l/r movement
    if (cursors.left.isDown) {
        player.body.velocity.x += -30;
        //*Plays the walk animation, at 8 frames a second*//
        player.animations.play('walk', 8, true);
        //play left animation
        if (faceRight == true) {
            player.scale.x *= -1;
            faceRight = false;
        }
    }
    else if (cursors.right.isDown) {
        player.body.velocity.x += 30;
        //*Plays the walk animation, at 8 frames a second*//
        player.animations.play('walk', 8, true);
        //play right animation
        if (faceRight == false) {
            player.scale.x *= -1;
            faceRight = true;
        }
    }
    else {
        player.body.velocity.x *= .75;
    }

    if (cursors.left.isUp == true && cursors.right.isUp == true) {
        //*When the left cursor and the right cursor are up, stops the walk animation*//
        player.animations.stop('walk', true);
    }


    if (player.body.velocity.x < -300) {
        player.body.velocity.x = -300;
    }

    if (player.body.velocity.x > 300) {
        player.body.velocity.x = 300;
    }


    //check for jumps
    if (cursors.up.isDown && player.body.touching.down && playerTouchingGround) {
        player.body.velocity.y = -650;

    }

    if (playerTouchingGround == true) {
        player.body.gravity.y = 1000;
        //  this.game.time.events.stop();
    }
    else {
        //player.body.gravity.y *= (this.game.time.elapsed / 20)
        this.game.time.events.repeat(Phaser.Timer.SECOND / 2, 1, this.addGravity, this);
        //var jumpTimer = this.game.time.events.repeat(Phaser.Timer.SECOND / 2, 1, this.addGravity, this);
        //jumpTimer.start(0);
    }
}