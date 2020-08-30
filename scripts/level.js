//level class
function run_level(global) {
	
	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	var levelNumberColor = global.levelNumberColor;

	addEventListener('beforeunload', function() { global.currentLevel.save() });

	function Level(options) {

		//make sure options exists
		options= options || {};

		this.levelData = options.level;

		this.assets = options.assets || global.createAssetList(options);

		this.number= parseInt(options.number) || 0;
		this.author= options.author || 'Chris';

		this.xy= [0, 0];

		this.gridSize= options.size || [0, 0];
		this.cellSize= 200;
		this.solution= options.solution || [];
		this.playerSolution= [];

		this.size= [this.gridSize[0] * this.cellSize, this.gridSize[1] * this.cellSize];

		this.grid= [];

		this.timer= 0;
		this.bps= options.bps || 6; //beats per second
		this.playing= false;

		this.notes= [];
		this.obstacles= [];
		this.starts= [];
		this.balls= [];
		this.wormholes= [];
		this.buttons= [];

		this.delayedButtonActions = [];

		this.createGrid(options.level);

		this.undoManager = new global.UndoManager({level: this, actions: JSON.parse(localStorage.Sol_undoBuffer || null)});

		this.canvas= canvas;
		this.context= context;
		this.viewport= viewport;

		this.viewportOffset= options.viewportOffset || [0, 0];

		this.zooming = 1;

		this.sounds= {
			onLoad: 'level_in',
			onWin: 'level_out',
		}

		if (this.number== 50) {
			this.sounds.onLoad= 'level_in_slow';
		}

		//////////////////////////////////////////////////////////////
		// Initialization of level complete.
		// The following function creates the animations that
		// play when a level is loaded
		//////////////////////////////////////////////////////////////

		this.onLoad();

	}

	Level.prototype.update= function(dt) {

		//update balls
		for (var i=0, l= this.balls.length; i < l; i++) {

			//adjust opacity of ball as it enters and leaves wormholes
			if (this.wormholes.length) {

				this.updateWormholeDistance(this.balls[i]);
			}
			
			this.balls[i].update(dt);

			//cut out any balls that were destroyed last tick
			if (this.balls[i].destroyed) {
				this.balls.splice(i, 1);
				l--
				i--

				if (this.balls.length== 0) {
					this.perform("revert");
				}
			}
		}

		//update timer for beat
		if (this.playing) {
			this.timer+= dt;
		}

		while(this.timer > 1/this.bps) { //play beat

			this.onBeat();

			this.timer+= -(1/this.bps);
		}

		//check if the level is zooming in or out
		if (this.zooming != 1) {
			
			viewport.zoom( global.Math.pow(this.zooming, dt) );

			//stop zooming if level is at full size
			if (viewport.scale > this.finalZoom) {
				
				this.zooming= 1;

				viewport.focus(this);
				viewport.xy[0]+= this.viewportOffset[0] * viewport.scale;
				viewport.xy[1]+= this.viewportOffset[1] * viewport.scale;

				//launch the level for the credits
				if (this.number < 0) this.launch();
				else this.playSolution();

					/*if (this.number == 1 && localStorage.Sol_firstTime) {
						global.displayTutorial();
						localStorage.Sol_firstTime= false;
					}*/
			}
		}
	}

	Level.prototype.updateWormholeDistance = function(ball) {
				
		var startDistance = Math.distance(ball.xy, this.wormholes[0].xy);
		var endDistance   = Math.distance(ball.xy, this.wormholes[1].xy);
		var distance, target;
		
		if (startDistance < endDistance) {
			distance = startDistance;
			target = 0;
		}
		else { 
			distance = endDistance;
			target = 1;
		}

		if (ball.distanceToWormhole > this.cellSize/2 && distance < this.cellSize/2) {
			this.wormholes[0].activate();
			this.wormholes[1].activate();
		}

		ball.distanceToWormhole = distance;
	}


	Level.prototype.draw= function(dt) {

		this.perform("draw", dt);

		//debug border
		/*
		var scale = global.scale;
		var x = (this.xy[0] - viewport.xy[0]) * scale + viewport.canvasPos[0] * canvas.scale;
		var y = (this.xy[1] - viewport.xy[1]) * scale + viewport.canvasPos[1] * canvas.scale;

		this.context.strokeRect(x, y, this.cellSize * this.gridSize[0] * scale, this.cellSize * this.gridSize[1] * scale);
		*/

		//animate the number on level load
		if (this.numberDisplay && this.number != 0) {

			//calculate the percentage of time passed since the animation started
			var progress= (global.Date.now() - this.numberDisplay.startTime)/this.numberDisplay.endTime;

			var y= global.Math.smoothStep(this.numberDisplay.startY, this.numberDisplay.endY, progress);

			var number= new String(this.number);
			var fontSize= new String(parseInt(250 * this.canvas.scale));

			this.context.font= fontSize + 'px Times';
			this.context.textAlign = 'center';
			this.context.fillStyle= levelNumberColor;
			this.context.fillText(number, 960 * this.canvas.scale, y * this.canvas.scale);

			if (progress > 1) {
				
				if (y < 1090) {
					
					this.numberDisplay= {
						startTime: global.Date.now(),
						startY: 525,
						endY: 2160,
						endTime: 2500
					}
				}
				else delete this.numberDisplay;
			
			}

			this.context.fillStyle= 'black';
		}
	}

	Level.prototype.createGrid= function(grid) {

		for (var y= 0, height= this.gridSize[1]; y < height; y++) {

			var newRow= [];

			for (var x= 0, width= this.gridSize[0]; x < width; x++) {

				var newCell= [];
				var pos= [x * this.cellSize + this.xy[0], y * this.cellSize + this.xy[1]];

				//check for wormholes
				if (grid[y][x].wormhole) {


					var newHole= new global.Wormhole({
						xy: [pos[0] + this.cellSize/2, pos[1] + this.cellSize/2],
						size: [this.cellSize - 40, this.cellSize - 40],
						gridPos: [x, y],
						level: this
					});

					if (outlet) {
						newHole.outlet= outlet
						outlet.outlet= newHole;
					}
					else {
						var outlet= newHole;
					}

					newCell.push(newHole);
					this.wormholes.push(newHole);
				}

				//check for notes
				if (grid[y][x].note) {
					
					var newNote= new global.Note({
						xy: [pos[0], pos[1]],
						size: [this.cellSize, this.cellSize],
						gridPos: [x ,y],
						solfege: grid[y][x].note,
						level: this,
					})

					newCell.push(newNote);
					this.notes.push(newNote);
				}

				//check for twoTones
				if (grid[y][x].twoTone) {

					var newTwoTone= new global.TwoTone({
						xy: [pos[0], pos[1]],
						size: [this.cellSize, this.cellSize],
						gridPos: [x, y],
						solfege: grid[y][x].twoTone,
						level: this,
					});

					newCell.push(newTwoTone);
					this.notes.push(newTwoTone);
				}

				//check for obstacles
				if (grid[y][x].obstacle) {

					if (grid[y][x].obstacle.slice(-4) == 'Gate') {

						var newObstacle= new global.Gate({
							xy: [pos[0], pos[1]],
							size: [this.cellSize, this.cellSize],
							gridPos: [x ,y],
							direction: grid[y][x].obstacle.slice(0, -4),
							open: grid[y][x].gate,
							level: this,
						});
					}
					else {

						var newObstacle= new global.Obstacle({
							xy: [pos[0], pos[1]],
							size: [this.cellSize, this.cellSize],
							gridPos: [x ,y],
							direction: grid[y][x].obstacle,
							level: this,
						});
					}

					newCell.push(newObstacle);
					this.obstacles.push(newObstacle);
				}

				//check for start points
				if (grid[y][x].start) {

						var newStart= new global.Start({
							xy: [pos[0], pos[1]],
							size: [this.cellSize, this.cellSize],
							gridPos: [x ,y],
							direction: grid[y][x].start,
							level: this,
						});

					newCell.push(newStart);
					this.starts.push(newStart);
				}

				//check for buttons
				if (grid[y][x].button) {
					
					var newButton= new global.Button({
						xy: [pos[0], pos[1]],
						size: [this.cellSize, this.cellSize],
						gridPos: [x ,y],
						directions: grid[y][x].button,
						level: this,
					})

					newCell.push(newButton);
					this.buttons.push(newButton);
				}

				newRow.push(newCell);

			}

			this.grid.push(newRow);

		}

		for (var i= 0, l= this.buttons.length; i < l; i++) {
			this.buttons[i].findAdjacent();
		}
	}

	Level.prototype.getCellAtLocation = function(x, y) {

		gridX= global.Math.floor( (x - this.xy[0]) / this.cellSize);
		gridY= global.Math.floor( (y - this.xy[1]) / this.cellSize);

		return this.grid[gridY][gridX];
	}


	//launch the balls and start the beat
	Level.prototype.launch= function() {

		this.balls= [];
		this.timer= 0;
		this.playerSolution= [];

		if (!this.playing) {
			this.perform("save");
		}
		else {
			this.perform("revert");
		}

		this.save();

		for (var i= 0, l= this.starts.length; i <l; i++) {

			this.starts[i].launch();
		}

		this.playing= true;

	}

	//calls a function on all objects in the level, pass parameters as additional arguments
	Level.prototype.perform= function(func) {

		//perform func on notes
		for (var i= 0, l= this.notes.length; i < l; i++) {
			this.notes[i][func](arguments[1], arguments[2]);
		}

		//perform func on wormholes
		for (i= 0, l= this.wormholes.length; i < l; i++) {
			this.wormholes[i][func](arguments[1], arguments[2]);
		}

		//perform func on buttons
		for (var i= 0, l= this.buttons.length; i < l; i++) {
			this.buttons[i][func](arguments[1], arguments[2]);
		}

		//perform func on obstacles
		for (i= 0, l= this.obstacles.length; i < l; i++) {
			this.obstacles[i][func](arguments[1], arguments[2]);
		}

		//perform func on start points
		for (i= 0, l= this.starts.length; i < l; i++) {
			this.starts[i][func](arguments[1], arguments[2]);
		}

		//perform func on balls
		for (i=0, l= this.balls.length; i < l; i++) {
			this.balls[i][func](arguments[1], arguments[2]);
		}
	}

	Level.prototype.playSolution= function() {
/*
		if (!this.playingSolution) {

			this.playingSolution = true;

			var noteLength = 1/(this.bps * global.gameSpeed);

			for (var i = 0; i < this.solution.length; i++) {

				var notes = this.solution[i];

				for (var noteIndex = 0; noteIndex < notes.length; noteIndex++) {

					var volume = Math.min(1, 0.25 + 1 / notes.length);
					console.log(notes, i * noteLength);
					global.audioManager.playplayWebAudio(this.solution[i][noteIndex], volume, i * noteLength);
				}
			}

			var level = this;
			setTimeout(function() { level.playingSolution = false; }, noteLength * this.solution.length * 1000);
		}
*/
		if (this.number > 0) {
			
			var solution= this.solution;

			var index= 0;

			if (this.musicBox) {
				clearInterval(this.musicBox);
				this.musicBox= null;
			}

			this.musicBox= setInterval(function() {

				if (index < solution.length) {

					if (solution[index]) {

						for (var i= 0, l= solution[index].length; i < l; i++) {
							
							//adjust volume for multiple notes
							var volume= Math.min( 1, 0.25 + 1/l);
							global.audioManager.play(solution[index][i], volume);
						}
					}

					index++;
				}
				else {
					clearInterval(this.musicBox);
					this.musicBox= null;
				}
			}, 1000/(this.bps * global.gameSpeed));
		}


	}

	Level.prototype.checkSolution= function() {

		if (!this.playerSolution.length || this.playerSolution.length > this.solution.length) return false;

		//check if all balls are gone
		var noBalls = true;
		for (var ball = 0; ball < this.balls.length; ball++) {
			if (!this.balls[ball].destroyed) noBalls = false;
		}

		for (var beat= 0, end= this.solution.length; beat < end; beat++) {

			var solutionNotes= this.solution[beat];
			var playerNotes= this.playerSolution[beat];

			//allow player solutions that end with empty notes if there are no more balls left
			if (!playerNotes) {
				if (noBalls) playerNotes = []; 
				else return false;
			}

			//matches is an boolean array, listing whether or not each note 
			//in the solution and player input has found a match
			var matches= []


			//if both inputs are empty, return true
			if (solutionNotes.length=== 0 && playerNotes.length=== 0) {
				matches= [true];
			}
			else {
				
				var solutionMatched= false;
				var inputMatched= false;

				//check all notes in solution against player input
				for (var i= 0, l= solutionNotes.length; i < l; i++) {

					solutionMatched= false;

					for (var j= 0, k= playerNotes.length; j < k; j++) {

						solutionMatched= solutionMatched || solutionNotes[i] == playerNotes[j];
					}

					matches.push(solutionMatched);
				}

				//check all notes in player input against solution
				for (var i= 0, l= playerNotes.length; i < l; i++) {

					inputMatched= false;

					for (var j= 0, k= solutionNotes.length; j < k; j++) {

						inputMatched= inputMatched || playerNotes[i] == solutionNotes[j];
					}

					matches.push(inputMatched);
				}

			}

			//loop through to see if all notes matched
			for (var i= 0, l= matches.length; i < l; i++) {
				
				if (!matches[i]) {
					//one of the notes in the solution or player input didn't match
					return false;
				}
			}
	
		}

		//notes matched every beat
		return true;
	}


	//function fires on every beat
	Level.prototype.onBeat= function() {

		var thisBeat= [];

		if (!this.balls.length) {
			this.playing= false;
			return;
		}

		for (var i= 0, l= this.balls.length; i < l; i++) {
			
			if (this.balls[i]) {
				var notes= this.balls[i].onBeat();
				thisBeat= thisBeat.concat(notes);
			}
		}

		//don't include empty starting beats in solution
		if (thisBeat.length || this.playerSolution.length) this.playerSolution.push(thisBeat);

		//play the beat
		for (i= 0, l= thisBeat.length; i < l; i++) {
			
			if (thisBeat[i]) {
				//adjust volume for multiple notes
				var volume= Math.min( 1, 0.25 + 1/l);
				global.audioManager.play(thisBeat[i], volume); //TODO: playWebAudio
				
			}
		}

		//play actions that have been queued by buttons
		this.playDeferredActions();

		//has the player won?
		if (this.checkSolution()) {

			this.playing= false;
			this.balls= [];

			this.onWin();
		}
	}

	Level.prototype.playDeferredActions = function() {


		for (var i = 0, l = this.delayedButtonActions.length; i < l; i++) {

			this.delayedButtonActions[i].activate();
		}

		for (var i = 0, l = this.buttons.length; i < l; i++) this.buttons[i].isPressed = false;


		//clear queue
		this.delayedButtonActions.length = 0;
	}

	Level.prototype.onWin= function() {

		//zoom out
		this.zooming= 1/200;

		//play woosh out sound
		global.audioManager.play(this.sounds.onWin); //TODO: playWebAudio

		this.unload();
	
		
		setTimeout(async function() {

			if (!global.assetPackages.sidebars.loaded) global.loadAssets(global.assetPackages.sidebars);
			
			if (this.number == 0) {
				await global.loadLevel(parseInt(localStorage.Sol_currentLevel));
				global.levelSelect.reset();
			}
			else if (this.number < 0) {
				global.startGame();
			}

			else if (global.levels[this.number + 1]) {

				if (this.number + 1 > localStorage.Sol_progress) {
					global.levelSelect.updateUnlocked(this.number + 1);
				}

				//load next level
				global.loadLevel(this.number + 1);
			}

			else {

				//localStorage.Sol_progress= 0;
				
				//otherwise display ending screen
				global.loadLevel('credits');
			}
		}.bind(this), 900);
	}

	Level.prototype.onExit= function() {

		clearInterval(this.musicBox);
		this.musicBox= null;

		this.playing= false;

		this.zooming= 1;

		this.unload();
	}

	Level.prototype.unload = function() {

		this.save();

		//stop playing solution melody
		if (this.musicBox) {
			clearInterval(this.musicBox);
			this.musicBox = null;
		}

		global.gameSpeed = 1;

/*
		for (var i = 0, l = this.obstacles.length; i < l; i++) {
			if (this.obstacles[i] instanceof global.Obstacle) this.obstacles[i].sounds.turn.remove();
		}

		*/

		//Level.unload shouldn't be an async function, but we need to wait for sidebar assets to be loaded
		//before we load the first level, so return the promise from createSidebars()
		if (this.number == 0) return global.createSidebars();

		//after each level completes, we end the session. A new one starts when the next level loads.
		localStorage.Sol_midsession = 0;
		localStorage.removeItem("Sol_undoBuffer");
	}

	Level.prototype.onLoad= function() {

		//loop through assets, check if we've unlocked any new notes
		if (this.number > 0) {

			for (var i = 0, l = this.assets.length; i < l; i++) {

				global.noteBar.checkUnlock(this.assets[i]);
			}

			//set current level in local storage
			localStorage.Sol_currentLevel = this.number;
		}

		//set level select bar to this level
		if (global.levelSelect) global.levelSelect.animateToSelection(this.number);

		//////////////////////////////////////////////////////////////
		// Initialization of level complete.
		// The following code creates the animations that
		// play when a level is loaded
		//////////////////////////////////////////////////////////////

		//focus viewport on level to center level and store final scale
		viewport.focus(this);

		if (parseInt(localStorage.Sol_midsession) == 0) {
			viewport.xy[0]+= this.viewportOffset[0] * viewport.scale;
			viewport.xy[1]+= this.viewportOffset[1] * viewport.scale;

			//store final scale
			this.finalZoom= viewport.scale;

			//start level small and zoom in
			viewport.zoom(0.01);

			//final level should be a bit more epic
			if (this.number == 50) {

				this.zooming= 3.3;

			}
			else {
				this.zooming= 10;
			}

			//wind sound
			global.audioManager.play(this.sounds.onLoad); //TODO: playWebAudio

			if (this.number < 0) {
				global.showCredits();
				return;
				//don't show the number if it's the credits sequence
			}


			///////////////////////////////////////////////////////////////
			// The animation for the number of the level
			///////////////////////////////////////////////////////////////

			this.numberDisplay= {
				startTime: global.Date.now(),
				startY: -200,
				endY: 525,
				endTime: 2500
			}

			if (this.number== 50) {
				this.numberDisplay.endTime= 4000;
			}
		}

		//start new session (used by android devices to prevent replaying starting sequencing when turning phone back on)
		if (this.number > 0) {
			localStorage.Sol_midsession = 1;
		}
	}

	//updates specific cell of level data with new information
	Level.prototype.updateLevelData = function(thing, data) {

		var x    = thing.gridPos[0];
		var y    = thing.gridPos[1];
		var type = thing.entityType;

		this.levelData[y][x][type] = data;
		this.save();
	}

	//saves current level configuration
	Level.prototype.save = function() {

		//Not sure if we should check if level is in the canon when saving. It is necessary in development,
		//because we don't want to constantly overwrite new levels with old saves, but maybe we can let it slide in release?
		if (this.isCanon) {
			localStorage.Sol_undoBuffer = JSON.stringify(this.undoManager.getBuffer());
			localStorage["Sol_level_"+ this.number] = JSON.stringify(this.levelData);
		}
	}
	
	//captures and processes click event on level
	Level.prototype.onClick= function(click) {

		var success= false;

		if (this.playing) return success;

		gameX= ((click[0] - viewport.canvasPos[0]) / viewport.scale) + viewport.xy[0];
		gameY= ((click[1] - viewport.canvasPos[1]) / viewport.scale) + viewport.xy[1];

		gridX= global.Math.floor(gameX / this.cellSize);
		gridY= global.Math.floor(gameY / this.cellSize);


		if (gridX >= 0 && gridX < this.gridSize[0]) {

			if (gridY >= 0 && gridY < this.gridSize[1]) {

				var cell= this.grid[gridY][gridX];
				
				for (var i= cell.length -1; i >= 0; i--) {
					
					if (cell[i].onClick && cell[i].onClick([gameX, gameY])) {
						return true;

					}
				}		
			}
		}

		return success;		
	}

	Level.prototype.onBackButton= function() {

		if (this.number != 0) {

			this.onExit();
			global.startGame();
		}/*
		else {
			Cocoon.App.exit();
		}*/
	}
			

	global.Level= Level;

}