var game = new Phaser.Game(1600, 900, Phaser.AUTO, '', { preload: preload, create: create, update: update }, false, false);
var cursors;

function preload() {
    //load all the things
    game.load.image("fog", "images/fog.png");
    game.load.image("floor", "images/background_new.png");
    game.load.image("melee", "images/meleeEnemy.png")
    game.load.audio("playerHurt", "audio/playerHurt.wav");
    game.load.audio("enemyHurt", "audio/enemyHurt.wav");
    game.load.audio("whiff", "audio/whiff.wav");
    game.load.audio("jump", "audio/jump.wav");

    //*Loads the Spritesheet for the player sprite moving*//
    game.load.spritesheet("player", "images/playerMove.png", 19, 28, 5);
    cursors = game.input.keyboard.createCursorKeys();
}
var player, floor, enemy, attack, enemyAttackTimer, weapon, hitboxes, healthText, enemyWeapon, playerHurt, enemyHurt, whiff, jump, fog, instruct;
var faceRight = true;
function create() {
    //initialize the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //stop game from pausing on focus loss, for debug purposes
    game.stage.disableVisibilityChange = true;

    //add the background
    fog = game.add.sprite(0, 0, "fog");

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

    //add the player hurt audio
    playerHurt = game.add.audio("playerHurt");

    //add the enemy hurt audio
    enemyHurt = game.add.audio("enemyHurt");

    //add the player attack, no hit sound
    whiff = game.add.audio("whiff");

    //add the player jump sound
    jump = game.add.audio("jump");

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
    weapon.body.setSize(100, 100);

    //add in a melee enemy
    enemy = game.add.sprite(700, 500, "melee");

    //scale the enemy up
    enemy.scale.setTo(7, 7);
    enemy.pivot.set(8, 9);

    //add health to enemy
    enemy.health = 10;

    //Add physics to the base enemy
    game.physics.arcade.enable(enemy);
    enemy.body.gravity.y = 1000;
    enemy.body.collideWorldBounds = true;

    //change enemy's hitbox
    enemy.body.setSize(7, 10, 3, 11);


    //create the text in top left
    healthText = game.add.text(10, 0, "Player Health: " + player.health + "\nEnemy Health: " + enemy.health + "\nKills: 0");
    healthText.addColor("#ffffff", 0);

    //create more text for controls
    instruct = game.add.text(game.width - 400, 0, "Arrow Keys to move\nLeft click to attack\nD to draw hitboxes\nGain some health every 5 kills\nPress G to enable God mode");
    instruct.addColor("#ffffff", 0);



    //start a timer to make enemy attack every second
    enemyAttackTimer = game.time.create(false);

    enemyAttackTimer.loop(1000, enemyAttack, this);
    enemyAttackTimer.start();

    //reset character tints every 700ms
    var tintTimer = game.time.create(false);
    tintTimer.loop(700, resetTint, this);
    tintTimer.start();



}
var killsDisplay = 0, gameOver = false;
function update() {
    if (!gameOver) {
        floorCollisions();//collide our player and enemy with floor so they dont fall
        playerMovement();//handle player input for movement
        enemyMovement();
        updateHitboxes();//move the hitboxes with the player
        playerAttack();//handle player input for attacking, handle collision between enemy and sword
        drawDebug();
        enableGod();

        if (godEnabled) {//if god mode
            player.health = 50;//keep health at 50
            player.tint = 0xff00ff;//change tint to know we're in GM
        }
        else {
            player.tint = 0xffffff;//else reset tint
        }

        if (player.health <= 0) {//if dead
            playerDeath();//run death code
        }


        //update the text with new values
        healthText.setText("Player Health: " + player.health + "\nEnemy Health: " + enemy.health + "\nKills: " + killsDisplay + "\nEnemy Level: " + (Math.round(enemyMoveWeight * 10) / 10));

    }
}
var dPressed = false, drawNow;
function drawDebug() {
    //flip flop method 
    if (game.input.keyboard.isDown(Phaser.Keyboard.D) && dPressed == false) {
        dPressed = true;
        drawNow = !drawNow;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D) == false) {
        dPressed = false;
    }

    //if we want to draw debug boxes
    if (drawNow) {
        game.debug.body(player);//do that
        game.debug.body(weapon);
        game.debug.body(enemy);
        //game.debug.body(enemyWeapon);
    }
    else {//if we dont
        game.debug.reset();//remove debug boxes
    }
    //console.log(drawNow);
}

//check for floor collisions appropriately
var playerTouchingGround, enemyTouchingGround;
function floorCollisions() {
    //dont fall through
    playerTouchingGround = game.physics.arcade.collide(player, floor);
    enemyTouchingGround = game.physics.arcade.collide(enemy, floor);

    //if we're not touching the ground, stop the walk animations
    if (!playerTouchingGround) {
        player.animations.stop('walk');
    }
}

