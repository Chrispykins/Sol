var editor= document.getElementById('editor');
//editor.addEventListener('click', onClick);

var levelSize= [0, 0];
var selector= '';
var category= '';
var directoryPath= '';
var tableArray= [];
var undoArray= [];
var blinkPhase= false;

function generateTable(width, height) {

	var table= editor;

	//clear the table
	table.innerHTML= '';
	levelData.level= [];

	for(var y=0; y < height; y++) {

		//create visual row in editor
		var newRow= document.createElement('tr');
		newRow.id= 'row_' + y;
		table.appendChild(newRow);

		//create data for row in levelData
		levelData.level[y]= [];

		for (var x=0; x < width; x++) {

			//create visual cell in editor
			var newCell= document.createElement('td');
			var id= (y * width) + x;
			newCell.id= 'cell_' + id;

			newCell.addEventListener('click', onClick);

			newCell.width= '50px';
			newCell.height= '50px';

			newRow.appendChild(newCell);

			//create empty data cell in levelData
			levelData.level[y][x]= {};
		}
	}

	levelSize= [width, height];
	levelData.size= [width, height];

	levelData.number= 0;
	levelData.author= 'Chris';

	tableArray= table.getElementsByTagName('td');
}

function initialize() {

	//measures the length of the directory path to the level editor file for future use
	checkDirectory();

	undoArray.push(JSON.stringify(levelData));
	//warning.innerHTML= undoArray.length;

	generateTable(8, 4);
}

function fill(color) {

	for (var i= 0; i < tableArray.length; i++) {
		squareClicked(tableArray[i], color);
	}
}

function accessOptions() {

	var options= document.getElementById('toolOptions').getElementsByTagName('div');

	for (var div= 0; div < options.length; div++) {

		options[div].className= 'hidden';

		for (var i= 0; i < accessOptions.arguments.length; i++) {
			
			if (options[div].id== accessOptions.arguments[i]) {
				options[div].className= '';
				
				if (options[div].childNodes[1].className== 'imgTable') {
					selectTool(options[div].childNodes[1].childNodes[1].childNodes[0].childNodes[1]);
					changeSelector(options[div].childNodes[1].childNodes[1].childNodes[0].childNodes[1].id);
				}
			}
		}
	}

}

function selectTool(tool) {

	var toolArray= tool.parentNode.parentNode.parentNode.getElementsByTagName('td');

	for (var i= 0; i < toolArray.length; i++) {
		if (toolArray[i].className== 'selected') {
			toolArray[i].className= '';
		}
	}

	tool.className= 'selected';

}

function changeSelector(tool) {
	
	selector= tool;
	warning.innerHTML= '';
}

function changeCategory(tool) {

	category= tool;
	warning.innerHTML= '';
}


function empty(element) {

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	levelData.level[y][x]= {};
		
	for (i= 0; i < element.childNodes.length; i++) {
		element.removeChild(element.childNodes[i]);
		i--;
	}
}

function addNote(element, attribute) {

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	if (levelData.level[y][x].button) {
		warning.innerHTML= "Notes cannot be placed on buttons!";
		return;
	}

	//delete note if same note already exists
	if (levelData.level[y][x].note == attribute) {
		delete levelData.level[y][x].note;
		delete levelData.level[y][x].twoTone;

		var note = element.getElementsByClassName('note')

		element.removeChild(note[0]);
		return;
	}

	//update level data
	levelData.level[y][x].id= id
	levelData.level[y][x].note= attribute;
	levelData.level[y][x].twoTone= null;

	//remove existing notes in the same cell
	var redundant= element.getElementsByClassName('note');
	for (var i= 0, l= redundant.length; i < l; i++) {
		element.removeChild(redundant[i]);
	}

	//add image of new note in the cell
	var div= document.createElement('div');
	div.className= 'note';
	div.height= 50;
	div.width= 50;

	element.appendChild(div);

	var img= document.createElement('img');
	img.src= 'graphics\\' + attribute + '.png';
	//img.className= 'note';
	img.height= 50;
	img.width= 50;

	div.appendChild(img);

}

