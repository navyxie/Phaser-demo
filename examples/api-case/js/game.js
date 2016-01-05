;(function(){
	var game = new Phaser.Game(600,400,Phaser.AUTO,'');
	var boot = {
		preload:function(){
			game.stage.backgroundColor = 0x078CFD;
			game.load.image('snow','assets/snow.png');
		},
		create:function(){
			game.state.start('play')
		}
	}
	var play = {
		preload:function(){
			game.stage.backgroundColor = 0x078CFD;
		},
		create:function(){
			this.tweenDemo();
		},
		tweenDemo:function(){
			var snow = game.add.sprite(0, 0, 'snow');
			snow.scale.setTo(0.1,0.1);
			snow.anchor.setTo(0.5,0.5);
			var raiseG = game.add.tween(snow);
			var x = game.width/2,y = game.height/2;
			raiseG.to({x:x,y:y}, 500, Phaser.Easing.Cubic.In);
			raiseG.onComplete.add(function(){
				x = parseInt(Math.random()*(game.width));
				y = parseInt(Math.random()*(game.height));
				raiseG.to({x:x,y:y}, 500, Phaser.Easing.Cubic.Out);
				raiseG.start();
			}, this);
			raiseG.start();
		}
	}
	game.state.add('boot',boot);
	game.state.add('play',play);
	game.state.start('boot');
})();