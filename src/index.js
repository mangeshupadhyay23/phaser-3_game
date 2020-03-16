import Phaser from "phaser";
import skyImg from "./assets/sky.png";
import bombImg from "./assets/bomb.png";
import groundImg from "./assets/platform.png";
import starImg from "./assets/star.png";
import dudeImg from "./assets/dude.png";


const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics:{
    default:'arcade',
    arcade:{
      gravity:{y:300},
      debug:false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update:update
  }
};

const game = new Phaser.Game(config);
var platforms;
var player;
var cursor;
var stars;
var score=0;
var scoreText;
var lives=3;
var livesBar;
var bombs;
var gameOver=false;
var gameOverText;

function preload() {
  this.load.image('sky',skyImg);
  this.load.image('ground',groundImg);
  this.load.image('star',starImg);
  this.load.image('bomb',bombImg);
  this.load.spritesheet('dude',dudeImg,
      {frameWidth:32,frameHeight:48}     //spreadsheet decide the image that will be moving 
  );
}

function create() {
  this.add.image(400,300,'sky'); //center of image will be kept at x cordinate 400 and y cordinate 300 of canvas 
  //this.add.image(400,300,'star');//images will be rendered in order they are written in create function if order is disturbed sky will be over star and star will not be visible
  platforms=this.physics.add.staticGroup();


  platforms.create(400,568,'ground').setScale(2).refreshBody();
  platforms.create(600,400,'ground');
  platforms.create(50,250,'ground');
  platforms.create(750,220,'ground');


  player=this.physics.add.sprite(100,450,'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  

  this.anims.create({
    key:'left',
    frames:this.anims.generateFrameNumbers('dude',{start:0,end:3}),
    frameRate:10,
    repeat:-1
  });
  this.anims.create({
    key:'right',
    frames:this.anims.generateFrameNumbers('dude',{start:5,end:8}),
    frameRate:10,
    repeat:-1
  });
  this.anims.create({
    key:'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate:20
  });

  this.physics.add.collider(player,platforms);
  cursor = this.input.keyboard.createCursorKeys();

  stars=this.physics.add.group({
    key:'star',
    repeat:11,
    setXY:{x:12,y:0,stepX:70}
  });

  stars.children.iterate(function (child){
    child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
  });

  this.physics.add.collider(stars,platforms);

  scoreText=this.add.text(20,20,'Score:0',{fontSize:'32px',fill:'black'});
  livesBar=this.add.text(600,20,'Lives:3',{fontSize:'32px',fill:'black'});
  
  
  

  bombs=this.physics.add.group();
  this.physics.add.collider(bombs,platforms);
  

}

function update(){
  

  if (cursor.left.isDown)
  {
      player.setVelocityX(-160);

      player.anims.play('left', true);
  }
  else if (cursor.right.isDown)
  {
      player.setVelocityX(160);

      player.anims.play('right', true);
  }
  else
  {
      player.setVelocityX(0);

      player.anims.play('turn');
  }

  if (cursor.up.isDown && player.body.touching.down)
  {
      player.setVelocityY(-330);
  }

  this.physics.add.overlap(player,stars,collectStar,null,this);

  function collectStar(player,star)
  {
    star.disableBody(true,true);
    score+=10;
    scoreText.setText('Score:'+score);

    if(stars.countActive(true)===0){
        stars.children.iterate(function(child){
            child.enableBody(true,child.x,0,true,true);
        });

        var x=(player.x<400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0,400);
        var bomb =bombs.create(x,16,'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200,200),20);

    }
  }

  this.physics.add.collider(player,bombs,hitbomb,null,this);
  function hitbomb(player,bomb){
    lives=lives-1;
    livesBar.setText('Lives:'+lives);
    bomb.disableBody(true,true);
    if(lives<1)
    {
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      gameOver= true;
     
      
    }
  }

  if(gameOver){
      gameOverText=this.add.text(235,275,'GAME OVER!!',{fontSize:'50px',fill:'black'});
      const restartButton=this.add.text(220,330,'Click to Retry',{fontSize:'40px',fill:'red'});
      restartButton.setInteractive({useHandCursor:true});
      restartButton.on('pointerdown',()=>this.scene.restart());
      gameOver=false;
      score=0;
      lives=3;
  
  }

}