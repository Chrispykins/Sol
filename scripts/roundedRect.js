function run_roundedRect(global) {

//////////////////////////////////////////////////////////////////////////////////////////

//=================================================================
//draws a speech bubble with rounded corners in given canvas context
// parameters:
// @context: 2D rendering context for javascrpt canvas
// @left: 	the x-coordinate of the left side of the rectangle
// @top: 	the y-coordinate of the top side of the rectangle
// @width: 	width of rectangle in pixels. Must be positive.
// @height: height of rectangle in pixels. Must be positive.
// @radius: radius of arcs at corners of rectangle in pixels. Must be positive.
//=================================================================
function roundedRect(context, left, top, width, height, radius) {

	//ensure radius fits with half of the rectangle
	radius = Math.min( Math.min(width, height)/2, radius );

	var right = left + width;
	var bottom = top + height;

	context.beginPath();

	//top line
	context.moveTo(left  + radius, top);
	context.lineTo(right - radius, top);

	//top-right arc
	context.arcTo(right, top, right, top + radius, radius);

	//right line
	context.lineTo(right, bottom - radius);

	//right-bottom arc
	context.arcTo(right, bottom, right - radius, bottom, radius);

	//bottom line
	context.lineTo(left + radius, bottom);

	//bottom-left arc
	context.arcTo(left, bottom, left, bottom - radius, radius);

	//left line
	context.lineTo(left, top + radius);

	//top-left arc
	context.arcTo(left, top, left + radius, top, radius);

}

window.CanvasRenderingContext2D.prototype.roundedRect = function(x, y, width, height, radius) {
	roundedRect(this, x, y, width, height, radius);
}

//not sure if this works, never tested
/*
window.OffscreenCanvasRenderingContext2D.prototype.roundedRect = function(x, y, widht, height, radius) {
	roundedRect(this, x, y, widht, height, radius);
}
*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//=================================================================
//draws a speech bubble with rounded corners in given canvas context
// parameters:
// @context: 2D rendering context for javascrpt canvas
// @left: 	the x-coordinate of the left side of the rectangle
// @top: 	the y-coordinate of the top side of the rectangle
// @width: 	width of rectangle in pixels. Must be positive.
// @height: height of rectangle in pixels. Must be positive.
// @radius: radius of arcs at corners of rectangle in pixels. Must be positive.
// @corner: defaults to 0.
//			0 - bottom-left
//			1 - bottom-right
//			2 - top-right
//			3 - top-left
//=================================================================

//found this by accident when trying to make a rounded rectangle, lol. Needs more testing.
function speechBubble(context, left, top, width, height, radius, corner) {

	corner = corner || 0;

	//ensure radius fits with half of the rectangle
	radius = Math.min( Math.min(width, height)/2, radius );

	var right = left + width;
	var bottom = top + height;

	var flipBottomLeft  = (corner == 0) ? -1 : 1;
	var flipBottomRight = (corner == 1) ? -1 : 1;
	var flipTopRight    = (corner == 2) ? -1 : 1;
	var flipTopLeft     = (corner == 3) ? -1 : 1;
	
	context.beginPath();

	//top line
	context.moveTo(left  + radius, top);
	context.lineTo(right - (radius * flipTopRight), top);

	//top-right arc
	context.arcTo(right, top, right, top + radius, radius);

	//right line
	context.lineTo(right, bottom - radius);

	//right-bottom arc
	context.arcTo(right, bottom, right - (radius * flipBottomRight), bottom, radius);

	//bottom line
	context.lineTo(left + (radius * flipBottomLeft), bottom);

	//bottom-left arc
	context.arcTo(left, bottom, left, bottom - radius, radius);

	//left line
	context.lineTo(left, top + radius);

	//top-left arc
	context.arcTo(left, top, left + (radius * flipTopLeft), top, radius);
	context.closePath();

}

window.CanvasRenderingContext2D.prototype.speechBubble = function(x, y, width, height, radius, corner) {
	speechBubble(this, x, y, width, height, radius, corner);
}

//not sure if this works, never tested
/*
window.OffscreenCanvasRenderingContext2D.prototype.speechBubble = function(x, y, widht, height, radius, corner) {
	speechBubble(this, x, y, widht, height, radius, corner);
}
*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

};