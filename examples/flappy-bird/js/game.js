(function(){
	var favicon = new Favico({
		animation:'popFade'
	});
	favicon.badge(0);
	var GAME = new Phaser.Game(320,505,Phaser.AUTO,'game');
	GAME.States = {};
	GAME.States.boot = function(){
		this.preload = function(){
			GAME.stage.backgroundColor = 0xffffff;
			if(!GAME.device.desktop){
				this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
				this.scale.forcePortrait = true;
				this.scale.refresh();
			}
			GAME.load.image('loading','assets/preloader.gif');
		}
		this.create = function(){
			GAME.state.start('preload');
		}
	}
	GAME.States.preload = function(){
		this.preload = function(){
			GAME.stage.backgroundColor = 0x078CFD;
			var loadText = GAME.add.text(this.game.width/2,GAME.height/2+22,'0%',{font: "bold 16px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"});
			loadText.anchor.setTo(0.5,0);
			var preloadSprite = GAME.add.sprite(this.game.width/2,GAME.height/2,'loading');
			preloadSprite.anchor.setTo(0.5,0);
			GAME.load.setPreloadSprite(preloadSprite);
			GAME.load.onLoadStart.add(function(){},this);
			GAME.load.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles){
				loadText.text = progress + '%('+totalLoaded+'/'+totalFiles+')';
			},this);
			GAME.load.onLoadComplete.add(function(){
				loadText.destroy();
			},this);
			//load assets
			GAME.load.image('background','assets/background.png');
			GAME.load.image('ground','assets/ground.png');	
			GAME.load.image('title','assets/title.png');	
			GAME.load.spritesheet('bird','assets/bird.png',34,24,3);
			GAME.load.image('btn','assets/start-button.png');
			GAME.load.spritesheet('pipe','assets/pipes.png',54,320,2);
			GAME.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');
			GAME.load.audio('fly_sound', 'assets/flap.wav');
			GAME.load.audio('score_sound', 'assets/score.wav');
			GAME.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav');
			GAME.load.audio('hit_ground_sound', 'assets/ouch.wav');
			GAME.load.image('ready_text','assets/get-ready.png');
			GAME.load.image('play_tip','assets/instructions.png');
			GAME.load.image('game_over','assets/gameover.png');
			GAME.load.image('score_board','assets/scoreboard.png');
		}
		this.create = function(){
			GAME.state.start('menu');
		}
	}
	GAME.States.menu = function(){
		this.create = function(){
			GAME.add.tileSprite(0,0,GAME.width,GAME.height,'background').autoScroll(-10,0);
			GAME.add.tileSprite(0,GAME.height-112,GAME.width,112,'ground').autoScroll(-100,0);
			var titleGroup = GAME.add.group();
			titleGroup.create(0,0,'title');
			var bird = titleGroup.create(190, 10, 'bird');
			bird.animations.add('fly');
			bird.animations.play('fly',12,true);
			titleGroup.x = 35;
			titleGroup.y = 100;
			GAME.add.tween(titleGroup).to({ y:120 },1000,null,true,0,Number.MAX_VALUE,true);
			var button = GAME.add.button((GAME.width-104)/2,(GAME.height-58)/2,'btn',function(){
				GAME.state.start('play');
			});
			// button.anchor.setTo(0.5,0.5);
		}
	}
	GAME.States.play = function(){
		this.create = function(){
			this.bg = GAME.add.tileSprite(0,0,GAME.width,GAME.height,'background');
			this.pipeGroup = GAME.add.group();
			this.pipeGroup.enableBody = true;
			this.ground = GAME.add.tileSprite(0,GAME.height-112,GAME.width,112,'ground');
			this.bird = GAME.add.sprite(50,150,'bird');
			this.bird.animations.add('fly');
			this.bird.animations.play('fly',12,true);
			this.bird.anchor.setTo(0.5, 0.5);
			GAME.physics.enable(this.bird,Phaser.Physics.ARCADE);
			this.bird.body.gravity.y = 0;
			GAME.physics.enable(this.ground,Phaser.Physics.ARCADE);
			this.ground.body.immovable = true;
			this.soundFly = GAME.add.sound('fly_sound');
			this.soundScore = GAME.add.sound('score_sound');
			this.soundHitPipe = GAME.add.sound('hit_pipe_sound');
			this.soundHitGround = GAME.add.sound('hit_ground_sound');
			this.scoreText = GAME.add.bitmapText(GAME.world.centerX-20, 30, 'flappy_font', '0', 36);
			this.readyText = GAME.add.image(GAME.width/2, 40, 'ready_text');
			this.playTip = GAME.add.image(GAME.width/2,300,'play_tip');
			this.readyText.anchor.setTo(0.5, 0);
			this.playTip.anchor.setTo(0.5, 0);
			this.hasStarted = false;
			GAME.time.events.loop(900, this.generatePipes, this);
			GAME.time.events.stop(false);
			GAME.input.onDown.addOnce(this.statrGame, this);
		}
		this.generatePipes = function(gap){ //制造管道
			gap = gap || 100; //上下管道之间的间隙宽度
			var position = (505 - 320 - gap) + Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());
			var topPipeY = position-360;
			var bottomPipeY = position+gap;

			if(this.resetPipe(topPipeY,bottomPipeY)) return;

			var topPipe = GAME.add.sprite(GAME.width, topPipeY, 'pipe', 0, this.pipeGroup);
			var bottomPipe = GAME.add.sprite(GAME.width, bottomPipeY, 'pipe', 1, this.pipeGroup);
			this.pipeGroup.setAll('checkWorldBounds',true);
			this.pipeGroup.setAll('outOfBoundsKill',true);
			this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed);
		}
		this.resetPipe = function(topPipeY,bottomPipeY){//重置出了边界的管道，做到回收利用
			var i = 0;
			this.pipeGroup.forEachDead(function(pipe){
				if(pipe.y<=0){ //topPipe
					pipe.reset(GAME.width, topPipeY);
					pipe.hasScored = false; //重置为未得分
				}else{
					pipe.reset(GAME.width, bottomPipeY);
				}
				pipe.body.velocity.x = -this.gameSpeed;
				i++;
			}, this);
			return i == 2; //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
		}
		this.statrGame = function(){
			this.gameSpeed = 200; //游戏速度
			this.gameIsOver = false;
			this.hasHitGround = false;
			this.hasStarted = true;
			this.score = 0;
			this.bg.autoScroll(-(this.gameSpeed/10),0);
			this.ground.autoScroll(-this.gameSpeed,0);
			this.bird.body.gravity.y = 1150; //鸟的重力
			this.readyText.destroy();
			this.playTip.destroy();
			GAME.input.onDown.add(this.fly, this);
			this.SPACEBAR_DOWN = GAME.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			this.SPACEBAR_DOWN.onDown.add(this.fly, this);
			GAME.time.events.start();
		}
		this.fly = function(){
			this.bird.body.velocity.y = -350;
			GAME.add.tween(this.bird).to({angle:-30}, 100, null, true, 0, 0, false); //上升时头朝上
			this.soundFly.play();
		}
		this.update = function(){
			if(!this.hasStarted) return; //游戏未开始
			GAME.physics.arcade.collide(this.bird,this.ground, this.hitGround, null, this); //与地面碰撞
			GAME.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this); //与管道碰撞
			if(this.bird.angle < 90) this.bird.angle += 2.5; //下降时头朝下
			this.pipeGroup.forEachExists(this.checkScore,this); //分数检测和更新
		}
		this.checkScore = function(pipe){//负责分数的检测和更新
			if(!pipe.hasScored && pipe.y<=0 && pipe.x<=this.bird.x-17-54){
				pipe.hasScored = true;
				this.scoreText.text = ++this.score;
				this.soundScore.play();
				favicon.badge(this.score);
				return true;
			}
			return false;
		}
		this.hitPipe = function(){
			if(this.gameIsOver) return;
			this.soundHitPipe.play();
			this.gameOver();
		}
		this.hitGround = function(){
			if(this.hasHitGround) return; //已经撞击过地面
			this.hasHitGround = true;
			this.soundHitGround.play();
			this.gameOver(true);
		}
		this.gameOver = function(show_text){
			this.gameIsOver = true;
			this.stopGame();
			if(show_text) this.showGameOverText();
		};
		this.stopGame = function(){
			this.bg.stopScroll();
			this.ground.stopScroll();
			this.pipeGroup.forEachExists(function(pipe){
				pipe.body.velocity.x = 0;
			}, this);
			this.bird.animations.stop('fly', 0);
			GAME.input.onDown.remove(this.fly,this);
			this.SPACEBAR_DOWN.onDown.remove(this.fly, this);
			GAME.time.events.stop(true);
		}
		this.showGameOverText = function(){
			this.scoreText.destroy();
			GAME.bestScore = GAME.bestScore || 0;
			if(this.score > GAME.bestScore) GAME.bestScore = this.score; //最好分数
			this.gameOverGroup = GAME.add.group(); //添加一个组
			var gameOverText = this.gameOverGroup.create(GAME.width/2,0,'game_over'); //game over 文字图片
			var scoreboard = this.gameOverGroup.create(GAME.width/2,70,'score_board'); //分数板
			var currentScoreText = GAME.add.bitmapText(GAME.width/2 + 60, 105, 'flappy_font', this.score+'', 20, this.gameOverGroup); //当前分数
			var bestScoreText = GAME.add.bitmapText(GAME.width/2 + 60, 153, 'flappy_font', GAME.bestScore+'', 20, this.gameOverGroup); //最好分数
			var replayBtn = GAME.add.button(GAME.width/2, 210, 'btn', function(){//重玩按钮
				GAME.state.start('play');
			}, this, null, null, null, null, this.gameOverGroup);
			gameOverText.anchor.setTo(0.5, 0);
			scoreboard.anchor.setTo(0.5, 0);
			replayBtn.anchor.setTo(0.5, 0);
			this.gameOverGroup.y = 30;
		}
	}
	GAME.state.add('boot',GAME.States.boot);
	GAME.state.add('preload',GAME.States.preload);
	GAME.state.add('menu',GAME.States.menu);
	GAME.state.add('play',GAME.States.play);
	GAME.state.start('boot');
})();
