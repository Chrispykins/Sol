///////////////////////////////////////////
// ****************************************
// * Single global DOM variable "Sol"
// * operates as the global namespace to
// * contain the entire game.
// ****************************************
///////////////////////////////////////////

var Sol= {};

///////////////////////////////////////////
// begin loading content
///////////////////////////////////////////

//var Cocoon;

(function (global) { //The Sol variable gets passed here as the global scope
'use strict';

	// initialize global variables
	global.canvas= document.getElementById('canvas');
	global.canvas.screencanvas= true;
	global.context= global.canvas.getContext('2d');
	global.requestAnimationFrame= window.requestAnimationFrame;
	global.Math= Math;
	global.Date= Date;

	//check for localStorage
	if (!localStorage.Sol_progress) {
		localStorage.Sol_progress= '0';
	}

	if (!localStorage.Sol_firstTime) {
		localStorage.Sol_firstTime= 'true';
	}

	//canvas settings
	global.canvas.imageSmoothingEnabled= false;
	
	//shift context by half a pixel for pixel perfect drawing
	global.context.translate(0.5, 0.5)

	//adding distance formula to Math
	Math.distance= function(a, b) {

		var dx = a[0] - b[0];
		var dy = a[1] - b[1];

		dx *= dx;
		dy *= dy;

		return Math.sqrt(dx + dy);
	}

	Math.lerp = function(start, end, progress) {
    
	    return start * (1 - progress) + end * progress;
	}

	//adding smoothStep to Math for animations
	Math.smoothStep= function(start, end, progress) {

		var x = Math.min(1, Math.max(0, progress));
	    return Math.lerp(start, end, x * x * (3 - 2 * x));
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

	function loadImage(filename) {

		//load image into DOM Element
		var newImg= document.createElement('img');

		newImg.src= 'graphics/' + filename + '.png';

		//event listener will update the loading screen
		newImg.addEventListener('load', function loaded() {
			
			//create canvas element, and draw image on canvas for faster drawing
			var newCanvas= document.createElement('canvas');
			newCanvas.width= newImg.width;
			newCanvas.height= newImg.height;
			newCanvas.getContext('2d').drawImage(newImg, 0, 0);

			preload.appendChild(newCanvas);

			//store a reference to the canvas
			global.images[filename]= newCanvas;	

			imagesLoaded++;
			updateLoadingBar();
			this.removeEventListener('load', loaded);
		});

		

	}

	global.sprites= {};

	/////////////
	// each individual sound is loaded through this function
	/////////////

	global.sounds= {};

	var soundsLoaded= 0;

	function loadSound(filename, fileType) {

		var newSound= new Audio('audio/' + filename + fileType);

		/*var newSound= document.createElement('audio');
		newSound.src= filename + fileType;*/
		newSound.preload= "auto";

		newSound.addEventListener('canplaythrough', function loaded() {
			soundsLoaded++;
			updateLoadingBar();

			//hack to load sound in Cocoon
			newSound.volume= 0;
			newSound.play();

			this.removeEventListener('canplaythrough', loaded);
		});

		newSound.addEventListener('error', function error() {

			loadSound(filename, fileType);

			this.removeEventListener('error', error);
		})

		preload.appendChild(newSound);

		global.sounds[filename]= newSound;
		
	}

	//////////////////////////////
	// This function takes an list of scripts and loads them all consecutively via a recursive function
	//////////////////////////////

	var scriptsLoaded= 0;

	function loadScripts(scripts) {

		var numScripts= scripts.length;

		function recurse(count) {

			if (count < numScripts) {

				var newScript= document.createElement('script');
				newScript.type= 'text/javascript';
				newScript.src= 'scripts/' + scripts[count] + '.js';

				newScript.addEventListener('load', function loaded() {

					scriptsLoaded++;

					if (scriptsLoaded < numScripts) {
						updateLoadingBar();
						recurse(count+1);
					}

					this.removeEventListener('load', loaded);
				});

				document.body.appendChild(newScript)
			}
			else {
				return;
			}
		}

		recurse(0);
	}

	//loadingManager makes sure all scripts load after the graphics and sound of the game loads
	//the assets argument is an object that contains three arrays: 'images', 'sounds', and 'scripts'
	//these arrays are lists of the filenames of the assets that will be loaded into the browser.
	function loadingManager(assets) {

		assets.images= assets.images || [];
		assets.sounds= assets.sounds || [];
		assets.scripts= assets.scripts || [];
		
		var numImages= assets.images.length;
		var numSounds= assets.sounds.length;
		var numScripts= assets.scripts.length;

		totalAssets= numImages + numSounds + numScripts;

		var fileType= '.ogg';

		//check browser compatibility for audio files
		var a= document.createElement('audio');
	
		//check if it can play ogg-vorbis
		if ( !(a.canPlayType && a.canPlayType('audio/ogg; codecs=vorbis').replace('/no/', '')) ) {

			fileType= '.wav';
		}
		
		for (i= 0; i < numSounds; i++) {
			loadSound(assets.sounds[i], fileType);
		}

		for (var i= 0; i < numImages; i++) {
			loadImage(assets.images[i]);
		}

		

		function retry() {

			if (imagesLoaded == numImages && soundsLoaded == numSounds) {
				
				loadScripts(assets.scripts);

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
	}

	function updateLoadingBar() {

		var progress= (imagesLoaded + soundsLoaded + scriptsLoaded)/totalAssets;

		var bar= document.getElementById('sol');
		var base= document.getElementById('solBase');
		var loadingText= document.getElementById('loadingText');

		var width= window.innerWidth;
		var height= window.innerHeight;

		global.canvas.width= width;
		global.canvas.height= height;

		global.context.clearRect(0, 0, width, height);
		global.context.fillStyle= '#f6f6e7';
		global.context.fillRect(0, 0, width, height);

		global.context.drawImage(loadingText, width/2 - loadingText.width/2, height/2 - loadingText.height);
		global.context.drawImage(base, width/2 - base.width/4, height/2, base.width/2, base.height/2);

		var progressWidth= bar.width * progress;
		var offset= base.width - progressWidth;

		global.context.drawImage(bar, width/2 - (bar.width - offset)/4, height/2 + offset/4, progressWidth/2, progressWidth/2);
	}


	//execute loading functions
	loadingManager({
		
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
			'toolbar',
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
			'undo',
			'level',
			'input',
			'main'

		]
	});

	global.sounds.turn.loop= true;

})(Sol);