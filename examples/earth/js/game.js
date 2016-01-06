;(function(){
	var game = new Phaser.Game(402,500,Phaser.AUTO,'');
	var states = {
		boot:function(){
			this.preload = function(){
				game.load.image('earth','assets/earth.png');
				game.load.image('ground','assets/ground.png');
				game.load.image('baffle','assets/preloader.gif');
			},
			this.create = function(){
				game.state.start('play');
			}
		},
		play:function(){
			this.preload = function(){
				game.stage.backgroundColor = 0x078CFD;
			},
			this.create = function(){
				// game.physics.startSystem(Phaser.Physics.ARCADE);
				this.earth = game.add.sprite(game.width/2,0,'earth');
				game.physics.enable(this.earth,Phaser.Physics.ARCADE);
				this.earth.body.collideWorldBounds = true;
				this.earth.scale.setTo(0.08,0.08);
				this.earth.body.gravity.y = 100;
				this.earth.anchor.setTo(0.5,0);
				this.ground = game.add.sprite(0,game.height,'ground');
				game.physics.enable(this.ground,Phaser.Physics.ARCADE);
				this.ground.scale.setTo(1.2,1);
				this.ground.anchor.setTo(0,1);			
				this.ground.body.immovable = true;
				this.baffle = game.add.sprite(game.width/2,game.height - 109,'baffle');
				game.physics.enable(this.baffle,Phaser.Physics.ARCADE);
				this.baffle.body.immovable = true;
				this.baffle.anchor.setTo(0.5,1);
				this.baffle.scale.setTo(0.3,1);
			},
			this.update = function(){
				game.physics.arcade.collide(this.earth,this.baffle);
				game.physics.arcade.collide(this.earth,this.ground);
			}
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('play',states.play);
	game.state.start('boot');
})();