(function(global) {

	var context = global.context;
	var viewport = global.guiViewport;
	
	var noteOrder = ["_do", "mi", "fa", "fi", "sol", "do"];
	
	//////////////////////////////////////////////////////
	// left-hand sidebar for Notes
	//////////////////////////////////////////////////////
	function NoteBar(options) {

		options = options || {};

		this.xy = options.xy || [0, 0];
		this.size = options.size || [0, 0];

		this.bounds = new global.Rectangle(this.xy.slice(), this.size);

		this.positions = [-200, 0]
		this.visible = false;

		this.slideDirection = 0;
		this.slideProgress = 0;

		this.notes = [];

		this.unlocked = [];

		this.uiElements = [];

		this.attachPoints = [];

		for (var i = 0, l = global.unlockedNotes.length; i < l; i++) this.add(global.unlockedNotes[i]);
	}

	NoteBar.prototype.add = function(note) {

		if (this.unlocked.includes(note)) return false;
		else this.unlocked.push(note);

		var ui = new global.Rectangle(0, 0, 100, 100);

		var newNote = new global.Note({xy: ui.xy, size: ui.size, viewport: global.guiViewport, solfege: note});

		var insertionPoint = 0;

		for (var i = 0, l = noteOrder.length; i < l; i++) {

			if (insertionPoint >= this.notes.length) {
				//we've reached the end of our list
				this.notes.push(newNote);
				this.uiElements.push(ui);
				break;
			}

			if (noteOrder[i] === this.notes[insertionPoint].solfege) {
				//this note is later in the note order
				insertionPoint++;
				continue;
			}

			if (noteOrder[i] === note) {
				//we've found it's spot
				this.notes.splice(insertionPoint, 0, newNote);
				this.uiElements.splice(insertionPoint, 0, ui);
				break;
			}
		}

		//readjust attach points
		for (var i = 0, l = this.notes.length; i < l; i++) {

			var x = this.notes[i].size[0];
			var y = (i + 1) * this.size[1] / (l + 1);

			this.attachPoints[i] = [x - this.notes[i].size[0] / 2, y - this.notes[i].size[1] / 2];
		}

		this.update(0);

		return true;
	}

	NoteBar.prototype.draw = function(dt) { 

		//debug border
		/*
		var scale = canvas.scale;
		var x = (this.xy[0] - viewport.xy[0]) * scale + viewport.canvasPos[0] * scale;
		var y = (this.xy[1] - viewport.xy[1]) * scale + viewport.canvasPos[1] * scale;

		context.strokeRect(x, y, this.size[0] * scale, this.size[1] * scale);
		
		x = (this.bounds.xy[0] - viewport.xy[0]) * scale;
		y = (this.bounds.xy[1] - viewport.xy[1]) * scale;

		context.strokeRect(x, y, this.bounds.size[0] * scale, this.bounds.size[1] * scale);
		*/

		for (var i = 0, l = this.notes.length; i < l; i++) {
			this.notes[i].draw(dt);
		}
	}

	NoteBar.prototype.update = function(dt) {

		var slideSpeed = 2;

		this.slideProgress += this.slideDirection * slideSpeed * dt;

		if (this.slideDirection && (this.slideProgress >= 1 || this.slideProgress <= 0)) {
			this.slideDirection = 0;
			this.slideProgress = Math.clamp(0, 1, this.slideProgress);
		}

		this.xy[0] = Math.smoothStep(this.positions[0], this.positions[1], this.slideProgress);

		//update position of notes
		for (var i = 0, l = this.notes.length; i < l; i++) {

			this.notes[i].xy[0] = this.xy[0] + this.attachPoints[i][0];
			this.notes[i].xy[1] = this.xy[1] + this.attachPoints[i][1];

			//sync position of animation
			this.notes[i].animation.X = this.notes[i].xy[0];
			this.notes[i].animation.Y = this.notes[i].xy[1];
		}
	}

	NoteBar.prototype.checkUnlock = function(note) {

		if (noteOrder.includes(note) && this.add(note)) {

			global.unlockedNotes.push(note);

			localStorage.Sol_unlocked = JSON.stringify(global.unlockedNotes);
		}
	}

	NoteBar.prototype.onClick = function(point) {

		for (var i = 0, l = this.uiElements.length; i < l; i++) {

			if (this.uiElements[i].contains(point)) {
				this.notes[i].onClick();
				return true;
			}
		}
	}

	NoteBar.prototype.onMouseMove = function(point) {

		if (!this.visible && point[0] < this.bounds.xy[0] + this.bounds.size[0]) {
			this.slideDirection = 1;
			this.visible = true;
		}

		if (this.visible && point[0] > this.bounds.xy[0] + this.bounds.size[0]) {
			this.slideDirection = -1;
			this.visible = false;
		}
	}



	global.noteBar = new NoteBar({xy: [0, 0], size: [300, 900]})


})(Sol);