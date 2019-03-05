function run_sidebars(global) {

	var context = global.context;
	var viewport = global.guiViewport;
	
	var noteOrder = global.noteOrder;


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

			var x = this.notes[i].size[0]  / 2;
			var y = (i + 1) * this.size[1] / (l + 1);

			this.attachPoints[i] = [x - this.notes[i].size[0] / 4, y - this.notes[i].size[1] / 2];
		}

		this.update(0);

		return true;
	}

	NoteBar.prototype.draw = function(dt) { 

		this.update(dt/1000);

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

		if (point[0] > this.bounds.xy[0] + this.bounds.size[0] || point[1] > this.bounds.xy[1] + this.bounds.size[1]) {
			
			if (this.visible) {
				this.slideDirection = -1;
				this.visible = false;
			}
		}
		else if (!this.visible) {

			this.slideDirection = 1;
			this.visible = true;
		}
	}

	// right-hand sidebar for options
	function OptionsBar(options) {

		options = options || {};

		this.xy = options.xy || [0, 0];
		this.size = options.size || [0, 0];

		this.bounds = new global.Rectangle(this.xy.slice(), this.size);

		this.positions = [global.gameDimensions[0] - 200, global.gameDimensions[0]];
		this.visible = false;

		this.slideDirection = 0;

		this.slideProgress = 1;
		
		this.uiElements = {	

			undoButton: {
				gui: new global.Gui({image: global.images.replay, size: [100, 100]}),
				attach: [75, 150],
				opacity: 1
			},

			quarterNote: {
				gui: new global.Gui({image: global.images.replay, size: [100, 100]}),
				attach: [75, 450],
				opacity: 0.3
			},

			dottedNote: {
				gui: new global.Gui({image: global.images.replay, size: [100, 100]}),
				attach: [75, 550],
				opacity: 0.3
			},

			eigthNote: {
				gui: new global.Gui({image: global.images.replay, size: [100, 100]}),
				attach: [75, 650],
				opacity: 1
			}
		}

		var ui = this.uiElements;

		//define onclick events for all buttons
		ui.undoButton.onClick = function() {
			global.currentLevel.undoManager.undo();
		}

		ui.quarterNote.onClick = function() {

			global.gameSpeed = 0.5;

			this.opacity = 1;
			ui.dottedNote.opacity = 0.3;
			ui.eigthNote.opacity = 0.3;
		}

		ui.dottedNote.onClick = function() {

			global.gameSpeed = 0.75;

			this.opacity = 1;
			ui.quarterNote.opacity = 0.3;
			ui.eigthNote.opacity = 0.3;
		}

		ui.eigthNote.onClick = function() {

			global.gameSpeed = 1;

			this.opacity = 1;
			ui.dottedNote.opacity = 0.3;
			ui.quarterNote.opacity = 0.3;
		}
	}

	OptionsBar.prototype.draw = function(dt) { 

		this.update(dt/1000);

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

		var ui = this.uiElements;

		ui.undoButton.gui.draw(dt);

		context.globalAlpha = ui.quarterNote.opacity;
		ui.quarterNote.gui.draw(dt);

		context.globalAlpha = ui.dottedNote.opacity;
		ui.dottedNote.gui.draw(dt);

		context.globalAlpha = ui.eigthNote.opacity;
		ui.eigthNote.gui.draw(dt);

		context.globalAlpha = 1;
	}

	OptionsBar.prototype.update = function(dt) {

		var slideSpeed = 2;

		this.slideProgress += this.slideDirection * slideSpeed * dt;

		if (this.slideDirection && (this.slideProgress >= 1 || this.slideProgress <= 0)) {
			this.slideDirection = 0;
			this.slideProgress = Math.clamp(0, 1, this.slideProgress);
		}

		this.xy[0] = Math.smoothStep(this.positions[0], this.positions[1], this.slideProgress);

		var ui = this.uiElements;

		ui.undoButton.gui.xy[0]  = this.xy[0] + ui.undoButton.attach[0];
		ui.undoButton.gui.xy[1]  = this.xy[1] + ui.undoButton.attach[1];

		ui.quarterNote.gui.xy[0] = this.xy[0] + ui.quarterNote.attach[0];
		ui.quarterNote.gui.xy[1] = this.xy[1] + ui.quarterNote.attach[1];

		ui.dottedNote.gui.xy[0]  = this.xy[0] + ui.dottedNote.attach[0];
		ui.dottedNote.gui.xy[1]  = this.xy[1] + ui.dottedNote.attach[1];

		ui.eigthNote.gui.xy[0]   = this.xy[0] + ui.eigthNote.attach[0];
		ui.eigthNote.gui.xy[1]   = this.xy[1] + ui.eigthNote.attach[1];

	}

	OptionsBar.prototype.onClick = function(point) {

		for (var ui in this.uiElements) {

			if (this.uiElements[ui].gui.contains(point)) {
				this.uiElements[ui].onClick();
				return true;
			}
		}

		return false;
	}

	OptionsBar.prototype.onMouseMove = function(point) {


		if (point[0] < this.bounds.xy[0] || point[1] > this.bounds.xy[1] + this.bounds.size[1]) {
			
			if (this.visible) {
				this.slideDirection = 1;
				this.visible = false;
			}
		}
		else if (!this.visible) {

			this.slideDirection = -1;
			this.visible = true;
		}
	}

	global.NoteBar = NoteBar;
	global.OptionsBar = OptionsBar;

	//global.noteBar = new NoteBar({xy: [0, 0], size: [sideBarWidth, 900]});
	//global.optionsBar = new OptionsBar({xy: [global.gameDimensions[0] - sideBarWidth, 0], size: [sideBarWidth, 900]});


}