function addTwoTone(element) {

	var tones= [document.getElementById("tone_1").getElementsByClassName("selected")[0].id.slice(0,-1),
				document.getElementById("tone_0").getElementsByClassName("selected")[0].id.slice(0,-1)]

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	if (levelData.level[y][x].button) {
		warning.innerHTML= "Two Tones cannot be placed on buttons!";
		return;
	}


	//delete twoTone if same twoTone already exists
	if (levelData.level[y][x].twoTone) {
		if (levelData.level[y][x].twoTone[0] == tones[0] && levelData.level[y][x].twoTone[1] == tones[1]) {
			delete levelData.level[y][x].note;
			delete levelData.level[y][x].twoTone;

			var note = element.getElementsByClassName('note');

			element.removeChild(note[0]);
			return;
		}
	}

	//update level data
	levelData.level[y][x].id= id;
	levelData.level[y][x].twoTone= tones;
	levelData.level[y][x].note= null;

	//remove existing notes in the same cell
	var redundant= element.getElementsByClassName('note');
	for (var i= 0, l= redundant.length; i < l; i++) {
		element.removeChild(redundant[i]);
		console.log("removed", redundant[i])
	}

	//add image of new note in the cell
	var div= document.createElement('div');
	div.className= 'note';
	div.height= 50;
	div.width= 50;

	element.appendChild(div);

	var img1= document.createElement('img');
	img1.src= 'graphics\\' + tones[0] + '.png';
	img1.className= 'outerNote';
	img1.height= 50;
	img1.width= 50;

	var img2= document.createElement('img');
	img2.src= 'graphics\\' + tones[1] + '.png';
	img2.className= 'innerNote';
	img2.height= 20;
	img2.width= 20;


	div.appendChild(img1);
	div.appendChild(img2);


}

function addObstacle(element, attribute) {

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	/*if (levelData.level[y][x].button) {
		warning.innerHTML= "Obstacles cannot be placed on buttons!";
		return;
	}*/

	if (levelData.level[y][x].start) {
		warning.innerHTML= "Obstacles cannot be placed on starts!";
		return;
	}

	//delete obstacle if same obstacle already exists
	if (levelData.level[y][x].obstacle == attribute) {
		delete levelData.level[y][x].obstacle;
		delete levelData.level[y][x].gate;

		var obstacle = element.getElementsByClassName('obstacle')

		element.removeChild(obstacle[0]);
		return;
	}

	//update level data
	levelData.level[y][x].id = id;
	levelData.level[y][x].obstacle= attribute;

	//remove existing obstacles
	var redundant= element.getElementsByClassName('obstacle');
	for (var i=0, l= redundant.length; i < l; i++) {
		element.removeChild(redundant[i]);
	}

	//add image of new obstacle in the cell
	var div= document.createElement('div');
	div.className= 'obstacle';
	div.height= 50;
	div.width= 50;

	element.appendChild(div);

	var img= document.createElement('img');
	img.src= 'graphics\\' + attribute + '.png';
	//img.className= 'obstacle';
	img.position= 'absolute';
	img.height= 50;
	img.width= 50;

	div.appendChild(img);
}

function addStart(element, direction) {

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	if (levelData.level[y][x].button) {
		warning.innerHTML= "Starts cannot be placed on buttons!";
		return;
	}

	//delete start if same start already exists
	if (levelData.level[y][x].start == direction) {
		delete levelData.level[y][x].start;

		var start = element.getElementsByClassName('start')

		element.removeChild(start[0]);
		return;
	}

	//remove existing obstacles
	var redundant= element.getElementsByClassName('start');
	for (var i=0, l= redundant.length; i < l; i++) {
		element.removeChild(redundant[i]);
	}

	levelData.level[y][x].id= id;
	levelData.level[y][x].start= direction;

	var newStart= document.createElement('div');
	newStart.style.position= 'relative';
	newStart.style.top= '-23px';
	newStart.style.width= '0px';
	newStart.style.height= '0px';
	newStart.className= 'start';
	element.appendChild(newStart);

	var img= document.createElement('img');
	img.src= 'graphics\\start'+ direction + '.png';
	img.height= 50;
	img.width= 50;
	newStart.appendChild(img);	
}


function addWormhole(element, side) {

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	if (levelData.level[y][x].button) {
		warning.innerHTML= "Wormholes cannot be placed on buttons!";
		return;
	}
	if (levelData.level[y][x].start) {
		warning.innerHTML= "Obstacles cannot be placed on starts!";
		return;
	}

	//delete wormhole if wormhole end already exists in this cell
	if (levelData.level[y][x].wormhole) {
		delete levelData.level[y][x].wormhole;
		delete levelData['worm'+ side];

		var wormhole = element.getElementsByClassName('wormhole')

		element.removeChild(wormhole[0]);
		return;
	}

	var oldHole= document.getElementById('worm'+ side);
	if (oldHole) {
		//oldStart.parentNode.className= '';

		var oldId= parseInt(oldHole.parentNode.id.slice(5));
		console.log(oldId);
		var oldY= Math.floor(oldId / levelSize[0]);
		var oldX= oldId - (oldY * levelSize[0]);

		oldHole.parentNode.removeChild(oldHole);

		delete levelData.level[oldY][oldX].wormhole;
	}

	levelData.level[y][x].id= id;
	levelData.level[y][x].wormhole= 'worm'+ side;
	levelData['worm'+ side]= [x, y];

	var newHole= document.createElement('div');
	newHole.className= 'wormhole';
	newHole.style.position= 'relative';
	newHole.style.top= '-23px';
	newHole.style.width= '0px';
	newHole.style.height= '0px';
	newHole.id= 'worm'+ side;
	element.appendChild(newHole);

	var img= document.createElement('img');
	img.src= 'graphics\\wormhole.png';
	img.height= 50;
	img.width= 50;
	newHole.appendChild(img);	
}

