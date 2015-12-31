(function(){
	var favicon = new Favico({
		animation:'popFade'
	});
	favicon.badge(0);
	var score = 0;
	var scoreText;
	var game = new Phaser.Game(800,600,Phaser.AUTO,'');
	var states = {
		boot:function(){
			this.preload = function(){
				if(!game.device.desktop){
					this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
					this.scale.forcePortrait = true;
					this.scale.refresh();
				}
			}
			this.create = function(){
				game.state.start('preload');
			}
		},
		preload:function(){
			this.preload = function(){
				game.load.image('sky','assets/sky.png');
				game.load.image('ground','assets/platform.png');
				game.load.image('star','assets/star.png');
				game.load.spritesheet('dude','assets/dude.png',32,48,9);
			}
			this.create = function(){
				game.state.start('play');
			}
		},
		play:function(){
			this.create = function(){				
				game.physics.startSystem(Phaser.Physics.ARCADE);
				this.createPlatform();
				this.createRole();
				this.createStar();
				scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
				// game.input.onDown.addOnce(this.startGame,this);
			},
			this.createPlatform = function(){
				game.add.sprite(0, 0, 'sky');
				var platforms = game.add.group();
				this.platforms = platforms;
				platforms.enableBody = true;
				var ground = platforms.create(0,game.world.height-64,'ground');
				ground.scale.setTo(2, 2);
				ground.body.immovable = true; 
				var ledge1 = platforms.create(400, 400, 'ground');
				ledge1.body.immovable = true;
				var ledge2 = platforms.create(-150, 250, 'ground');
				ledge2.body.immovable = true; 
			}
			this.createRole = function(){
				var player = game.add.sprite(32, game.world.height - 150, 'dude');
				player.frame = 5;
				this.player = player;
				game.physics.arcade.enable(player);
				player.body.bounce.y = 0.2;
				player.body.gravity.y = 300; 
				player.body.collideWorldBounds = true; 
				player.animations.add('left', [0, 1, 2, 3], 10, true);
				player.animations.add('right', [5, 6, 7, 8], 10, true);  
			}
			this.createStar = function(){
				var stars = game.add.group();
				this.stars = stars;
				for(var i = 0; i < 12; i++){
					var star = stars.create(i * 70, 0, 'star');
					game.physics.arcade.enable(star);
					star.body.gravity.y = 6;
					star.body.bounce.y = 0.7 + Math.random() * 0.2;
				} 
			}
			this.collectStar = function(player, star){
				star.kill();
				score += 10; 
				scoreText.content = 'Score: ' + score; 
			}
			this.update = function(){
				this.updatePlayer();			
			}
			this.updatePlayer = function(){
				var player = this.player;
				game.physics.arcade.collide(player,this.platforms);
				game.physics.arcade.collide(this.stars,this.platforms);
				game.physics.arcade.overlap(player,this.stars,this.collectStar, null, this); 
				player.body.velocity.x = 0;	
				var cursors = game.input.keyboard.createCursorKeys();
				if(cursors.left.isDown){
					player.body.velocity.x = -150;
					player.animations.play('left');
				}else if(cursors.right.isDown){
					player.body.velocity.x = 150;
				  	player.animations.play('right');
				}else{
					player.animations.stop();
					player.frame = 4;
				}
				if(cursors.up.isDown && player.body.touching.down){
					player.body.velocity.y = -350;
				}
			}
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('preload',states.preload);
	game.state.add('play',states.play);
	game.state.start('boot');
})();