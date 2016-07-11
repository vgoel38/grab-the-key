var score = 0,
    MIN_ENEMY_SPEED = 100,
    MAX_ENEMY_SPEED = 700,
    PLAYER_ORIGIN_X = 0,
    PLAYER_ORIGIN_Y = 2,
    TOTAL_ROWS = 6,
    TOTAL_COLS = 11;

var BACKGROUND_COLOUR = "#F67931";

var playerImageURL = 'images/char-boy.png';

var characters = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];

//runs when the DOM has been created
$(function(){
    //sets background colour of the body
    $('body').css('background-color',BACKGROUND_COLOUR);

    //inserting all the character images
    characters.forEach(function(character){
        var characterHTML = '<span><img src="' + character + '"></span>';
        $('.characters').append(characterHTML);
        $('.characters span').last().click(function(){
            playerImageURL = character;
        });
    });
});

//adjusting images on the canvas
var horizontalDistance = 101,
    verticalDistance = 80,
    playerHorizontalDisDelta = 0,
    playerVerticalDisDelta = -15,
    gemHorizontalDisDelta = 25,
    gemVerticalDisDelta = 30,
    teleportHorizontalDisDelta = 0,
    teleportVerticalDisDelta = -40,
    heartHorizontalDisDelta = 20,
    heartVerticalDisDelta = 30,
    rockHorizontalDisDelta = 0,
    rockVerticalDisDelta = -20,
    keyHorizontalDisDelta = 10,
    keyVerticalDisDelta = 10;

//returns a random number between a and b inclusive
function randomNumberBetween(a,b)
{
    return Math.floor((Math.random() * b) + a);
};

//Array of all filled positions on the canvas by various elements of the game
var filledPositions = [];

//returns a random position on canvas on which nothing has been yet positioned
function randomVacantPosition (x,y){
    var x,y;
    while(true){
        x = randomNumberBetween(1,10);
        y = randomNumberBetween(0,5);
        var i;
        for(i = 0; i < filledPositions.length; i++){
            if(x === filledPositions[i].x && y === filledPositions[i].y){
                break;
            }
        }
        if(i === filledPositions.length){
            return {x,y};
        }
    }
};

/*****ENEMY CLASS*******/

// Enemies our player must avoid
var Enemy = function() {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.y = -100 - Math.random() * 1000;//so that enemies begin from varied distances from the top of the canvas
    this.x = randomNumberBetween(1,10) * horizontalDistance + playerHorizontalDisDelta;//random column for an enemy
};

// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.y = this.y + dt * (MIN_ENEMY_SPEED + (Math.random() * (MAX_ENEMY_SPEED - MIN_ENEMY_SPEED)));
    if(this.y > canvas.width){
        this.x = randomNumberBetween(1,10) * horizontalDistance + playerHorizontalDisDelta;
        this.y = -100 - Math.random() * 1000;
    }

    //calculating the row and col of an enemy from its x and y position on the canvas
    var row = Math.floor((this.y - playerVerticalDisDelta) / verticalDistance);
    var col = Math.floor((this.x - playerHorizontalDisDelta) / horizontalDistance);
    //detecting collison of enemies and the player
    if(col === player.x && row === player.y){
        player.updateLives(-1);//updating lives left
        if(player.livesLeft() > 0){
            //secnding player back to the original position
            player.x = PLAYER_ORIGIN_X;
            player.y = PLAYER_ORIGIN_Y;
        }
        else {
            alert("Game Over!");
            resetGame();
        }

    }
};

Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



/*****PLAYER CLASS*******/

var Player = function(){
    this.x = PLAYER_ORIGIN_X;
    this.y = PLAYER_ORIGIN_Y;
    this.lives = 1;
};

Player.prototype.handleInput = function(action){
    //if an arrow key has been pressed and the player is not going out of the boundary of the
    //canvas or is not stepping into a prohibited cell (like a rock), then either teleport
    //or move the player one step
    if(action === 'right' && this.x * horizontalDistance + playerHorizontalDisDelta + 100 < canvas.width - 100 && !player.isPositionProhibited(this.x + 1,this.y,allRocks)){
        if(!this.teleported(this.x + 1,this.y, teleportPlatform1, teleportPlatform2))
            this.x = this.x + 1;
    }
    else if(action === 'left' && this.x * horizontalDistance + playerHorizontalDisDelta - 100 > -100 && !player.isPositionProhibited(this.x - 1,this.y,allRocks)){
        if(!this.teleported(this.x - 1,this.y, teleportPlatform1, teleportPlatform2))
            this.x=this.x - 1;
    }
    else if(action === 'up' && this.y * verticalDistance + playerVerticalDisDelta - 100 > -100 && !player.isPositionProhibited(this.x,this.y - 1,allRocks)){
        if(!this.teleported(this.x,this.y - 1, teleportPlatform1, teleportPlatform2))
            this.y = this.y - 1;
    }
    else if(action === 'down' && this.y * verticalDistance + playerVerticalDisDelta + 100 < canvas.height - 100 && !player.isPositionProhibited(this.x,this.y + 1,allRocks)){
        if(!this.teleported(this.x,this.y + 1, teleportPlatform1, teleportPlatform2))
            this.y = this.y + 1;
    }
};

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(playerImageURL), this.x * horizontalDistance + playerHorizontalDisDelta, this.y * verticalDistance + playerVerticalDisDelta);
};

//updates number of lives left
Player.prototype.updateLives = function(delta){
    this.lives = this.lives + delta;
    $('.lives').html("Lives : " + this.lives);
};

//returns number of player lives left
Player.prototype.livesLeft = function(){
    return this.lives;
};

