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
				this.earth = game.add.sprite(game.width/2,0,'earth');
				this.earth.scale.setTo(0.1,0.1);
				this.earth.anchor.setTo(0.5,0);
				this.ground = game.add.sprite(0,game.height,'ground');
				this.ground.scale.setTo(1.2,1);
				this.ground.anchor.setTo(0,1);
			},
			this.update = function(){

			}
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('play',states.play);
	game.state.start('boot');
})();