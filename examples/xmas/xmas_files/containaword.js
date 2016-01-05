	
    var affFile;
	var dicFile;
	var dictionary;

    var gameOver = false;
    var gameStarted = false;
    var allContainers = []; 		// An Array of all containers in existance
    var allContainersGroup;         // A group to hold all containers
    var containerCount = 0;				//Keep count of num containers, increase speed every 10?
    var contHeight = 5; 
    var contWidth = 6;
    var letters = [];
    var currentWordText; 			// The current word - displayed on screen
    var currentWordString = ""; 	// String holding current word as I can seem to find a get method for the text
    var currentWord = []; 			// Array of containers that have been clicked to make the current word
    var scoreText;
    var score;
    var submitTimer = 0;
    var lowerC;						//A tween for the container currently being lowered.
    var lowerG                      // A tween for lowering the grab
    var lowerCcont;					//The Container being lowered
    var grab;                       // The cargo grab
    var fg; 						//foreground, need to reference to bring to top
    var title;						//containAword text
    var logo;                       // Marlins logo
    var seasons;                    // seasons greatings from all at marlins graphic
    var playBtn;
    var helpBtn;
    var scoresBtn;
    var btnsEnabled = false;
    var gameOverGroup;
    var helpGroup;
    var gameOverText;
    var userName = "";
	var userEmail = "";
	var userCompany = "";
    var loadingImage;
    var userName;
    var userCompany
    var userRank;                       // Users current rank in high score table.

    var preloadBar;
    var emitter;
    
    var speed = 0.25; // contsant speed for lower containers
    var raiseSpeed = 600; //Normally 600

    var letterCount = [{l:"A", c:9},{l:"B", c:2},{l:"C", c:2},{l:"D", c:4},{l:"E", c:12},{l:"F", c:2},{l:"G", c:3},{l:"H", c:2},{l:"I", c:9},{l:"J", c:1},{l:"K", c:1},{l:"L", c:4},{l:"M", c:3},{l:"N", c:6},{l:"O", c:8},{l:"P", c:2},{l:"Q", c:1},{l:"R", c:6},{l:"S", c:5},{l:"T", c:6},{l:"U", c:4},{l:"V", c:2},{l:"W", c:2},{l:"X", c:1},{l:"Y", c:2},{l:"Z", c:1}];

    function preload() {
        //Load in preloader
        
        //Load the rest of the game.
        game.load.spritesheet('containers', 'assets/containers.png',60,60);
        game.load.spritesheet('buttons', 'assets/buttons.png',285,100);
        game.load.bitmapFont('wlfont', 'assets/wl_font_0.png', 'assets/wl_font.xml');
        game.load.image('grab', 'assets/grab.png');
        game.load.image('bg', 'assets/bg.png');
        game.load.image('fore', 'assets/fore.png');
        game.load.image('title', 'assets/title.png');
        game.load.image('help', 'assets/help.png');
        game.load.spritesheet('submit', 'assets/submit_spritesheet.png',130,46);

        game.load.image('gameOverCont', 'assets/gameOverCont.png');
    	game.load.spritesheet('subcontbuttons', 'assets/subcontbuttons.png',100,20);

        game.load.image('hsbg', 'assets/highscoresbg.png');
        game.load.image('logo', 'assets/marlins_logo.png');
        game.load.image('seasons', 'assets/seasons.png');
        game.load.spritesheet('close', 'assets/close.png',53,53);

        game.load.image('snowa', 'assets/snow1.png');
        game.load.image('snowb', 'assets/snow2.png');
        game.load.image('snowc', 'assets/snow3.png');

        game.stage.disableVisibilityChange = true;
        game.input.maxPointers = 1;
        
        this.game.canvas.id = 'gamecanvas';
        //Load in the dictionary
        jQuery.get('dic/en_GB.aff',function(data){
            affFile = data;
            jQuery.get('dic/en_GB.dic',function(data){
                dicFile = data;
                dictionary = new Typo("en_GB", affFile, dicFile);
            }); 
        });
    }


    function create() {

        document.getElementById("loading").style.display="none";
        
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL; //resize your window to see the stage resize too
            game.stage.scale.setShowAll();
            game.stage.scale.refresh();
        
            window.scrollTo(0,0);
        }

        

        
    	game.add.sprite(0, 0, 'bg');
    	fg = game.add.sprite(58, 387, 'fore');

        var text = "";
        var style = { font: "bold 20pt Arial", fill: "#ffffff", align: "center"};
    	
        currentWordText = game.add.bitmapText(240, 550, text, { font: '40px Flipbash', align: 'center' });
        currentWordText.anchor.setTo(0.5, 0.5);
        //Load the grab
        grab = game.add.sprite(100,-322, 'grab');
        grab.anchor.setTo(0.5,0.5);
        
        //Set up score
        scoreText = game.add.bitmapText(400, 20, 'Score: 0', { font: '25px Flipbash', align: 'left' });
        scoreText.anchor.setTo(0.5, 0.5);
        score = 0;
        scoreText.alpha = 0;

        //Create Buttons
        playBtn = game.add.button(game.world.centerX, -100, 'buttons', playOnClick, this, 1, 0, 1);
		helpBtn = game.add.button(game.world.centerX, -100, 'buttons', helpOnClick, this, 3, 2, 2);
		scoresBtn = game.add.button(game.world.centerX, -100, 'buttons', scoresOnClick, this, 5, 4, 4);

        submitBtn = game.add.button(game.world.centerX, -460, 'submit', submitWord, this, 1, 0, 2);
        submitBtn.anchor.setTo(0.5, 0.5);
        submitBtn.alpha = 0;

		playBtn.anchor.setTo(0.5,0.5);
		helpBtn.anchor.setTo(0.5,0.5);
		scoresBtn.anchor.setTo(0.5,0.5);
		//store all containers in a group
		allContainersGroup = game.add.group();
		
        //Create Game Over Container
		gameOverGroup = game.add.group();
		gameOverGroup.create(0, 0, 'gameOverCont');

		//The title text containAword
		title = game.add.sprite(game.world.centerX+50, 50, 'title');
    	title.anchor.setTo(0.5,0.5);

        logo = game.add.sprite(70, 60, 'logo');
        logo.anchor.setTo(0.5,0.5);

        seasons = game.add.sprite(game.world.centerX, 690, 'seasons');
        seasons.anchor.setTo(0.5,0.5);
	    
	    var b1 = game.add.button(40, 90, 'subcontbuttons', continueOnClick, this, 1, 0, 1);
	    var b2 = game.add.button(229, 90, 'subcontbuttons', submitOnClick, this, 3, 2, 3);

	    var text = "GAME OVER\nSCORE: "
	    gameOverText = game.add.bitmapText(182, 40, text, { font: '30px Flipbash', align: 'center' });
	    gameOverText.anchor.setTo(0.5,0.5);

	    gameOverGroup.add(b1);
	    gameOverGroup.add(b2);
	    gameOverGroup.add(gameOverText);
	    
	    gameOverGroup.x = 55;
	    gameOverGroup.y = -130;
        
        fg.bringToTop();
        seasons.bringToTop();

        emitter = game.add.emitter(game.world.centerX, -100, 200);
        emitter.makeParticles(['snowa', 'snowb', 'snowc']);
        emitter.gravity = 0.5;
        emitter.particleDrag.x = 0;
        emitter.start(false, 10000, 20);
        bringInButtons();

    }

    function update () {
        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && game.time.now > submitTimer && !gameOver) {
            submitTimer = game.time.now + 1000;
            submitWord();
        } 
    }


	function bringInButtons() {
        logo.scale.setTo(0,0);
		title.scale.setTo(0,0);
		title.angle = - 40;
        seasons.bringToTop();
		game.add.tween(logo.scale).to( {x: 1, y: 1}, 2000, Phaser.Easing.Elastic.Out, true, 0, false);
		
        game.add.tween(title.scale).to( {x: 1, y: 1}, 2000, Phaser.Easing.Elastic.Out, true, 1000, false);
        game.add.tween(title).to( {angle:0}, 1500, Phaser.Easing.Elastic.Out, true, 1000, false);

        game.add.tween(seasons).to( {y:450}, 1500, Phaser.Easing.Back.Out, true, 2000, false);

		game.add.tween(scoresBtn).to({ y: 380 }, 1000, Phaser.Easing.Cubic.Out, true);
		game.add.tween(scoresBtn).to({ y: 380 }, 1000, Phaser.Easing.Cubic.Out, true);
		game.add.tween(helpBtn).to({ y: 280 }, 1000, Phaser.Easing.Cubic.Out, true, 500);
		var t=game.add.tween(playBtn);
		t.to({ y: 180 }, 1000, Phaser.Easing.Cubic.Out, true, 1000);
		t.onComplete.add(enableButtons, null);
		t.start();
	}

	function bringOutButtons() {

        game.add.tween(logo.scale).to( {x: 0, y: 0}, 1000, Phaser.Easing.Cubic.Out, true, 0, false);
        
        game.add.tween(seasons).to( {y:690}, 1500, Phaser.Easing.Cubic.Out, true, 100, false);

		game.add.tween(title.scale).to( {x: 0, y: 0}, 1000, Phaser.Easing.Back.In, true, 0, false);
		game.add.tween(title).to( {angle:-40}, 1000, Phaser.Easing.Elastic.In, true, 0, false);
         
		game.add.tween(playBtn).to({ y: -100 }, 600, Phaser.Easing.Cubic.In, true, 0, false);
		game.add.tween(helpBtn).to({ y: -100 }, 600, Phaser.Easing.Cubic.In, true, 300, false);
		 
		var tw=game.add.tween(scoresBtn);
		tw.to({ y: -100 }, 600, Phaser.Easing.Cubic.In, true, 600, false);
		tw._lastChild.onComplete.add(resetVarsForNewGame, this);
		tw.start();
	}

    function submitButtonShowHide(val) {
        if (val == "show") {
            submitBtn.y = 460;
            game.add.tween(submitBtn).to({ alpha: 1}, 1000, Phaser.Easing.Linear.None, true, 0, false);
        } else if (val == "hide") {
            submitBtn.y = -460;
            submitBtn.alpha = 0;
        }
    }


	function enableButtons() {
		
		btnsEnabled = true;
        //playBtn.freezeFrames = false;
        //helpBtn.freezeFrames = false;
        //scoreBtn.freezeFrames = false;
	}

	function disableButtons() {
		
        console.log("BUT WHY!");
		btnsEnabled = false;
        //playBtn.freezeFrames = true;
        //helpBtn.freezeFrames = true;
        //scoreBtn.freezeFrames = true;
	}

	///////// BUTTONS ///////////


	function playOnClick() {
		//Clicked the play button
		if (btnsEnabled) {
			bringOutButtons();
			disableButtons();
		}
		
	}

	function helpOnClick() {
		//Clicked the help button
		if (btnsEnabled) {
            disableButtons();
            helpGroup = game.add.group();
            var helpBg = game.add.sprite(0, 0, 'help');
            var closebtn = game.add.button(395, 10, 'close', closeHelp, this, 1, 0, 1);
            helpGroup.add(helpBg);
            helpGroup.add(closebtn);
            helpGroup.x = 20;
            helpGroup.y = -300;
            game.add.tween(helpGroup).to( {y:120}, 1500, Phaser.Easing.Elastic.Out, true, 0, false);


		}
	}

    function closeHelp() {
        var t = game.add.tween(helpGroup);
        t.to( {y:-500}, 500, Phaser.Easing.Back.In, true, 0, false);
        t.onComplete.add(enableButtons, this);
        t.start();
    }

	function scoresOnClick() {
		//Clicked the High scores button
		if (btnsEnabled) {
            disableButtons();
            $.getJSON( "getscores.php", function( data ) {
                buildHighScores(data);
            });

		}
	}

	function continueOnClick() {
	//Did not submit high score
        var tween = game.add.tween(gameOverGroup);
        tween.to({ y: -130}, 1200, Phaser.Easing.Cubic.Out, true);
        tween.onComplete.add(bringInButtons, null);
        tween.start();
        game.add.tween(scoreText).to( {alpha:0}, 1000, Phaser.Easing.Linear.None, true, 0, false);
        $('#login').fadeOut('slow');
	}



	function submitOnClick() {
		//submit high score - Show the form
        game.add.tween(gameOverGroup).to({ y: -130}, 1200, Phaser.Easing.Cubic.Out, true);
        game.add.tween(scoreText).to( {alpha:0}, 1000, Phaser.Easing.Linear.None, true, 0, false);
		//document.getElementById("login").style.display="block";
        $('#login').fadeIn('slow');
	}

	function sumbitHighScore() {
		//Submit High score - error check and submit
		userName = document.getElementById("userName").value;
		userEmail = document.getElementById("email").value;
		userCompany = document.getElementById("company").value;

		if(!userName) {
			formfeedback.innerHTML = "Please enter your name";
			return false;
		}

		var atpos=userEmail.indexOf("@");
		var dotpos=userEmail.lastIndexOf(".");
		if (atpos<1 || dotpos<atpos+2 || dotpos+2>=userEmail.length) {
		  formfeedback.innerHTML = "Please enter a valid email address";
		  return false;
		}

		//If all ok send values to php
        //document.getElementById("login").style.display="none";
        $('#login').fadeOut('slow');
		var params = "uname="+userName+"&company="+userCompany+"&email="+userEmail+"&score="+score;
		$.post('insertscore.php', params, function (response) {
      		if (response == "error") {
      			console.log("something went wrong inserting score");
      		} else {
      			var tmpArray = response.split("=");
      			userRank = tmpArray[1];
      			
      		}

      		//hide form and loading high scores
            $.getJSON( "getscores.php", function( data ) {
                buildHighScores(data);
            });
      		
   		});
	}

    function createContainerArray() {
        for (var i = 0; i < contHeight; i++) {
            allContainers[i] = [];
            for (var j = 0; j < contWidth; j++) { 
                allContainers[i][j] = 0;
            }
        }
    }

    function createLettersArray() {
        for (var i = 0; i < letterCount.length; i++) {
            for (var j = 0; j < letterCount[i].c; j++) { 
                letters.push(letterCount[i].l)
            }
        }
    }

    function resetVarsForNewGame() {
    	if (!gameStarted) {
    		game.add.tween(scoreText).to( {alpha:1}, 1000, Phaser.Easing.Linear.None, true, 0, false);
    		gameStarted = true;
	        console.log("Resetting at " + game.time.now);
	        speed = 0.25; // contsant speed for lower containers
	    	raiseSpeed = 600; //Normally 600
	    	containerCount = 0;
	        allContainersGroup.removeAll();
	        allContainers = []; 
	        letters = [];
	        currentWordString = "";
	        currentWord = []; 
	        score = 0;
            scoreText.setText('Score: ' + score);
	        gameOver = false;
	        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
	        createContainerArray();
	        createLettersArray();
            submitButtonShowHide("show");
	        //start the game;
	        addContainer();
	    }
    }




    function addContainer() {
       //Create a new container
        var nxt = nextEmpty();
        if (!gameOver) {

			//check if speed needs increased
			containerCount++;
			
			if (containerCount % 10 == 0) {
					
				    speed += 0.02;
    				raiseSpeed -= 10; 
			}   	
            
            var x = (nxt[1] * 60) + 90;
            var y = -60;
            var cont = game.add.group();
            var n = getRandomInt (0, 9);
            var c = game.add.button(0, 0, 'containers', clickedCont, cont,3*n+1, 3*n, 3*n+2);
            c.anchor.setTo(0.5, 0.5);
            c.name = "cont";
            var text = randomLetter();
            var t = game.add.bitmapText(0, 0, text, { font: '60px Flipbash', align: 'center' });
            t.anchor.setTo(0.5, 0.5);
            cont.letter = text;
            cont.add(c);
            cont.add(t);
            cont.exploded = false; //Bug - game over being called twice.
            cont.x = x;
            cont.y = y;
            cont.row = nxt[0];
            cont.col = nxt[1];
            cont.clicked = false;
            cont.c = c;
            cont.t = t;
            cont.n = n;
            cont.exploded = false;
            allContainersGroup.add(cont._container);
            lowerContainer(cont, nxt[0], true);
            
            fg.bringToTop();
        } else {
    		
    		doGameOver();
            console.log("Game Over ");
        }

    }


    function lowerContainer(cont, level, fromtop) {
    	// Lower the container
        var newY = 400-(level*60);
        var distance = newY - cont.y;
        var time = distance / speed;
        lowerCcont = cont;
        lowerC = game.add.tween(cont);
        lowerC.to({y:newY}, time, Phaser.Easing.Cubic.Out);
        lowerC.onComplete.add(addContainerToArray, this);
        lowerC.start();
        if (fromtop)
        {
	        //Lower the grab with it
			grab.x = cont.x;
			grab.y = -322;
			lowerG = game.add.tween(grab);
			lowerG.to({y:newY-262}, time, Phaser.Easing.Cubic.Out);
	        lowerG.onComplete.add(raiseGrab, this);
	        lowerG.start();
        } else {
            //Postion has shifted so reset the grab
            lowerG.onComplete.removeAll();
            lowerG = game.add.tween(grab);
            lowerG.to({y:newY-262}, time, Phaser.Easing.Cubic.Out);
            lowerG.onComplete.add(raiseGrab, this);
            lowerG.start();
        }

		//start the tweens
        
        

    }

    function raiseGrab() {
    	var raiseG = game.add.tween(grab);
		raiseG.to({y:-322}, raiseSpeed, Phaser.Easing.Cubic.In);
        raiseG.onComplete.add(addContainer, this);

        raiseG.start();

    }

    function addContainerToArray() {

        allContainers[lowerCcont.row][lowerCcont.col] = lowerCcont;
        
    }

    function printArray() {
        //For debugging
        console.log("--------------START PRINT-----------------------");
        var str = ""
        for (var i = contHeight-1; i >= 0; i--) {
            str = "["
            for (var j = 0; j < contWidth; j++) { 
                if (allContainers[i][j] == 0) {
                    str += "0, ";
                } else {
                    str += "1, ";  
                }
                
            }
            str += "]";
            console.log(i + "=" + str);
        }
        console.log("--------------END PRINT-----------------------");

    }

    function nextEmpty() {
        //Get the next empty space for loading container
        for (var i = 0; i < contHeight; i++) {
            for (var j = 0; j < contWidth; j++) { 
                if (allContainers[i][j] == 0) {
                    //allContainers[i][j] = 1;
                    return [i,j];
                }
            }

        }
        //If there is no more space left to load a container then its game over!
        gameOver = true;
    }

    function nextEmptyInColumn(col) {
        //Get the next empty space available in a column
        console.log("nextEmptyInColumn col=" + col);
        for (var i = 0; i < contHeight; i++) { 
        	console.log("nextEmptyInColumn i=" + i + "  val=" + allContainers[i][col]);
            if (allContainers[i][col] == 0) {

                return i;
            }

        }
    }

    function submitWord() {
    	var tween = game.add.tween(currentWordText);
    	console.log(game.time.now);
        if (checkCurrentWord()) {
            console.log(game.time.now);
            //A word in the dictionary
            var l = currentWordString.length;
            score += l+((l-3)*l);
            scoreText.setText('Score: ' + score);
            removeContainers();
            moveContainersDown();

 			tween.to( { alpha:0 }, 1000, Phaser.Easing.Linear.None);
 			tween.onComplete.add(clearCurrentWord, this);
 			tween.start();
        } else {
        	console.log(game.time.now);

 			tween.to( { x:250 }, 50, Phaser.Easing.Linear.None)
 				.to( { x:230 }, 100, Phaser.Easing.Linear.None)
 				.to( { x:250 }, 100, Phaser.Easing.Linear.None)
 				.to( { x:230 }, 100, Phaser.Easing.Linear.None)
 				.to( { x:240 }, 50, Phaser.Easing.Linear.None);
 			tween._lastChild.onComplete.add(clearCurrentWord, this);
 			tween.start();
        }

    }

    function removeContainers() {
        lowerC.pause();
        console.log("--------START--------------");
        printArray();
        //Remove containers after a word has been submitted sucsessfully
        for (var i = 0; i < currentWord.length; i++) {
            console.log(currentWord[i].cont.row + " - " + currentWord[i].cont.col);
            var cont = currentWord[i].cont
            allContainers[cont.row][cont.col] = 0;
            cont.c.destroy();
            cont.destroy();
        }
        console.log("--------AFTER DELETE--------------");
        printArray();
    }

    function moveContainersDown(){
    	for (var i = 0; i < contHeight-1; i++) {
            for (var j = 0; j < contWidth; j++) { 
                if (allContainers[i][j] == 0 ) {
                	//Move container down
                	checkForContainersAbove(i,j);
                }
            }

        }

        console.log("--------AFTER DROP DOWN--------------");
        printArray();

        //Finally check if the current container that is loading needs updating
        
        var nxt = nextEmptyInColumn(lowerCcont.col);
		console.log("--------DROP DOWN THE ONE MOVING--------------");
		console.log("Lowest=" + nxt + " CurrentTarget=" + lowerCcont.row);
        if (nxt < lowerCcont.row) {
        	lowerC.stop()
        	lowerCcont.row = nxt;
        	lowerContainer(lowerCcont, nxt, false);
        } else {
        	lowerC.resume();

        }

    }

    function checkForContainersAbove(rowstart, col) {
    	var del = 0; // delay between drops, keep it small
        //Looks for containers above and empty space and moves them down.
    	for (var r = rowstart+1; r < contHeight; r++) {
    		if (allContainers[r][col] != 0) {
    			
				//Move it down
                var lowestrow = getLowestRow(col)
                if (lowestrow != -1) {
    				var c = allContainers[r][col];
    				allContainers[lowestrow][col] = c;
    				allContainers[r][col] = 0;
                    c.row = lowestrow;
                    game.add.tween(c).to({ y: 400-(lowestrow*60) }, 500, Phaser.Easing.Bounce.Out, true, del);
                    del += 50;
				    
                }
			}

    	}
    }

    function getLowestRow(col) {
        //Get the lowest possible row for container to fall to
        for (var r = 0; r < contHeight; r++) {
            if (allContainers[r][col] == 0) {
                return r;
            }
        }
        return -1; // No lowest row found. Something wend horribly wrong!
    }


    function clickedCont() {
        //Clicked on a container with a letter
    	if (!gameOver) {
	        if (this.clicked) {
	            clearCurrentWord();
	            //
	        } else {
	            console.log("r=" + this.row + " col=" + this.col);
	            currentWord.push({l:this.letter, cont:this});
	            currentWordString += this.letter;
	            //currentWordText.setText(setWordFormat());
	            currentWordText.setText(currentWordString);
	            this.clicked = true;
	            //Update Sprite sheet to make container white
	            if (isEven(this.n)) {
	                this.c.setFrames(30, 31, 32);
	            } else {
	                this.c.setFrames(33, 34, 35);
	            }
	        }
	    }

    }


    function checkCurrentWord() {

    
    
        var tmpWord = currentWordString.toLowerCase();
        
        if (tmpWord.length < 3) {
            return false;
        //} else if ($Spelling.BinSpellCheck(tmpWord)) { alernative dictionary method
        } else if (dictionary.check(tmpWord)) {
            return true;
        } else {
            return false;
        }
        
        
    }

    function clearCurrentWord() {
        for (var i = 0; i < currentWord.length; i++) {
            currentWord[i].cont.clicked = false;
            currentWord[i].cont.c.setFrames(currentWord[i].cont.n*3+1, currentWord[i].cont.n*3, currentWord[i].cont.n*3+2);
        }
        currentWord = [];
        currentWordString = "";
        currentWordText.setText("");
        //currentWordText.style.fill = "#ffffff"; 
        currentWordText.scale.setTo(1,1);
        currentWordText.alpha=1;


    }
    /////////////////////////////   GAME OVER //////////////////////////////

    function doGameOver() {
        //tween in the game over
        gameStarted = false;
        clearCurrentWord();
        submitButtonShowHide("hide");
        gameOverText.setText("GAME OVER\nSCORE: " + score);
        game.add.tween(gameOverGroup).to({ y: 300 }, 1200, Phaser.Easing.Cubic.Out, true);
        allContainersGroup.forEach(stopButtons, this, true) ;
    }

    function stopButtons(item) {
        item.outOfBoundsKill = true;
        item.bringToTop();
        item.group.outOfBoundsKill = true;
        if (item.name == "cont" && item.group.exploded == false) {
            item.group.exploded = true;
            item.freezeFrames = true;
            explode(item.group);

        }
    }

    function explode(item) {
        var newX;
        if (item.col < 3)  {
            //explode to left
            newX = getRandomInt(item.x - 100, item.x);
        } else {
            //explode to right
            newX = getRandomInt(item.x, item.x + 100);
        }

        var t = getRandomInt(300, 600);
        var r = getRandomInt(-90, 90);
        var del = (-50 * item.row) + 250;
        
        game.add.tween(item).to({x: newX}, t, Phaser.Easing.Cubic.In, true, del, false);
        game.add.tween(item).to({y: 700}, t, Phaser.Easing.Cubic.In, true, del, false);
        game.add.tween(item).to({angle: r}, t, Phaser.Easing.Linear.None, true, del, false);
       
    }

    /////////////////////////////   HIGH SCORES  //////////////////////////////

    function buildHighScores(json) {
        hsGroup = game.add.group();
        var closebtn = game.add.button(395, 10, 'close', closeHighScores, this, 1, 0, 1);
        var bg = game.add.sprite(0,0, 'hsbg');
        hsGroup.add(bg);
        hsGroup.add(closebtn);
        var rankText = "\n";
        var nameText = "Name\n";
        var compText = "Company\n";
        var scoreText = "Score\n";
        var style = { font: "15px Arial Bold", fill: "#000033", align: "left" };
        
        for (i=0; i<json.length; i++) {
            rankText += "\n" + (i+1);
            nameText += "\n" + json[i].username;
            compText += "\n" + json[i].company;
            scoreText += "\n" + json[i].score;
        }

        if (userRank > 15 && userName) {
            rankText += "\n\nYour Score\n\n" + userRank;
            nameText += "\n\n\n\n" + userName;
            compText += "\n\n\n\n" + userCompany
            scoreText += "\n\n\n\n" + score;
        }

        var tRank = game.add.text(7, 60, rankText, style);
        var tName = game.add.text(40, 60, nameText, style);
        var tComp = game.add.text(185, 60, compText, style);
        var tScor = game.add.text(350, 60, scoreText, style);

        hsGroup.add(tRank);
        hsGroup.add(tName);
        hsGroup.add(tComp);
        hsGroup.add(tScor);

        hsGroup.x = 20;
        hsGroup.y = -300;
        game.add.tween(hsGroup).to( {y:120}, 1500, Phaser.Easing.Elastic.Out, true, 0, false);

    }


    function closeHighScores() {
        var t = game.add.tween(hsGroup);
        t.to( {y:-500}, 500, Phaser.Easing.Back.In, true, 0, false);
        if (playBtn.y < 0) {
            //if buttons are hidden (end of game) bring them in
            t.onComplete.add(bringInButtons, this);
        } else {
            enableButtons();
        }
        
        t.start();
    }



    function randomLetter() {

        var num = Math.floor(Math.random() * letters.length);
        var letter = letters[num];
        letters.splice(num,1);

        if (letters.length == 0){
            createLettersArray();
        }

        return letter;
        
    }

    function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function isEven(n) 
    {
        return (n % 2 == 0);
    }