function addButton(element) {

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	/*if (levelData.level[y][x].obstacle) {
		warning.innerHTML= "Obstacles cannot be placed on obstacles!";
		return;
	}*/

	if (levelData.level[y][x].start) {
		warning.innerHTML= "Obstacles cannot be placed on starts!";
		return;
	}

	//delete button if buton already exists in this cell
	if (levelData.level[y][x].button) {
		delete levelData.level[y][x].button;

		var button = element.getElementsByClassName('button')

		element.removeChild(button[0]);
		return;
	}

	//remove leveData for square
	levelData.level[y][x].id= id;
	levelData.level[y][x].button= [];


	var newButton= document.createElement('div');
	newButton.style.position= 'relative';
	newButton.style.top= '-23px';
	newButton.style.width= '0px';
	newButton.style.height= '0px';
	newButton.id= 'button_' + id;
	newButton.className= "button";
	element.appendChild(newButton);

	var img= document.createElement('img');
	img.src= 'graphics\\button_off.png';
	img.style.zIndex = "999";
	img.height= 50;
	img.width= 50;
	newButton.appendChild(img);

	warning.innerHTML= '';
	
}

function addWire(element, direction) {

	direction= direction[7];

	var id= parseInt(element.id.slice(5));
	var y= Math.floor(id / levelSize[0]);
	var x= id - (y * levelSize[0]);

	if (levelData.level[y][x].button) {
		
		//check if the level data for this cell already contains this wire
		if ( !(levelData.level[y][x].button.some( function(item) { return item == direction; } )) ) {
			
			levelData.level[y][x].button.push(direction);
		
			var newWire= document.createElement('div');
			newWire.style.position= 'relative';
			newWire.style.top= '0px';
			newWire.style.width= '0px';
			newWire.style.height= '0px';
			newWire.id= 'wire_'+ direction +'_'+ id;
			newWire.className= 'button';

			//add new wire image underneath button
			var button = element.getElementsByClassName('button');
			button[0].appendChild(newWire);

			var img= document.createElement('img');
			img.src= 'graphics\\button_'+ direction +'.png';
			img.height= 50;
			img.width= 50;
			newWire.appendChild(img);
		}
		else {
			
			//remove wire if it already exists in this cell
			var button = levelData.level[y][x].button;

			button.splice(button.indexOf(direction), 1);

			var wire = document.getElementById('wire_'+ direction +'_'+ id);

			wire.parentNode.removeChild(wire);
			return;
		}
	}
	else {
		warning.innerHTML= 'Wires must be placed on a button!';
	}
}

function playSolution() {

	var solution= JSON.parse(document.getElementById('solutionCode').value);

	var index= 0;

	var timer= setInterval(function() {

		if (index < solution.length) {
			
			if (solution[index]) {
				console.log(solution[index])
				for (var i= 0, l= solution[index].length; i < l; i++) {
					window[solution[index][i] + 'Sound'].cloneNode().play();
				}
			}

			index++;
		}
		else {
			clearInterval(timer);
		}
	}, 167);
}

