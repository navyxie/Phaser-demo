;(function(){
	var game = new Phaser.Game(400,600,Phaser.AUTO,'game');
	var states = {};
	states.boot = {
		preload:function(){
			game.load.image('ball_kill','assets/ball_kill.png');
			game.load.image('ball_ok','assets/ball_ok.png');
		},
		create : function(){
			game.state.start('play');
		}
	};
	states.play = {
		preload:function(){
			game.stage.backgroundColor = 0x078CFD;
		},
		create:function(){
			this.scoreText = game.add.text(5,5,'score:0',{fill:'#fafafa'});
			this.ballGroup = game.add.group();
			this.ballGroup.enableBody = true;
			game.time.events.loop(900, this.generateBalls, this);
			game.time.events.stop(false);
			game.input.onDown.addOnce(this.statrGame, this);
		},
		getBallInfo:function(){
			var space = 10;
			var name = 'ball_kill';
			var xs = [
				0,
				152.4,
				304.8
			];
			if(Math.random()*space < 7){
				name = 'ball_ok';
			}
			return {
				x:xs[Math.floor(Math.random()*xs.length)],
				y:0,
				name:name
			};
		},
		generateBalls:function(){
			var ballInfo = this.getBallInfo();
			var ball = game.add.sprite(ballInfo.x, ballInfo.y, ballInfo.name, 0, this.ballGroup);
			ball.inputEnabled = true;
			ball.scale.setTo(0.2,0.2);
			ball.anchor.setTo(0.1,1.2);
			if(ballInfo.name === 'ball_ok'){
				ball.events.onInputDown.add(this.addScore,this);
			}else{
				ball.events.onInputDown.add(this.gameOver,this);
			}
			this.ballGroup.setAll('checkWorldBounds',true);
			this.ballGroup.setAll('body.velocity.y', this.gameSpeed);
		},
		addScore:function(ball){
			ball.kill();
			this.score += 10;
			this.gameSpeed += 1;
			this.scoreText.text = 'score:'+this.score;
		},
		statrGame:function(){
			this.gameSpeed = 100;
			this.start = true;
			this.over = false;
			this.score = 0;
			game.time.events.start();
		},
		update:function(){
			if(this.over || !this.start){
				return;
			}
			this.ballGroup.forEachExists(this.checkCollide,this);
		},
		checkCollide:function(ball){
			if(ball.key === 'ball_kill'){
				if(ball.y >= (640+103)){				
					ball.kill();
				}
			}else{
				if(ball.y >= (640)){				
					this.gameOver();
				}
			}			
		},
		gameOver:function(){
			var gameOverText = game.add.text(200,300,'Game Over,Score:'+this.score,{fill:'#ff0000'});
			gameOverText.anchor.set(0.5,0.5);
			game.time.events.loop('stop');
			this.gameSpeed = 0;
			this.over = true;
			this.start = false;
			this.ballGroup.forEachExists(this.removeEvent,this);
		},
		removeEvent:function(ball){
			ball.events.onInputDown.removeAll();
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('play',states.play);
	game.state.start('boot');
})();