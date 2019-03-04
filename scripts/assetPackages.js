///////////////////////////////////////////////
// AssetPackages
//////////////////////////////////////////////

(function(global) {

	packages = {

		init: {

			sounds: [
				
				'latch_0',
				'latch_1',
				'turn',
				'gate_0',
				'gate_1',
				'gate_2',
				'gate_3'
			],

			images: [		
				
				'obstacleSheet',
				'horGateSheet',
				'vertGateSheet',
				'backGateSheet',
				'forGateSheet',
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
				
				'twoTone',
				'obstacle',
				'gate',
				
				'toolbar',
				'sidebars',
				'levelSelect',
				'undo',
				'input',
				'main'

			]
		},

		title: {

			sounds:  ['titleSound',	'level_in',	'level_in_slow', 'level_out'],
			images:  ['title', 'startup', 'startdown', 'startleft', 'startright', 'ballSheet'],
			scripts: ['ball', 'note', 'start', 'level']
		},

		wormhole: {

			sounds:  [],
			images:  ['portalBase', 'portalSheet'],
			scripts: ['wormhole']

		},

		button: {

			sounds:  ['button_0', 'button_1'],
			images:  ['button_off', 'button_on', 'button_0', 'button_1', 'button_2', 'button_3', 'button_5', 'button_6', 'button_7', 'button_8'],
			scripts: ['button']
		},

		_do: {

			sounds:  ['_do'],
			images:  ['_do', '_doBase'],
			scripts: [],

			onLoad: function() {
				if (global.Note) {
					global.sprites._do = new global.SpriteSheet(global.images._do)
					global.sprites._do.createEvenFrames(320, 320);
				}
				else global.sprites._do = {};
			}
		},

		mi: {

			sounds:  ['mi'],
			images:  ['mi', 'miBase'],
			scripts: [],

			onLoad: function() {
				if (global.Note) {
					global.sprites.mi = new global.SpriteSheet(global.images.mi)
					global.sprites.mi.createEvenFrames(320, 320);
				}
				else global.sprites.mi = {};
			}
		},

		fa: {

			sounds:  ['fa'],
			images:  ['fa', 'faBase'],
			scripts: [],

			onLoad: function() {
				if (global.Note) {
					global.sprites.fa = new global.SpriteSheet(global.images.fa)
					global.sprites.fa.createEvenFrames(320, 320);
				}
				else global.sprites.fa = {};
			}
		},

		fi: {

			sounds:  ['fi'],
			images:  ['fi', 'fiBase'],
			scripts: [],

			onLoad: function() {
				if (global.Note) {
					global.sprites.fi = new global.SpriteSheet(global.images.fi)
					global.sprites.fi.createEvenFrames(320, 320);
				}
				else global.sprites.fi = {};
			}
		},

		sol: {

			sounds:  ['sol'],
			images:  ['sol', 'solBase'],
			scripts: [],

			onLoad: function() {
				if (global.Note) {
					global.sprites.sol = new global.SpriteSheet(global.images.sol)
					global.sprites.sol.createEvenFrames(320, 320);
				}
				else global.sprites.sol = {};
			}
		},

		do: {

			sounds:  ['do'],
			images:  ['do', 'doBase'],
			scripts: [],

			onLoad: function() {
				if (global.Note) {
					global.sprites.do = new global.SpriteSheet(global.images.do)
					global.sprites.do.createEvenFrames(320, 320);
				}
				else global.sprites.do = {};
			}
		}
	}



	global.assetPackages = packages;

})(Sol);