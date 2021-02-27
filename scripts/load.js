
///////////////////////////////////////////
// begin loading content
///////////////////////////////////////////

const SQRT_2 = Math.sqrt(2);

(function (global) { //The Sol variable gets passed here as the global scope

'use strict';

	var startup = true;

	// initialize global variables
	global.canvas= document.getElementById('canvas');
	global.context= global.canvas.getContext('2d', {alpha: false});
	global.requestAnimationFrame= window.requestAnimationFrame;
	global.Math= Math;
	global.Date= Date;

	//create global audio context
	global.audioContext = new AudioContext();

	//forward declaration of gameplay classes
	global.Wormhole = function() {};
	global.Obstacle = function() {};
	global.Gate = function() {};
	global.Note = function() {};
	global.Button = function() {};

	global.backgroundColor = "#f6f6e7";
	global.levelNumberColor = '#335168';

	global.noteOrder = ["_do", "mi", "fa", "fi", "sol", "do"];

	//initialize localStorage
	if (!localStorage.Sol_progress) {
		localStorage.Sol_progress= '1';
	}

	if (!localStorage.Sol_currentLevel) {
		localStorage.Sol_currentLevel = '1';
	}

	if (!localStorage.Sol_midsession) {
		localStorage.Sol_midsession = '0';
	}

	/*if (!localStorage.Sol_firstTime) {
		localStorage.Sol_firstTime= 'true';
	}*/

	if (!localStorage.Sol_unlocked) {
		localStorage.Sol_unlocked = '[]';
		global.unlockedNotes = [];
	}
	else global.unlockedNotes = JSON.parse(localStorage.Sol_unlocked);

	//canvas settings
	global.canvas.imageSmoothingEnabled= false;
	
	//shift context by half a pixel for pixel perfect drawing
	//global.context.translate(0.5, 0.5)

	//adding distance formula to Math
	Math.distance= function(a, b) {

		var dx = a[0] - b[0];
		var dy = a[1] - b[1];

		dx *= dx;
		dy *= dy;

		return Math.sqrt(dx + dy);
	}

	//fast distance functions for common lines
	global.distanceToVerticalLine = function(x, point) { return Math.abs(point[0] - x); }
	global.distanceToHorizontalLine = function(y, point) { return Math.abs(point[1] - y); }

	global.distanceToNegativeDiagonal = function(origin, point) { 
		return Math.abs(point[1] - point[0] + origin[0] - origin[1]) / SQRT_2;
	}

	global.distanceToPositiveDiagonal = function(origin, point) { 
		return Math.abs(point[1] + point[0] - origin[1] - origin[0]) / SQRT_2;
	}

	Math.lerp = function(start, end, progress) {
    
	    return start * (1 - progress) + end * progress;
	}

	//adding smoothStep to Math for animations
	Math.smoothStep= function(start, end, progress) {

		var x = Math.min(1, Math.max(0, progress));
	    return Math.lerp(start, end, x * x * (3 - 2 * x));
	}

	Math.clamp = function(min, max, x) {
		return Math.min(max, Math.max(min, x));
	}

	
	
	//preload is an HTML Div that holds all the resources for the game
	//it forces the browser to load them at the beginning
	//rather than mid game
	var preload= document.getElementById('preload');
	var totalAssets= 0;

	///////////////////
	// each individual image is loaded through this function
	///////////////////

	global.images= {};

	var imagesLoaded= 0;

	function loadImages(filenames, tracker) {

		if (!filenames.length) return Promise.resolve();

		else return new Promise( function(resolve, reject) {

			//ansynchornize all the things!
			async function loadImage(filename, index, onLoad) {
				
				var newImg = document.createElement('img');

				newImg.src = 'graphics/'+ filename + '.png';

				function loaded() {

					var newCanvas = document.createElement('canvas');
					newCanvas.width = this.width;
					newCanvas.height = this.height;
					newCanvas.getContext('2d').drawImage(this, 0, 0);

					preload.appendChild(newCanvas);

					//store a reference to the canvas
					global.images[filename] = newCanvas;

					tracker.imagesLoaded++;
					updateLoadingBar(tracker);

					if (onLoad) onLoad(index + 1);

					//resolve the Promise once all the images are loaded
					if (tracker.imagesLoaded >= tracker.numImages) resolve();

					this.removeEventListener('load', loaded);

				}

				newImg.addEventListener('load', loaded);
			}

			for (var i = 0, l = filenames.length; i < l; i++) {

				loadImage(filenames[i]);
			}
		});
	}


	global.sprites= {};

	//////////////////////////////////////////////////////////
	// each individual sound is loaded through this function
	//////////////////////////////////////////////////////////

	global.sounds= {};

	var soundsLoaded= 0;

	function loadSounds(filenames, tracker) {

		if (!filenames.length) return Promise.resolve();

		else return new Promise( function(resolve, reject) {
				
			var fileType= '.ogg';

			//check browser compatibility for audio files
			var a= document.createElement('audio');
		
			//check if it can play ogg-vorbis
			if ( !(a.canPlayType && a.canPlayType('audio/ogg; codecs=vorbis').replace('/no/', '')) ) {

				fileType= '.wav';
			}

			//define stand-alone function to retry load if there is an error
			async function loadSound(filename, index, onLoad) {

				var newSound = new Audio('audio/' + filename + fileType);

				newSound.preload = 'auto';

				//load web audio version
				
				fetch('audio/' + filename + fileType)
					.then( (response)    => response.arrayBuffer() )
					.then( (arrayBuffer) => global.audioContext.decodeAudioData(arrayBuffer) )
					.then( (audioBuffer) => global.audioManager.webAudio[filename] = audioBuffer );
				

				console.log("Loading " + filename);

				function loaded() {

					tracker.soundsLoaded++;
					updateLoadingBar(tracker);

					//always create duplicates of sound for overlaying
					//global.audioManager.copy(filename);
					//global.audioManager.copy(filename);

					console.log(filename + " loaded!");

					if (onLoad) onLoad(index + 1);

					//resolve the Promise once all sounds are loaded
					if (tracker.soundsLoaded >= tracker.numSounds) resolve();

					this.removeEventListener('canplaythrough', loaded);
				}

				newSound.addEventListener('canplaythrough', loaded);

				//retry on error
				newSound.addEventListener('error', function error(event) {

					console.error("Could not load sound:", event.target.src);
					//loadSound(filename);
					this.removeEventListener('error', error);
					this.removeEventListener('canplaythrough', loaded);
				})

				preload.appendChild(newSound);

				//add sound to audioManager;
				global.audioManager.sounds[filename] = [newSound];

				//global.audioManager.copy(filename);
				//global.audioManager.copy(filename);
			}

			for (var i = 0, l = filenames.length; i < l; i++) {

				loadSound(filenames[i]);				
			}

		});

	}



	//////////////////////////////
	// This function takes an list of scripts and loads them all consecutively via a recursive function
	//////////////////////////////

	var scriptsLoaded= 0;

	function loadScripts(scripts, tracker) {

		if (!scripts.length) return false;

		for (var index = tracker.scriptsRun; index < tracker.numScripts; index++) {

			if (window['run_'+ scripts[index]]) {

				window['run_'+ scripts[index]](global);

				tracker.scriptsLoaded++;
				tracker.scriptsRun++;
				updateLoadingBar(tracker);
			}
		}

		return true;
	}

	////////////////////////////////////////////////////////////////////////////


	//creates a lists of assets that must be loaded before the level.
	//should only be used on old levels that don't have this data baked in
	function createAssetList(levelData) {

		var assets = [];

		for (var y = 0, height = levelData.level.length; y < height; y++) {

			var row = levelData.level[y];

			for (var x = 0, width = row.length; x < width; x++) {

				var cell = row[x];

				if (cell.note && !assets.includes(cell.note)) assets.push(cell.note);

				if (cell.twoTone) {

					if (!assets.includes(cell.twoTone[0])) assets.push(cell.twoTone[0]);
					if (!assets.includes(cell.twoTone[1])) assets.push(cell.twoTone[1]);
				}

				if (cell.obstacle) {

					if (cell.obstacle.slice(-4) === "Gate" && !assets.includes("gate")) assets.push("gate");
					else if (!assets.includes("obstacle")) assets.push("obstacle");
				}

				if (cell.wormhole && !assets.includes("wormhole")) assets.push("wormhole");

				if (cell.button && !assets.includes("button")) assets.push("button");
			}
		}

		return assets;
	}

	global.createAssetList = createAssetList;

	//loadAssets takes a list of assets. It makes sure the images and sounds load first
	//then it loads the scripts and executes them.
	async function loadAssets(assets) {

		if (assets.loading) return assets.loading;

		//empty value to store promise resolver function
		var loadingComplete = null;
		assets.loading = new Promise((resolve) => {loadingComplete = resolve});

		assets.images= assets.images || [];
		assets.sounds= assets.sounds || [];
		assets.scripts= assets.scripts || [];
		
		var tracker = {
			numImages: assets.images.length,
			numSounds: assets.sounds.length,
			numScripts: assets.scripts.length,

			imagesLoaded: 0, soundsLoaded: 0, scriptsLoaded: 0, scriptsRun: 0
		}

		tracker.totalAssets= tracker.numImages + tracker.numSounds + tracker.numScripts * 2;

		//await Promise.all( [loadImages(assets.images, tracker), loadSounds(assets.sounds, tracker)] );
		await loadImages(assets.images, tracker);
		await loadSounds(assets.sounds, tracker);

		//console.log('loading asset:', Object.keys(global.assetPackages).find(key => global.assetPackages[key] === assets))

		/*await*/ loadScripts(assets.scripts, tracker);

		if (assets.onLoad) assets.onLoad();

		assets.loaded = true;

		//resolve the promise
		loadingComplete();
		
		/*
		function retry() {

			if (tracker.imagesLoaded == tracker.numImages && tracker.soundsLoaded == tracker.numSounds) {
				
				loadScripts(assets.scripts, tracker);
				startup = false;

				/*
				//undo hack to load sound in Cocoon
				for (var sound in global.sounds) {
					global.sounds[sound].pause();
					global.sounds[sound].currentTime=0;
					global.sounds[sound].volume= 1;
				}
				
			}
			else {
				setTimeout(retry, 100);
			}
		}

		retry();
		*/
	}

	global.loadAssets = loadAssets;

	function updateLoadingBar(tracker) {

		//only update loading bar on the first load
		if (!document.getElementById('loading') || parseInt(localStorage.Sol_midsession)) return;

		var progress= (tracker.imagesLoaded + tracker.soundsLoaded + tracker.scriptsLoaded + tracker.scriptsRun) / tracker.totalAssets;

		var bar= document.getElementById('sol');
		var base= document.getElementById('solBase');
		var loadingText= document.getElementById('loadingText');

		var width= window.innerWidth;
		var height= window.innerHeight;

		global.canvas.width= width;
		global.canvas.height= height;

		global.context.clearRect(0, 0, width, height);
		global.context.fillStyle= global.backgroundColor;
		global.context.fillRect(0, 0, width, height);

		global.context.drawImage(loadingText, width/2 - loadingText.width/2, height/2 - loadingText.height);
		global.context.drawImage(base, width/2 - base.width/4, height/2, base.width/2, base.height/2);

		var progressWidth= bar.width * progress;
		var offset= base.width - progressWidth;

		global.context.drawImage(bar, width/2 - (bar.width - offset)/4, height/2 + offset/4, progressWidth/2, progressWidth/2);
	}


	//execute loading functions
	//var packages = document.getElementById('assetPackages') || document.createElement("script");
	//if (!packages.src.length) packages.src = "scripts/assetPackages.js";

	if (global.assetPackages) {

		loadAssets(global.assetPackages.init);
	}
	else {
		
		packages.addEventListener('load', function loaded() { 
			loadAssets(global.assetPackages.init);
			this.removeEventListener('load', loaded);
		});
	}

	//document.body.appendChild(packages);

	/*
	loadAssets({
		
		images: [

			'_do',
			'_doBase',
			'mi',
			'miBase',
			'fa',
			'faBase',
			'fi',
			'fiBase',
			'sol',
			'solBase',
			'do',
			'doBase',
			'startup',
			'startdown',
			'startleft',
			'startright',
			'portalBase',
			'portalSheet',
			'obstacleSheet',
			'horGateSheet',
			'vertGateSheet',
			'backGateSheet',
			'forGateSheet',
			'ballSheet',
			'button_off',
			'button_on',
			'button_0',
			'button_1',
			'button_2',
			'button_3',
			'button_5',
			'button_6',
			'button_7',
			'button_8',
			'title',
			"replay",
			'splashScreen',
			'replaySheet',
			'cancelSheet',
			'tutorial_1',
			'tutorial_2',
			'endScreen'
		],

		sounds: [

			'_do',
			'mi',
			'fa',
			'fi',
			'sol',
			'do',
			'titleSound',
			'level_in',
			'level_in_slow',
			'level_out',
			'button_0',
			'button_1',
			'latch_0',
			'latch_1',
			'turn',
			'gate_0',
			'gate_1',
			'gate_2',
			'gate_3'
		],

		scripts: [

			'resize',
			'viewport',
			'AudioGroup',
			'SpriteAnimation',
			'gui',
			'screen',
			'levels',
			'credits',
			
			'ball',
			'note',
			'twoTone',
			'obstacle',
			'gate',
			'start',
			'wormhole',
			'button',
			
			'toolbar',
			'sidebars',
			'levelSelect',
			'undo',
			'level',
			'input',
			'main'

		]
	});
	*/

	//global.sounds.turn.loop= true;

})(Sol);