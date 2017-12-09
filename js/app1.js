var game = new Phaser.Game(1600, 900, Phaser.AUTO, '', { preload: preload, create: create, update: update }, false, false);
var cursors;

function preload() {
    game.load.image("fog", "images/fog.png");
    game.load.image("floor", "images/background_new.png");
    game.load.image("melee", "images/meleeEnemy.png")

    //*Loads the Spritesheet for the player sprite moving*//
    game.load.spritesheet("player", "images/playerMove.png", 19, 28, 5);
    cursors = game.input.keyboard.createCursorKeys();
}
var player, floor, enemy, attack, weapon, hitboxes, healthText;
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
    player.animations.add('walk', [0, 2, 1]);
    //*creates the "Attack" animation*//
    player.animations.add('attack', [0, 3, 4]);
    //create idle anim
    player.animations.add('idle', [0]);

    //scale the player
    player.scale.setTo(7, 7);

    //Add health to the player.
    player.health = 50;

    //set player pivot
    player.pivot.set(6, 14);

    //enable physics for player
    game.physics.arcade.enable(player);

    //change player's physics settings
    player.body.gravity.y = 1000;
    player.body.collideWorldBounds = true;

    //change player's hitbox size
    player.body.setSize(11, 27, 1, 1);

    //create a hitbox for the player's weapon
    hitboxes = game.add.group();
    hitboxes.enableBody = true;
    player.addChild(hitboxes);
    weapon = hitboxes.create(0, 0, null);
    weapon.body.setSize(50, 100, 84, player.height / 2 - 10);

    //add in a melee enemy
    enemy = game.add.sprite(700, 500, "melee");

    //scale the enemy up
    enemy.scale.setTo(7, 7);

    //Add physics to the base enemy
    game.physics.arcade.enable(enemy);
    enemy.body.gravity.y = 1000;
    enemy.body.collideWorldBounds = true;

}

function update() {
    playerCollisions();
    playerMovement();
    enemyCollisions();
    displayHealth();
}

var playerTouchingGround;
function playerCollisions() {
    playerTouchingGround = game.physics.arcade.collide(player, floor);  
}

var enemyTouchingGround;
function enemyCollisions()
{
    enemyTouchingGround = game.physics.arcade.collide(enemy, floor);
}

function addGravity() {
    //player.body.gravity.y *= 1.3;
    //player.body.gravity.y += 1009;
    player.body.velocity.y += 25;
}

var playerHealth;
var style;
var healthText;
function displayHealth()
{
     playerHealth = player.health;
     style = { font: "32px Times", fill: "#000000", align: "left"};
     healthText = game.add.text(10, 0, "Player Health: " + playerHealth, style);
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

    //Handles the event where the player left clicks and the attack animation plays
    if (game.input.activePointer.isDown == true) {
        player.animations.play('attack', 10, false);
        console.log(player.animations);
    }

    if(player.animations._anims.attack.isPlaying == false && player.animations._anims.walk.isPlaying == false){
        player.animations.play('idle', 0, false);
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