//moves the hitboxes with the player, because they sometimes just broke
function updateHitboxes() {
    //reposition every frame
    if (faceRight) {
        weapon.body.x = player.body.x + player.body.width - 50;
    }
    else {
        weapon.body.x = player.body.x - 50;
    }
    weapon.body.y = player.body.y + player.height / 2 - 20;
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
    else if (playerTouchingGround) {
        player.body.velocity.x *= .8;//only apply friction on the ground
    }

    if (cursors.left.isUp == true && cursors.right.isUp == true) {
        //*When the left cursor and the right cursor are up, stops the walk animation*//
        player.animations.stop('walk', true);
    }

    //cap out velocity at +/- 300
    if (player.body.velocity.x < -300) {
        player.body.velocity.x = -300;
    }

    if (player.body.velocity.x > 300) {
        player.body.velocity.x = 300;
    }


    //check for jumps
    if (cursors.up.isDown && player.body.touching.down && playerTouchingGround) {
        player.body.velocity.y = -650;
        jump.play();//play jump sound

    }

    if (playerTouchingGround == true) {
        player.body.gravity.y = 1000;

    }
    else {
        //player.body.gravity.y *= (this.game.time.elapsed / 20)
        this.game.time.events.repeat(Phaser.Timer.SECOND / 2, 1, this.addGravity, this);
        //var jumpTimer = this.game.time.events.repeat(Phaser.Timer.SECOND / 2, 1, this.addGravity, this);
        //jumpTimer.start(0);
    }
}

var attackThisFrame = false, kills = 0;
function playerAttack() {
    //if we're already attacking or walking
    if (player.animations._anims.attack.isPlaying || player.animations._anims.walk.isPlaying) {
        return;//leave the method
    }

    //Handles the event where the player left clicks and the attack animation plays
    if (game.input.activePointer.isDown == true) {
        player.animations.play('attack', 10, false);
        attackThisFrame = true;
    }
    else {
        attackThisFrame = false;
    }

    //if attack is not playing and walk is not playing, do idle "animation" which is just a single frame
    if (player.animations._anims.attack.isPlaying == false && player.animations._anims.walk.isPlaying == false) {
        player.animations.play('idle', 0, false);
    }

    //if we want to try to attack this frame
    if (attackThisFrame) {
        //check for collision between weapon and enemy
        var didDamage = game.physics.arcade.overlap(weapon, enemy);
        //if we hit the enemy
        if (didDamage) {
            enemy.health -= 5;//remove some health
            enemy.tint = 0xff0000;//make it red for a little bit
            enemyHurt.play();//play his hurt noise

            //if the enemy is dead
            if (enemy.health <= 0) {
                //50/50 shot of where the "new" one spawns, left or right side
                if (Math.random() > .5) {
                    enemy.position.x = -50;
                }
                else {
                    enemy.position.x = game.width + 50;
                }
                enemy.health = 10;//reset its health
                enemyMoveWeight += .1;//increase its move speed 
                kills++;//increment kill counters
                killsDisplay++;
            }
        }
        else {//if we missed the enemy
            whiff.play();//play the whiff sound
        }
    }
    if (kills % 5 == 0 && kills != 0) {//if kills is a factor of 5 and not 0
        player.health += 10;//add some health to the player
        kills = 0;//reset the interal counter, not the display
    }

}
var enemyMoveWeight = 1.0;
function enemyMovement() {
    if (player.visible && game.physics.arcade.overlap(enemy, player) == false) {
        if (player.position.x > enemy.position.x) {
            enemy.scale.x = -7;
            enemy.body.velocity.x = 150 * enemyMoveWeight;
        }
        else {
            enemy.scale.x = 7;
            enemy.body.velocity.x = -150 * enemyMoveWeight;
        }
    }
    else
    {
        enemy.body.velocity.x = 0;
    }
}

function enemyAttack() {
    enemy.tint = 0x00ff00;//every time enemy tries to attack show a visual change, could be anim in this case it's a tint change
    if (game.physics.arcade.overlap(enemy, player)) {//if enemy hits player
        player.health -= 5;//player loses some health
        player.tint = 0xff0000;//player sprite indicates a hit
        playerHurt.play();//player hurt sound plays
    }

}

//runs every so often to reset the sprite tints to normal
function resetTint() {
    player.tint = 0xffffff;
    enemy.tint = 0xffffff;
}


var gPressed = false, godEnabled = false;
function enableGod() {
    //a flip flop method to enable disable god mode
    if (game.input.keyboard.isDown(Phaser.Keyboard.G) && gPressed == false) {
        gPressed = true;
        godEnabled = !godEnabled
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.G) == false) {
        gPressed = false;
    }
}

function playerDeath() {
    //draw the game over screen
    var gameOverText = game.add.text((game.width / 2) - 130, game.height / 2 - 50, "GAME OVER")
    gameOverText.fontSize = 50;
    gameOverText.addColor("#ffffff", 0);

    var playAgainText = game.add.text((game.width / 2) - 200, game.height / 2 + 25, "Refresh page to play again!");
    playAgainText.fontSize = 35;
    playAgainText.addColor("#ffffff", 0);

    //stop enemy from attacking after game over
    enemyAttackTimer.stop();

    //make everything else invisible
    player.visible = false;
    fog.visible = false;
    floor.visible = false;
    enemy.visible = false;
    healthText.visible = false;
    instruct.visible = false;
    drawNow = false;
    game.debug.reset();//remove hitboxes
    

    //mute all sounds
    game.sound.mute = true;

    //should stop any code from running past this point
    gameOver = true;
}