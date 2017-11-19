var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cursors;

function preload() {
    game.load.image("fog", "images/fog.png");
    game.load.image("floor", "images/background_new.png");
    game.load.image("player", "images/player1.png");
    cursors = game.input.keyboard.createCursorKeys();
}

function create() {
    //initialize the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //add the background
    game.add.sprite(0, 0, "fog");

    //add the floor
    game.add.sprite(0, game.world.height - 32, "floor");
}

function update() {

}