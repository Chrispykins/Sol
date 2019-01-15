//level class
(function (global) {
	
	var canvas= global.canvas;
	var context= global.context;
	var viewport= global.viewport;

	function Level(options) {

		//make sure options exists
		options= options || {};

		this.number= options.number || 0;
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

		this.createGrid(options.level);

		this.undoManager = new global.UndoManager({level: this});

		this.canvas= canvas;
		this.context= context;
		this.viewport= viewport;

		this.viewportOffset= options.viewportOffset || [0, 0];

		this.sounds= {
			onLoad: global.sounds.level_in,
			onWin: global.sounds.level_out,
			_do: global.sounds._do,
			mi: global.sounds.mi,
			fa: global.sounds.fa,
			fi: global.sounds.fi,
			sol: global.sounds.sol,
			do: global.sounds.do
		}

		if (this.number== 50) {
			this.sounds.onLoad= global.sounds.level_in_slow;
		}

		//this.sounds.onLoad.volume=  global.sounds.level_in.volume * 0.5;
		//this.sounds.onWin.volume= global.sounds.level_out.volume * 0.5;

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
			
			this.viewport.zoom( global.Math.pow(this.zooming, dt) );

			//stop zooming if level is at full size
			if (this.viewport.scale > this.finalZoom) {
				
				this.zooming= 1;

				this.viewport.focus(this);
				this.viewport.xy[0]+= this.viewportOffset[0];
				this.viewport.xy[1]+= this.viewportOffset[1];

				//launch the level for the credits
				if (this.number < 0) {
					this.launch();
				}
				else {
					//otherwise just give the solution to the player
					this.playSolution();	
				}

			}
		}
	}


	Level.prototype.draw= function(dt) {

		this.perform("draw", dt);

		//animate the number on level load
		if (this.numberDisplay && this.number != 0) {

			//calculate the percentage of time passed since the animation started
			var progress= (global.Date.now() - this.numberDisplay.startTime)/this.numberDisplay.endTime;

			var y= global.Math.smoothStep(this.numberDisplay.startY, this.numberDisplay.endY, progress);

			var number= new String(this.number);
			var fontSize= new String(parseInt(250 * this.canvas.scale));

			this.context.font= fontSize + 'px Times';
			this.context.textAlign= 'center';
			this.context.fillStyle= '#335168';
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

				//check for wormholes
				if (grid[y][x].wormhole) {


					var newHole= new global.Wormhole({
						xy: [pos[0], pos[1]],
						size: [this.cellSize, this.cellSize],
						gridPos: [x, y],
						level: this
					});

					if (outlet) {
						newHole.outlet= [outlet.xy[0], outlet.xy[1]];
						outlet.outlet= [newHole.xy[0], newHole.xy[1]];
					}
					else {
						var outlet= newHole;
					}

					newCell.push(newHole);
					this.wormholes.push(newHole);
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
							var temp= global.sounds[solution[index][i]].cloneNode();
							temp.volume= Math.min( 1, 0.25 + 1/l) * temp.volume;
							temp.play();
						}
					}

					index++;
				}
				else {
					clearInterval(this.musicBox);
					this.musicBox= null;
				}
			}, 1000/this.bps);
		}
	}

	Level.prototype.checkSolution= function() {

		if (this.solution.length == this.playerSolution.length) { //# of beats in input by player must be equal to or greater than solution

			for (var beat= 0, end= this.solution.length; beat < end; beat++) {

				var solutionNotes= this.solution[beat];
				var playerNotes= this.playerSolution[beat];

				//matches is an boolean array, listing whether or not each note 
				//in the solution and player input has found a match
				var matches= [];


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
		//player has not yet even strung together enough beats to complete solution
		else return false; 
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

		this.playerSolution.push(thisBeat);

		//play the beat
		for (i= 0, l= thisBeat.length; i < l; i++) {
			
			if (thisBeat[i]) {
				//adjust volume for multiple notes
				var temp= this.sounds[thisBeat[i]].cloneNode();
				temp.volume= Math.min( 1, 0.25 + 1/l) * temp.volume;
				temp.play();
				
			}
		}

		if (this.checkSolution()) {

			this.playing= false;
			this.balls= [];

			this.onWin();
		}
	}

	Level.prototype.onWin= function() {

		//zoom out
		this.zooming= 1/200;

		//play woosh out sound
		this.sounds.onWin.play();

		this.unload();
		
		setTimeout(function() {
			
			if (this.number == 0) {
				global.importLevel(global.levels[parseInt(localStorage.progress) + 1]);
			}
			else if (this.number < 0) {
				global.startGame();
			}

			else if (global.levels[parseInt(this.number) + 1]) {
				
				//load next level
				global.importLevel(global.levels[parseInt(this.number) + 1]);

				localStorage.progress= this.number
			}
			else {

				localStorage.progress= 0;
				
				//otherwise display ending screen
				global.importLevel(global.levels.credits);
			}
		}.bind(this), 900);



	}

	Level.prototype.onExit= function() {

		clearInterval(this.musicBox);
		this.musicBox= null;

		this.playing= false;

		this.zooming= 1;

		console.log(this.obstacles)

		this.sounds.onLoad.pause();
		this.sounds.onLoad.currentTime= 0;
		this.sounds.onWin.pause();
		this.sounds.onLoad.currentTime= 0;
	}

	Level.prototype.unload = function() {

		for (var i = 0, l = this.obstacles.length; i < l; i++) {
			if (this.obstacles[i] instanceof global.Obstacle) this.obstacles[i].sounds.turn.remove();
		}
	}

	Level.prototype.onLoad= function() {

		//////////////////////////////////////////////////////////////
		// Initialization of level complete.
		// The following code creates the animations that
		// play when a level is loaded
		//////////////////////////////////////////////////////////////



		//focus viewport on level to center level and store final scale
		this.viewport.focus(this);
		this.viewport.xy[0]+= this.viewportOffset[0];
		this.viewport.xy[1]+= this.viewportOffset[1];

		//store final scale
		this.finalZoom= viewport.scale;

		//start level small and zoom in
		this.viewport.zoom(0.01);

		//final level should be a bit more epic
		if (this.number == 50) {

			this.zooming= 3.2;

		}
		else {
			this.zooming= 10;
		}

		//wind sound
		this.sounds.onLoad.play();

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

	
	//captures and processes click event on level
	Level.prototype.onClick= function(click) {

		var success= false;

		gameX= (click[0] / this.viewport.scale) + this.viewport.xy[0];
		gameY= (click[1] / this.viewport.scale) + this.viewport.xy[1];

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
		}
		else {
			Cocoon.App.exit();
		}
	}
			

	global.Level= Level;


})(Sol);