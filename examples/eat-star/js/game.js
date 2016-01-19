(function(){
	var favicon = new Favico({
		animation:'popFade'
	});
	favicon.badge(0);
	var score = 0;
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
				game.load.spritesheet('diamond','assets/diamond.png',32,28);
				game.load.spritesheet('baddie','assets/baddie.png',32,32,4);
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
				this.initDie();
				this.scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
				this.SPACEBAR_DOWN = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
				this.SPACEBAR_DOWN.onDown.add(this.restart, this);
			},
			this.restart = function(){
				if(this.over){
					game.state.start('play');
				}
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
				player.body.bounce.y = 0.2;//与地面接触时一个轻微的反弹
				player.body.gravity.y = 300; 
				player.body.collideWorldBounds = true; //限定小伙子在当前可视地图内运动
				player.animations.add('left', [0, 1, 2, 3], 10, true);
				player.animations.add('right', [5, 6, 7, 8], 10, true);  
			}
			this.initDie = function(){
				this.dies = game.add.group();
				game.time.events.loop(2000, this.createDie, this);
			}
			this.createDie = function(){
				var die = this.dies.create(Math.random()*(800-32),0,'baddie');
				die.animations.add('move',[1,0,2,3],8,true);
				die.animations.play('move');
				game.physics.arcade.enable(die);
				die.body.gravity.y = 10 + Math.random() * 20;
			}
			this.createStar = function(){
				var stars = game.add.group();
				this.stars = stars;
				for(var i = 0; i < 12; i++){
					this.addOneStar(i*70,0);
				} 
			}
			this.addOneStar = function(x,y){
				x = x || Math.random() * (800 - 32);
				y = y || 0;
				var star = this.stars.create(x, y, 'star');
				game.physics.arcade.enable(star);
				star.body.gravity.y = 10 + Math.random() * 10;
				star.body.bounce.y = 0.7 + Math.random() * 0.2;
			}
			this.collectStar = function(player, star){
				score += 10; 
				this.scoreText.text = 'Score: ' + score;
				star.kill();
				this.addOneStar();
				var diamond = game.add.sprite(star.body.x,star.body.y,'diamond');
				diamond.scale.setTo(0.5,0.5);
				diamond.anchor.setTo(0.5,0.5);
				game.add.tween(diamond).to({y:star.body.y - 20},500,null,true,0,0,false);
				game.add.tween(diamond.scale).to({ x:1.2,y:1.2},100,null,true,0,0,false);
				diamond.animations.add('explode');
				diamond.animations.play('explode',10,false,false);
				var diamondTimer = game.time.events.add(Phaser.Timer.SECOND*0.5,function(){
					diamond.kill();
					game.time.events.remove(diamondTimer);
				},this);							 
			}
			this.gameOver = function(){
				this.over = true;
				game.time.events.stop(false);
				game.time.events.loop('stop');
				this.player.animations.stop();
				this.player.kill();
				this.dies.forEach(function(die){
					die.kill();
				},this);
				this.stars.forEach(function(star){
					star.kill();
				},this);
				game.add.text(400,300,'Game Over',{fill:'#ff0000'}).anchor.setTo(0.5,0.5);
			}
			this.update = function(){
				this.updatePlayer();			
			}
			this.updatePlayer = function(){
				if(this.over){
					return;
				}
				var player = this.player;
				game.physics.arcade.collide(player,this.platforms);
				game.physics.arcade.collide(this.stars,this.platforms);
				game.physics.arcade.overlap(player,this.stars,this.collectStar, null, this); 
				game.physics.arcade.overlap(player,this.dies,this.gameOver,null,this);
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
				// && player.body.touching.down //接触地面
				if(cursors.up.isDown){
					player.body.velocity.y = -350;
				}else if(cursors.down.isDown){
					player.body.velocity.y = 350;
				}
			}
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('preload',states.preload);
	game.state.add('play',states.play);
	game.state.start('boot');
})();