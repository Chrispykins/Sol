///////////////////////////////////////////////
// AssetPackages
//////////////////////////////////////////////

(function(global) {

	var packages = {};

	packages.init = {

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
	}

	global.assetPackages = packages;
})(Sol);