;(function(){
	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'plane', { preload: preload, create: create, update: update, render: render });

	function preload() {

	    game.load.image('bullet', 'assets/bullet.png');
	    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
	    game.load.spritesheet('invader', 'assets/invader32x32x4.png', 32, 32);
	    game.load.image('ship', 'assets/player.png');
	    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
	    game.load.image('starfield', 'assets/starfield.png');
	    game.load.image('background', 'assets/background2.png');

	}

	var player;//飞机
	var aliens;//敌人
	var bullets;//我方子弹集合
	var bulletTime = 0;
	var cursors;//当前鼠标
	var fireButton;//点击发射子弹的按钮
	var explosions;//子弹与飞机或者敌人子弹射中飞机时的动画
	var starfield;//背景图
	var score = 0;//分数
	var scoreString = '';//得分文本
	var scoreText;//得分文本（phaser对象）
	var lives;//还有多少条命
	var enemyBullet;//当前发送子弹的敌机
	var firingTimer = 0;//当前子弹开火的时间记录
	var stateText;//游戏是否结束的文本对象
	var livingEnemies = [];//当前存活的敌人

	function create() {

	    game.physics.startSystem(Phaser.Physics.ARCADE);

	    //  The scrolling starfield background,游戏背景，左右移动
	    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

	    //  Our bullet group,我方子弹集合
	    bullets = game.add.group();
	    bullets.enableBody = true;
	    bullets.physicsBodyType = Phaser.Physics.ARCADE;
	    bullets.createMultiple(30, 'bullet');
	    bullets.setAll('anchor.x', 0.5);
	    bullets.setAll('anchor.y', 1);
	    bullets.setAll('outOfBoundsKill', true);
	    bullets.setAll('checkWorldBounds', true);

	    // The enemy's bullets,敌方子弹集合
	    enemyBullets = game.add.group();
	    enemyBullets.enableBody = true;
	    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
	    enemyBullets.createMultiple(30, 'enemyBullet');
	    enemyBullets.setAll('anchor.x', 0.5);
	    enemyBullets.setAll('anchor.y', 1);
	    enemyBullets.setAll('outOfBoundsKill', true);
	    enemyBullets.setAll('checkWorldBounds', true);

	    //  The hero!,飞机
	    player = game.add.sprite(400, 500, 'ship');
	    player.anchor.setTo(0.5, 0.5);
	    game.physics.enable(player, Phaser.Physics.ARCADE);

	    //  The baddies!,敌人
	    aliens = game.add.group();
	    aliens.enableBody = true;
	    aliens.physicsBodyType = Phaser.Physics.ARCADE;

	    createAliens();//创建一批坏人

	    //  The score
	    scoreString = 'Score : ';
	    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

	    //  Lives 还有多少条命
	    lives = game.add.group();
	    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

	    //  Text 记录游戏状态
	    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
	    stateText.anchor.setTo(0.5, 0.5);
	    stateText.visible = false;
	    //创建表示飞机生命剩余条数
	    for (var i = 0; i < 3; i++) 
	    {
	        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
	        ship.anchor.setTo(0.5, 0.5);
	        ship.angle = 90;
	        ship.alpha = 0.4;
	    }

	    //  An explosion pool 子弹打中的动画效果
	    explosions = game.add.group();
	    explosions.createMultiple(30, 'kaboom');
	    explosions.forEach(setupInvader, this);//循环让每个爆炸对象拥有爆炸动画

	    //  And some controls to play the game with
	    cursors = game.input.keyboard.createCursorKeys();
	    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	    
	}
	//创建敌机
	function createAliens () {

	    for (var y = 0; y < 4; y++)
	    {
	        for (var x = 0; x < 10; x++)
	        {
	            var alien = aliens.create(x * 48, y * 50, 'invader');
	            alien.anchor.setTo(0.5, 0.5);
	            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
	            alien.play('fly');
	            alien.body.moves = false;//why?
	        }
	    }
	    //敌机群初始位置
	    aliens.x = 100;
	    aliens.y = 50;
	    //敌机线性循环动画
	    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
	    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
	    //每次循环动画，敌机群都下降垂直下降10
	    //  When the tween loops it calls descend
	    tween.onLoop.add(descend, this);
	}
	//子弹打中爆炸动画
	function setupInvader (invader) {

	    invader.anchor.x = 0.5;
	    invader.anchor.y = 0.5;
	    invader.animations.add('kaboom');

	}
	//敌机群每次循环垂直下降10
	function descend() {

	    aliens.y += 10;

	}

	function update() {
		//背景图每帧垂直运动2
	    //  Scroll the background
	    starfield.tilePosition.y += 2;

	    if (player.alive)
	    {
	        //  Reset the player, then check for movement keys 重置飞机状态，以便接下来的飞机运行状态判断
	        player.body.velocity.setTo(0, 0);

	        if (cursors.left.isDown)
	        {
	            player.body.velocity.x = -200;
	        }
	        else if (cursors.right.isDown)
	        {
	            player.body.velocity.x = 200;
	        }

	        //  Firing?
	        if (fireButton.isDown)
	        {
	            fireBullet();//飞机开火
	        }
	        //每200ms敌机开火一次
	        if (game.time.now > firingTimer)
	        {
	            enemyFires();//敌机开火
	        }

	        //  Run collision
	        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
	        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
	    }

	}

	function render() {

	    // for (var i = 0; i < aliens.length; i++)
	    // {
	    //     game.debug.body(aliens.children[i]);
	    // }

	}

	function collisionHandler (bullet, alien) {

	    //  When a bullet hits an alien we kill them both
	    bullet.kill();
	    alien.kill();

	    //  Increase the score
	    score += 20;
	    scoreText.text = scoreString + score;

	    //  And create an explosion :)
	    var explosion = explosions.getFirstExists(false);//获取第一个活着的敌机
	    explosion.reset(alien.body.x, alien.body.y);//设置爆炸位置为被打中的敌机位置
	    explosion.play('kaboom', 30, false, true);//播放爆炸动画
	    //如果敌机不存在了，表示游戏还没结束
	    if (aliens.countLiving() == 0)
	    {
	        score += 1000;
	        scoreText.text = scoreString + score;

	        enemyBullets.callAll('kill',this);
	        stateText.text = " You Won, \n Click to restart";
	        stateText.visible = true;

	        //the "click to restart" handler
	        game.input.onTap.addOnce(restart,this);
	    }

	}

	function enemyHitsPlayer (player,bullet) {
	    
	    bullet.kill();
	    //获取标志飞机生命条数的第一个活着的标志
	    live = lives.getFirstAlive();

	    if (live)
	    {
	        live.kill();
	    }

	    //  And create an explosion :)
	    var explosion = explosions.getFirstExists(false);
	    explosion.reset(player.body.x, player.body.y);
	    explosion.play('kaboom', 30, false, true);
	    //如果飞机的生命条数为0，代表游戏结束了
	    // When the player dies
	    if (lives.countLiving() < 1)
	    {
	        player.kill();
	        enemyBullets.callAll('kill');

	        stateText.text=" GAME OVER \n Click to restart";
	        stateText.visible = true;

	        //the "click to restart" handler
	        game.input.onTap.addOnce(restart,this);
	    }

	}

	function enemyFires () {

	    //  Grab the first bullet we can from the pool
	    enemyBullet = enemyBullets.getFirstExists(false);

	    livingEnemies.length=0;//重置当前活着的敌机集合

	    aliens.forEachAlive(function(alien){
	    	//将当前活着的敌机存进livingEnemies数组
	        // put every living enemy in an array
	        livingEnemies.push(alien);
	    });


	    if (enemyBullet && livingEnemies.length > 0)
	    {
	        //随机取出一个敌机
	        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

	        // randomly select one of them
	        var shooter=livingEnemies[random];
	        // And fire the bullet from this enemy
	        enemyBullet.reset(shooter.body.x, shooter.body.y);//敌机的子弹位置设置为当前发射子弹的敌机位置

	        game.physics.arcade.moveToObject(enemyBullet,player,120);//敌机子弹射击到当前飞机的位置
	        firingTimer = game.time.now + 2000;//记得更新开火时间，避免短时间内多次开火
	    }

	}

	function fireBullet () {

	    //  To avoid them being allowed to fire too fast we set a time limit
	    if (game.time.now > bulletTime)
	    {
	        //  Grab the first bullet we can from the pool
	        bullet = bullets.getFirstExists(false);

	        if (bullet)
	        {
	            //  And fire it
	            bullet.reset(player.x, player.y + 8);//设置子弹位置为当前飞机的位置
	            bullet.body.velocity.y = -400;//子弹垂直向上发送
	            bulletTime = game.time.now + 200;//记得更新开火时间，避免短时间内多次开火
	        }
	    }

	}

	function resetBullet (bullet) {

	    //  Called if the bullet goes out of the screen
	    bullet.kill();

	}

	function restart () {

	    //  A new level starts
	    
	    //resets the life count
	    lives.callAll('revive');//恢复记录飞机生命条数的标志
	    //  And brings the aliens back from the dead :)
	    aliens.removeAll();//删除所有敌机
	    createAliens();//重新生成敌机

	    //revives the player
	    player.revive();//复活飞机
	    //hides the text
	    stateText.visible = false;//隐藏显示结果的文本，只有游戏结束时才显示

	}
})();