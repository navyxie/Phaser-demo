;(function(){
	var game = new Phaser.Game(402,500,Phaser.AUTO,'');
	var states = {
		boot:function(){
			this.preload = function(){
				game.load.image('earth','assets/star.png');
				game.load.image('ground','assets/ground.png');
				game.load.image('baffle','assets/platform.png');
			};
			this.create = function(){
				game.state.start('play');
			}
		},
		play:function(){
			this.preload = function(){
				game.stage.backgroundColor = 0x078CFD;
			};
			this.create = function(){
				this.init();
				this.createScore();
				this.createEarth();
				this.createBaffle();
				this.createGround();	
			};
			this.init = function(){
				this.over = false;
				this.score = 0;
			}
			this.createScore = function(){			
				this.scoreText = game.add.text(5,5,'score:'+this.score,{fontSize:'22px',fill:'#000'});
			};
			this.createEarth = function(){
				this.earth = game.add.sprite(game.width/2,0,'earth');
				game.physics.enable(this.earth,Phaser.Physics.ARCADE);
				this.earth.body.collideWorldBounds = true;
				this.earth.body.gravity.y = 100;
				this.earth.anchor.setTo(0.5,0);
			};
			this.createGround = function(){
				this.ground = game.add.sprite(0,game.height,'ground');
				game.physics.enable(this.ground,Phaser.Physics.ARCADE);
				this.ground.scale.setTo(1.2,1);
				this.ground.anchor.setTo(0,1);			
				this.ground.body.immovable = true;
			};
			this.createBaffle = function(){
				this.baffle = game.add.sprite(game.width/2,game.height - 112,'baffle');
				game.physics.enable(this.baffle,Phaser.Physics.ARCADE);
				this.baffle.body.collideWorldBounds = true;
				this.baffle.body.immovable = true;
				this.baffle.anchor.setTo(0.5,1);
				this.baffle.scale.setTo(0.1,0.1);
			};
			this.update = function(){
				game.physics.arcade.collide(this.earth,this.baffle);
				game.physics.arcade.collide(this.earth,this.ground);
				game.physics.arcade.overlap(this.earth,this.ground,this.gameOver, null, this);
				game.physics.arcade.overlap(this.earth,this.baffle,this.updateScore, null, this);
				var cursors = game.input.keyboard.createCursorKeys();
				if(cursors.left.isDown){
					this.baffle.body.velocity.x = -150;
				}else if(cursors.right.isDown){
					this.baffle.body.velocity.x = 150;
				}else{
					this.baffle.body.velocity.x = 0;
				}
			};
			this.gameOver = function(){
				console.log('gameOver');
				if(this.over){
					return;
				}				
				this.over = true;
			};
			this.updateScore = function(){
				console.log('updateScore');
				if(!this.over){
					this.score++;
					this.scoreText.text = 'score: ' + this.score;
				}
			}
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('play',states.play);
	game.state.start('boot');
})();