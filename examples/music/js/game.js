;(function(){
	var game = new Phaser.Game(400,600,Phaser.AUTO,'game');
	var states = {};
	states.boot = {
		preload:function(){
			game.load.image('ball_kill','assets/ball_kill.png');
			game.load.image('ball_ok','assets/ball_ok.png');
		}
	}
	game.state.add('boot',states.boot);
	game.state.start('boot');
})();