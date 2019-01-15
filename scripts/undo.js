//undo module
(function loadModule_undo(global) {

	function UndoAction(pos, type) {

		this.pos = pos.slice();
		this.type = type;
	}
	
	function UndoManager(options) {

		options = options || {};

		this.actions = options.actions || [];
		this.level   = options.level   || global.currentLevel;

		this.currentDepth = 0;

	}

	UndoManager.prototype.registerAction = function(pos, type) {

		if (this.currentDepth > 0) {
		
			this.actions.length -= this.currentDepth;
			this.currentDepth = 0;
		}

		this.actions.push(new UndoAction(pos, type));

		//console.log(this.actions.length, "Action Registered:", this.actions[this.actions.length - 1]);
	}

	UndoManager.prototype.undo = function() {

		var action = this.actions.pop();

		if (action) {

			var cell = this.level.grid[action.pos[1]][action.pos[0]];

			for (let i = 0; i < cell.length; i++) {

				if (cell[i].entityType === action.type) cell[i].undo();
			}
		}
	}

	UndoManager.prototype.playAction = function() {

		var index = this.actions.length - this.currentDepth;
		var action = this.actions[index];

		var cell = this.level.grid[pos[1]][pos[0]];

		for (var i = 0; i < cell.length; i++) {

			if (action.type == cell[i].entityType) cell[i].onClick();
		}
	}

	global.UndoManager = UndoManager;

})(Sol);