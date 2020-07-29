//undo module
function run_undo(global) {

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
	}

	UndoManager.prototype.undo = function() {

		if (this.level.playing) return;

		var index = this.actions.length - this.currentDepth - 1;
		var action = this.actions[index];

		if (action) {

			var cell = this.level.grid[action.pos[1]][action.pos[0]];

			for (let i = 0; i < cell.length; i++) {

				if (cell[i].entityType === action.type) cell[i].undo();
			}

			this.currentDepth++;

			this.level.save();
		}
	}

	UndoManager.prototype.redo = function() {

		if (this.level.playing) return false;

		if (this.currentDepth > 0) {

			var index = this.actions.length - this.currentDepth;
			var action = this.actions[index];

			if (action) {

				var cell = this.level.grid[action.pos[1]][action.pos[0]];

				for (var i = 0; i < cell.length; i++) {

					if (action.type == cell[i].entityType) cell[i].activate();
				}

				this.currentDepth--;

				this.level.save();

				return true;
			}
		}
		
		return false;
	}

	UndoManager.prototype.getBuffer = function() {

		var data = this.actions.slice();
		data.length = this.actions.length - this.currentDepth;

		return data;
	}

	global.UndoManager = UndoManager;

}