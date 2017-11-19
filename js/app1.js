var game = new Phaser.Game(1600, 900, Phaser.AUTO, '', { preload: preload, create: create, update: update },false,false);
var cursors;

function preload() {
    game.load.image("fog", "images/fog.png");
    game.load.image("floor", "images/background_new.png");
    game.load.image("player", "images/player1.png");
    cursors = game.input.keyboard.createCursorKeys();
}
var player, floor;
function create() {
    //initialize the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //add the background
    game.add.sprite(0, 0, "fog");

    //add the floor
    floor = game.add.sprite(0, game.world.height - 134, "floor");
    game.physics.arcade.enable(floor);
    floor.body.immovable = true;
    floor.body.setSize(1600,80,0,54);

    //add the player
    player = game.add.sprite(0,0,"player");

    //scale the player
    player.scale.setTo(5,5);

    //enable physics for player
    game.physics.arcade.enable(player);

    //change player's physics settings
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

}

function update() {
    game.physics.arcade.collide(player,floor);
}