//tells whether the player will be teleported or not on his next move(nextX,nextY)
Player.prototype.teleported =function(nextX,nextY,teleportPlatform1, teleportPlatform2){
    if(nextX === teleportPlatform1.x && nextY === teleportPlatform1.y){
        this.x=teleportPlatform2.x;
        this.y=teleportPlatform2.y;
        return true;
    }
    else if(nextX === teleportPlatform2.x && nextY === teleportPlatform2.y){
        this.x=teleportPlatform1.x;
        this.y=teleportPlatform1.y
        return true;
    }
    return false;
};

//tells whether there is a rock on (x,y) or not
Player.prototype.isPositionProhibited = function(nextX,nextY,allRocks){
    for(var i = 0; i < allRocks.length; i++){
        if(allRocks[i].x === nextX && allRocks[i].y === nextY){
            return true;
        }
    }
    return false;
};

//Checking collisions of the player with other element except enemies
Player.prototype.checkCollisions = function(allGems,heart,key){
    if(this.x === allGems[0].x && this.y === allGems[0].y) {updateScore(score+10);allGems[0].visible=false;}
    if(this.x === allGems[1].x && this.y === allGems[1].y) {updateScore(score+10);allGems[1].visible=false;}
    if(this.x === allGems[2].x && this.y === allGems[2].y) {updateScore(score+20);allGems[2].visible=false;}
    if(this.x === allGems[3].x && this.y === allGems[3].y) {updateScore(score+20);allGems[3].visible=false;}
    if(this.x === allGems[4].x && this.y === allGems[4].y) {updateScore(score+30);allGems[4].visible=false;}
    if(this.x === allGems[5].x && this.y === allGems[5].y) {updateScore(score+30);allGems[5].visible=false;}

    if(this.x === heart.x && this.y === heart.y) {this.updateLives(1); heart.visible=false;}

    if(this.x === key.x && this.y === key.y){
        key.visible=false;
        alert("Congrats. You completed the game. Your score is "+score+".");
        resetGame();
    }

};


/*****GEM CLASS*******/

var Gem = function(imageURL, x, y){
    this.sprite = imageURL;
    this.x=x;
    this.y=y;
    this.visible=true;

    //add the gem's position to the filledPositions array
    filledPositions.push({x,y});
};

Gem.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x*horizontalDistance+gemHorizontalDisDelta, this.y*verticalDistance+gemVerticalDisDelta);
};

/*****TELEPORT PLATFORM CLASS*******/

var TeleportPlatform = function(position){
    this.sprite = 'images/Selector.png';
    this.x=position.x;
    this.y=position.y;

    filledPositions.push(position);
};

TeleportPlatform.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x*horizontalDistance+teleportHorizontalDisDelta, this.y*verticalDistance+teleportVerticalDisDelta);
};

/*****HEART CLASS*******/

var Heart  = function(position){
    this.sprite = 'images/Heart.png';
    this.x = position.x;
    this.y = position.y;
    this.visible=true;

    filledPositions.push(position);
};

Heart.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x*horizontalDistance+heartHorizontalDisDelta, this.y*verticalDistance+heartVerticalDisDelta);
};

/*****ROCK CLASS*******/

var Rock = function(position){
    this.sprite = 'images/Rock.png';
    this.x = position.x;
    this.y = position.y;

    filledPositions.push(position);
};

Rock.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x*horizontalDistance+rockHorizontalDisDelta, this.y*verticalDistance+rockVerticalDisDelta);
};

/*****KEY CLASS*******/

var Key = function(position){
    this.sprite = 'images/Key.png';
    this.x = position.x;
    this.y = position.y;
    this.visible=true;

    filledPositions.push(position);
};

Key.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x*horizontalDistance+keyHorizontalDisDelta, this.y*verticalDistance+keyVerticalDisDelta);
};


//creating instances of all the classes
/*****PLAYER INSTANCES*******/
var player = new Player();

/*****ENEMY INSTANCES*******/
var allEnemies=[];
var numOfEnemies=10;
for(var i=0; i<numOfEnemies;i++)
    allEnemies.push(new Enemy());

/*****GEM INSTANCES*******/
var allGems=[];
allGems.push(new Gem('images/gem-blue.png',1,randomNumberBetween(0,5)));
allGems.push(new Gem('images/gem-blue.png',2,randomNumberBetween(0,5)));
allGems.push(new Gem('images/gem-green.png',3,randomNumberBetween(0,5)));
allGems.push(new Gem('images/gem-green.png',4,randomNumberBetween(0,5)));
allGems.push(new Gem('images/gem-orange.png',5,randomNumberBetween(0,5)));
allGems.push(new Gem('images/gem-orange.png',6,randomNumberBetween(0,5)));

/*****TELEPORT PLATFORM INSTANCES*******/
var teleportPlatform1 = new TeleportPlatform(randomVacantPosition());
var teleportPlatform2 = new TeleportPlatform(randomVacantPosition());

/*****HEART INSTANCES*******/
var heart = new Heart(randomVacantPosition());

/*****ROCK INSTANCES*******/
var allRocks=[];
allRocks.push(new Rock(randomVacantPosition()));
allRocks.push(new Rock(randomVacantPosition()));

/*****KEY INSTANCES*******/
var key = new Key({x:11,y:randomNumberBetween(0,5)});

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
    player.checkCollisions(allGems,heart,key);
});

//updating score
function updateScore(newScore){
    score = newScore;
    $('.score').html("Score : "+score);
};

//resetting game by refreshing the page
function resetGame(){
    location.reload();
};

//preventing scrolling of the page on keydowns
var ar=new Array(33,34,35,36,37,38,39,40);
$(document).keydown(function(e) {
     var key = e.which;
      //if(key==35 || key == 36 || key == 37 || key == 39)
      if($.inArray(key,ar) > -1) {
          e.preventDefault();
          return false;
      }
      return true;
});
