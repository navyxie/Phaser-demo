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
				this.createGround();	
				this.createBaffle();
				this.bindEvent();
			};
			this.bindEvent = function(){
				this.SPACEBAR_DOWN = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
				this.SPACEBAR_DOWN.onDown.add(this.startGame, this);
			}
			this.removeEvent = function(){
				this.SPACEBAR_DOWN.onDown.remove(this.startGame, this);
			}
			this.startGame = function(){
				if(this.over){
					this.removeEvent();
					game.state.start('play');
				}
			}
			this.init = function(){
				game.physics.startSystem(Phaser.Physics.ARCADE);
				this.over = false;
				this.score = 0;
				this.velocity = {
					x:100,
					y:100
				}
			}
			this.createScore = function(){			
				this.scoreText = game.add.text(5,5,'score:'+this.score,{fontSize:'22px',fill:'#000'});
			};
			this.createEarth = function(){
				this.earth = game.add.sprite(game.width/2,0,'earth');
				game.physics.enable(this.earth,Phaser.Physics.ARCADE);
				this.earth.enableBody = true;
				this.earth.body.collideWorldBounds = true;
				this.earth.anchor.setTo(0.5,0);
				this.updateEarth(this.velocity.x,this.velocity.y);
			};
			this.createGround = function(){
				this.ground = game.add.sprite(0,game.height,'ground');
				this.ground.enableBody = true;
				game.physics.enable(this.ground,Phaser.Physics.ARCADE);
				this.ground.scale.setTo(1.2,1);
				this.ground.anchor.setTo(0,0.5);			
				this.ground.body.immovable = true;
			};
			this.createBaffle = function(){
				this.baffle = game.add.sprite(game.width/2,game.height - this.ground.body.height/2,'baffle');
				game.physics.enable(this.baffle,Phaser.Physics.ARCADE);
				this.baffle.enableBody = true;
				this.baffle.body.collideWorldBounds = true;
				this.baffle.body.immovable = true;
				this.baffle.anchor.setTo(0.5,1);
				this.baffle.scale.setTo(0.1,0.1);
			};
			this.update = function(){
				if(this.over){
					this.updateEarth(0,0);
					this.baffle.body.velocity.x = 0;
					return;
				}
				game.physics.arcade.collide(this.earth,this.baffle,this.updateScore, null, this);
				game.physics.arcade.collide(this.earth,this.ground,this.gameOver, null, this);
				var cursors = game.input.keyboard.createCursorKeys();
				if(cursors.left.isDown){
					this.baffle.body.velocity.x = -150;
				}else if(cursors.right.isDown){
					this.baffle.body.velocity.x = 150;
				}else{
					this.baffle.body.velocity.x = 0;
				}
				this.checkBounds();
			};
			this.checkBounds = function(){
				if(this.over){
					return;
				}
				var position = this.earth.position;
				var change = false;
				if(position.x <= 12){
					this.velocity.x = Math.abs(this.velocity.x) + Math.ceil(Math.random()*2);
					if(Math.ceil(Math.random()*2)%2 === 0 && this.velocity.y < 0){
						this.velocity.y = -this.velocity.y;
					}
					change = true;
				}
				if(position.x >= (game.width -12)){
					this.velocity.x = -(Math.abs(this.velocity.x)+Math.ceil(Math.random()*2));
					if(Math.ceil(Math.random()*2)%2 === 0 && this.velocity.y < 0){
						this.velocity.y = -this.velocity.y;
					}	
					change = true;
				}
				if(position.y <= 0){
					this.velocity.y = Math.abs(this.velocity.y)+Math.ceil(Math.random()*2);
					if(Math.ceil(Math.random()*2)%2 === 0){
						this.velocity.x = -this.velocity.x;
					}
					change = true;
				}
				if(position.y >= (game.height -22)){
					this.velocity.y = -(Math.abs(this.velocity.y)+Math.ceil(Math.random()*2));
					if(Math.ceil(Math.random()*2)%2 === 0){
						this.velocity.x = -this.velocity.x;
					}
					change = true;
				}
				if(change){
					this.updateEarth(this.velocity.x,this.velocity.y);
				}
			}
			this.gameOver = function(){
				if(this.over){
					return;
				}				
				this.over = true;
				this.showOverText();
			};
			this.showOverText = function(){			
				this.gameOverText = game.add.text(game.width/2,game.height/2,'Game Over!',{fontSize:'22px',fill:'#ff0000'}).anchor.setTo(0.5,0.5);
			};
			this.updateScore = function(){
				if(!this.over){
					this.score++;
					this.scoreText.text = 'score: ' + this.score;
					if(Math.ceil(Math.random()*2)%2 === 0){
						this.velocity.x = -this.velocity.x;
						this.velocity.x -= (5 + Math.ceil(Math.random()*2));
					}else{
						this.velocity.x += (5 + Math.ceil(Math.random()*2));
					}				
					this.velocity.y = -this.velocity.y;
					this.velocity.y -= (5 + Math.ceil(Math.random()*2));
					this.updateEarth(this.velocity.x,this.velocity.y);
				}
			};
			this.updateEarth = function(x,y){
				x = x || 0;
				y = y || 0;
				this.velocity.x = this.earth.body.velocity.x = x;
				this.velocity.y = this.earth.body.velocity.y = y;	
			}
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('play',states.play);
	game.state.start('boot');
})();