function createAssetList() {

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


function exportLevel() {
	
	var warning = document.getElementById('warning');

	if (document.getElementById('levelNumber').value) {
		levelData.number= document.getElementById('levelNumber').value;
	}
	else {
		warning.innerHTML= 'Level requires a number!';
		return;
	}

	if (document.getElementById('levelAuthor').value) {
			levelData.author= document.getElementById('levelAuthor').value;
	}

	if (levelSize[0] && levelSize[1]) {
		levelData.size= [levelSize[0], levelSize[1]];
	}
	else {
		warning.innerHTML= 'Level must have a valid number for both width and height';
		return;
	}

	if (levelData.wormholeStart) {
		var x= levelData.wormholeStart[0];
		var y= levelData.wormholeStart[1];

		if (!levelData.level[y][x].wormhole) {
			levelData.wormholeStart= null;
		}
	}

	if (levelData.wormholeEnd) {
		var x= levelData.wormholeEnd[0];
		var y= levelData.wormholeEnd[1];

		if (!levelData.level[y][x].wormhole) {
			levelData.wormholeEnd= null;
		}
	}

	levelData.assets = createAssetList();

	if (!levelData.wormholeStart != !levelData.wormholeEnd) {
		warning.innerHTML= 'Wormhole incomplete';
		return;
	}

	try {
		levelData.solution= JSON.parse(document.getElementById('solutionCode').value);
	}
	catch(error) {
		warning.innerHTML= 'Solution code must by a valid JSON string!';
		return;
	}

	try {
		levelData.viewportOffset= JSON.parse(document.getElementById('viewportOffset').value);
	}
	catch(error) {
		warning.innerHTML= 'Viewport offset must be a valid array';
		return;
	}
	
	
	warning.innerHTML= ''

	document.getElementById('textarea').value= JSON.stringify(levelData);
	
	document.getElementById('textarea').select();
}

function importLevel(levelJSON) {
	
	if (!levelJSON) {	
		undoArray.push(JSON.stringify(levelData));
		var importData= JSON.parse(document.getElementById('textarea').value);
	}
	else {	
		var importData= JSON.parse(levelJSON);
	}
	
	var warning= document.getElementById('warning').innerHTML= '';

	document.getElementById('levelNumber').value= importData.number; 
	document.getElementById('levelAuthor').value= importData.author;
	document.getElementById('solutionCode').value= JSON.stringify(importData.solution);
	document.getElementById('viewportOffset').value= JSON.stringify(importData.viewportOffset);

	generateTable(importData.size[0], importData.size[1]);

	//loop for adding blocks to level
	for (var i= 0; i < tableArray.length; i++) {
		
		var id= parseInt(tableArray[i].id.slice(5));
		var y= Math.floor(id / levelSize[0]);
		var x= id - (y * levelSize[0]);

		empty(tableArray[i]);

		if (importData.level[y][x].note) {

			addNote(tableArray[i], importData.level[y][x].note);
		}
		if (importData.level[y][x].obstacle) {

			addObstacle(tableArray[i], importData.level[y][x].obstacle);
		}
		if (importData.level[y][x].start) {

			addStart(tableArray[i], importData.level[y][x].start);
		}
		if (importData.level[y][x].wormhole) {

			addWormhole(tableArray[i], importData.level[y][x].wormhole.slice(4));
		}
		if (importData.level[y][x].twoTone) {

			selectTool(document.getElementById(importData.level[y][x].twoTone[0]+"0"));
			selectTool(document.getElementById(importData.level[y][x].twoTone[1]+"1"));

			addTwoTone(tableArray[i]);
		}
		if (importData.level[y][x].button) {

			addButton(tableArray[i]);

			for (var j= 0, l= importData.level[y][x].button.length; j < l; j++) {
				addWire(tableArray[i], "button_" +importData.level[y][x].button[j])
			}
		}

	}

	levelData= importData;
}


//keyboard event handlers
window.addEventListener('keydown', input);

function input(event) {

	var editing= (document.activeElement.tagName== 'BODY');

	switch (event.which) {
		
		case 90:
			if (event.ctrlKey) {
				event.preventDefault();
				undo();
			}
			break;
	}
}

//table onclick event
function onClick(event) {

	undoArray.push(JSON.stringify(levelData));

	//this refers to the table cell that was clicked
	if (selector == 'empty') {
		empty(this);
	}
	else {
		
		if (category == 'notes') {
			
			addNote(this, selector);
		}
		else if (category == 'obstacles') {
			
			addObstacle(this, selector);
		}
		else if (category == 'start') {
			addStart(this, selector);
		}
		else if (category == 'wormholes') {
			addWormhole(this, selector);
		}
		else if (category == 'twoTones') {
			addTwoTone(this);
		}
		else if (category == 'buttons') {
			
			if (selector == 'button') {
				addButton(this);
			}
			else {
				addWire(this, selector)
			}
		}
	}
}

function undo() {

	if (undoArray.length > 1) {
		importLevel(undoArray.pop());
		//warning.innerHTML= undoArray.length;
	}
}

function checkDirectory() {
	directoryPath= document.getElementById('editorScript').src;
 	directoryPath= directoryPath.slice(0, -23);
}

initialize();
document.getElementById('notes').onclick();
