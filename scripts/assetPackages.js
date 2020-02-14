///////////////////////////////////////////////
// AssetPackages
//////////////////////////////////////////////

(function(global) {

	packages = {

		init: {

			sounds: [],

			images: ['splashScreen'],

			scripts: [

				'resize',
				'viewport',
				'AudioManager',
				'AudioGroup',
				'SpriteAnimation',
				'gui',
				'screen',
				'levels',
				
				'input',
				'main'

			]
		},

		title: {

			sounds:  ['titleSound',	'level_in',	'level_in_slow', 'level_out'],
			images:  ['title', 'startup', 'startdown', 'startleft', 'startright', 'ballSheet'],
			scripts: ['ball', 'note', 'twoTone','start', 'level','undo',]
		},

		credits: {

			sounds:  [],
			images:  ['endScreen'],
			scripts: ['credits']
		},

		tutorial: {

			sounds:  [],
			images:  ['tutorial_1', 'tutorial_2'],
			scripts: []

		},

		sidebars: {

			sounds:  [],
			images:  ['undoSheet', 'quarterNote', 'eighthNote', 'dottedNote', 'replaySheet','cancelSheet'],
			scripts: ['toolbar', 'sidebars', 'levelSelect']
		},

		gate: {

			sounds:  ['gate_0', 'gate_1', 'gate_2', 'gate_3', 'gate_4'],
			images:  ['horGateSheet', 'vertGateSheet', 'backGateSheet', 'forGateSheet'],
			scripts: ['gate',]
		},

		obstacle: {

			sounds:  ['latch_0', 'latch_1', 'turn',],
			images:  ['obstacleSheet'],
			scripts: ['obstacle']
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