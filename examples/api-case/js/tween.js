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
			var snow = game.add.sprite(40, 40, 'snow');
			snow.scale.setTo(0.1,0.1);
			snow.anchor.setTo(0.5,0.5);
			var raiseG = game.add.tween(snow);
			var x = game.width/2,y = game.height/2;
			var easing = [
				Phaser.Easing.Cubic.None,
				Phaser.Easing.Cubic.In,
				Phaser.Easing.Cubic.Out,
				Phaser.Easing.Cubic.InOut,
				Phaser.Easing.Back.None,
				Phaser.Easing.Back.In,
				Phaser.Easing.Back.Out,
				Phaser.Easing.Back.InOut,
				Phaser.Easing.Bounce.None,
				Phaser.Easing.Bounce.In,
				Phaser.Easing.Bounce.Out,
				Phaser.Easing.Bounce.InOut,
				Phaser.Easing.Circular.None,
				Phaser.Easing.Circular.In,
				Phaser.Easing.Circular.Out,
				Phaser.Easing.Circular.InOut,
				Phaser.Easing.Elastic.None,
				Phaser.Easing.Elastic.In,
				Phaser.Easing.Elastic.Out,
				Phaser.Easing.Elastic.InOut,
				Phaser.Easing.Exponential.None,
				Phaser.Easing.Exponential.In,
				Phaser.Easing.Exponential.Out,
				Phaser.Easing.Exponential.InOut,
				Phaser.Easing.Linear.None,
				Phaser.Easing.Linear.In,
				Phaser.Easing.Linear.Out,
				Phaser.Easing.Linear.InOut,
				Phaser.Easing.Quadratic.None,
				Phaser.Easing.Quadratic.In,
				Phaser.Easing.Quadratic.Out,
				Phaser.Easing.Quadratic.InOut,
				Phaser.Easing.Quartic.None,
				Phaser.Easing.Quartic.In,
				Phaser.Easing.Quartic.Out,
				Phaser.Easing.Quartic.InOut,
				Phaser.Easing.Quintic.None,
				Phaser.Easing.Quintic.In,
				Phaser.Easing.Quintic.Out,
				Phaser.Easing.Quintic.InOut,
				Phaser.Easing.Sinusoidal.None,
				Phaser.Easing.Sinusoidal.In,
				Phaser.Easing.Sinusoidal.Out,
				Phaser.Easing.Sinusoidal.InOut
			];
			raiseG.start();
			var easingLen = easing.length;
			raiseG.to({x:x,y:y}, 500,easing[Math.ceil(Math.random()*easingLen)]);
			raiseG.onComplete.add(function(){
				x = parseInt(Math.random()*(game.width) - snow.width);
				y = parseInt(Math.random()*(game.height - snow.height));
				raiseG.to({x:x,y:y}, 500, easing[Math.ceil(Math.random()*easingLen)]);
				raiseG.start();
			}, this);
			raiseG.start();
		}
	}
	game.state.add('boot',boot);
	game.state.add('play',play);
	game.state.start('boot');
})();