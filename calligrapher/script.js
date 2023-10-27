let canvas;
let ctx;
let toolCanvas;
let toolCtx;

let strokes = [];

const drawStates = {
    START_POINT: 0,
    START_CONTROL_POINT: 1,
    END_POINT: 2,
    END_CONTROL_POINT: 3
}

class DrawTool {
    constructor() {
	this.state = drawStates.START_POINT;
	this.startPoint = null;
	this.startControlPoint = null;
	this.endPoint = null;
	this.endControlPoint = null;

	this.currentAngle = -30;
	this.currentWidth = 40;

	this.currentPosition = null;
    }

    nextState() {
	this.state = (this.state + 1) % 4;
    }

    updatePosition(position) {
	this.currentPosition = position;
    }

    use(position) {

    }

    draw(ctx) {
	ctx.clearRect(0, 0, toolCanvas.width, toolCanvas.height);
	if (this.state == drawStates.START_POINT) {
	    // Draw broad edge
	    let broadedge = getBroadEdge(this.currentWidth, this.currentPosition.x, this.currentPosition.y, this.currentAngle);
	    ctx.beginPath();
	    ctx.moveTo(broadedge[0], broadedge[1]);
	    ctx.lineTo(broadedge[2], broadedge[3]);
	    ctx.stroke();
	} else if (this.state == drawStates.START_CONTROL_POINT) {
	    // Draw broad edge
	    let broadedge = getBroadEdge(this.currentWidth, this.currentPosition.x, this.currentPosition.y, this.currentAngle);
	    ctx.beginPath();
	    ctx.moveTo(broadedge[0], broadedge[1]);
	    ctx.lineTo(broadedge[2], broadedge[3]);
	    ctx.stroke();

	    // Draw line from start point to control point
	    ctx.beginPath();
	    ctx.moveTo(this.startPoint.x, this.startPoint.y);
	    ctx.lineTo(this.currentPosition.x, this.currentPosition.y);
	    ctx.stroke();
	} else if (this.state == drawStates.END_POINT) {
	    // Draw broad edge
	    let broadedge = getBroadEdge(this.currentWidth, this.currentPosition.x, this.currentPosition.y, this.currentAngle);
	    ctx.beginPath();
	    ctx.moveTo(broadedge[0], broadedge[1]);
	    ctx.lineTo(broadedge[2], broadedge[3]);
	    ctx.stroke();

	    // Draw bezier from start point to end point
	    let bezier = new Bezier(this.startPoint, this.currentPosition, this.startControlPoint, this.currentPosition);
	    bezier.draw(ctx);
	} else if (this.state == drawStates.END_CONTROL_POINT) {
	    // Draw start broad edge
	    let broadedge = getBroadEdge(this.currentWidth, this.startPoint.x, this.startPoint.y, this.currentAngle);
	    ctx.beginPath();
	    ctx.moveTo(broadedge[0], broadedge[1]);
	    ctx.lineTo(broadedge[2], broadedge[3]);
	    ctx.stroke();

	    // Draw end broad edge
	    broadedge = getBroadEdge(this.currentWidth, this.endPoint.x, this.endPoint.y, this.currentAngle);
	    ctx.beginPath();
	    ctx.moveTo(broadedge[0], broadedge[1]);
	    ctx.lineTo(broadedge[2], broadedge[3]);
	    ctx.stroke();

	    // Draw bezier from start point to end point
	    let bezier = new Bezier(this.startPoint, this.endPoint, this.startControlPoint, this.currentPosition);
	    bezier.draw(ctx);
	}
    }
}
drawTool = new DrawTool();

class SelectTool {
    constructor() {

    }

    updatePosition(pos) {

    }

    use() {

    }

    draw() {

    }
}
selectTool = new SelectTool();


class Point {
    constructor(x, y) {
	this.x = x;
	this.y = y;
    }
}

class Bezier {
    constructor(start, end, startControlPoint, endControlPoint) {
	this.start = start;
	this.startControlPoint = startControlPoint;
	this.end = end;
	this.endControlPoint = endControlPoint;
    }

    getPoint(t) {
	let x = (1-t)*(1-t)*(1-t) * this.start.x + 3 * (1-t)*(1-t)*t * this.startControlPoint.x + 3 * (1-t)*t*t * this.endControlPoint.x + t*t*t * this.end.x;
	let y = (1-t)*(1-t)*(1-t) * this.start.y + 3 * (1-t)*(1-t)*t * this.startControlPoint.y + 3 * (1-t)*t*t * this.endControlPoint.y + t*t*t * this.end.y;
	return new Point(x, y);
    }

    getResolution(t) {
	
	let dx = 3 * (1-t)*(1-t) * (this.startControlPoint.x - this.start.x) + 6 * (1-t)*t * (this.endControlPoint.x - this.startControlPoint.x) + 3 * t*t * (this.end.x - this.endControlPoint.x);
	let dy = 3 * (1-t)*(1-t) * (this.startControlPoint.y - this.start.y) + 6 * (1-t)*t * (this.endControlPoint.y - this.startControlPoint.y) + 3 * t*t * (this.end.y - this.endControlPoint.y);

	let ddx = 6 * (1-t) * (this.endControlPoint.x - 2 * this.startControlPoint.x + this.start.x) + 6 * t * (this.end.x - 2 * this.endControlPoint.x + this.startControlPoint.x);
	let ddy = 6 * (1-t) * (this.endControlPoint.y - 2 * this.startControlPoint.y + this.start.y) + 6 * t * (this.end.y - 2 * this.endControlPoint.y + this.startControlPoint.y);

	let denominator = dx*dx + dy*dy;
	
	if (denominator <= 0.1) {
	    return 0;
	}
	
	let curvature = (Math.abs((dx * ddy - dy * ddx) / Math.pow(denominator, 1.5)));
	console.log(curvature);
	console.log(dx);
	console.log(dy);
	return curvature;
    }

    draw(ctx) {
	ctx.beginPath();
	ctx.moveTo(this.start.x, this.start.y);
	ctx.bezierCurveTo(this.startControlPoint.x, this.startControlPoint.y, this.endControlPoint.x, this.endControlPoint.y, this.end.x, this.end.y);
	ctx.stroke();

	// Draw a red dot half way
	let mid = this.getPoint(0.5);
	ctx.beginPath();
	for (let t = 0; t <= 1; t += 0.1) {
	    let curvature = this.getCurvature(t);

	    // Draw a dot with color based on curvature
	    let color = Math.floor(255 * curvature);
	    ctx.fillStyle = "rgb(" + color + ", 0, 0)";
	    let point = this.getPoint(t);
	    ctx.fillRect(point.x, point.y, 10, 10);
	}
    }
}

class Stroke {
    constructor(bezier, angleSpline, widthSpline) {
	this.bezier = bezier;
	this.angleSpline = angleSpline;
	this.widthSpline = widthSpline;
    }
}

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    toolCanvas = document.getElementById("tool-canvas");
    toolCtx = toolCanvas.getContext("2d");
    
    canvas.addEventListener("mouseenter", captureCursor);
    canvas.addEventListener("mouseleave", uncaptureCursor);
    canvas.addEventListener("mousedown", toolDown);
    canvas.addEventListener("mouseup", toolUp);
}

function getBroadEdge(width, x, y, angle) {
    let angleWidth = Math.cos(angle * Math.PI / 180) * width;
    let angleHeight = Math.sin(angle * Math.PI / 180) * width;

    let x0 = x - angleWidth / 2;
    let x1 = x + angleWidth / 2;
    let y0 = y - angleHeight / 2;
    let y1 = y + angleHeight / 2;

    return [x0, y0, x1, y1];
}

function captureCursor(event) {
    let x = event.clientX;

    let relative = x - canvas.offsetLeft;

    canvas.addEventListener("mousemove", followMouse);
}

function getTool() {
    tools = document.getElementsByName('tool')
    for (let i = 0; i < tools.length; i++) {
	if (tools[i].checked) {
	    if (tools[i].value == "draw") {
		return drawTool;
	    } else if (tools[i].value == "select") {
		return selectTool;
	    }
	}
    }
}

function updateTool() {
    tool = getTool();
    if (tool == "draw") {
    } else if (tool == "select") {
    }
	
}

function followMouse(event) {
    
    let x = event.clientX;
    let y = event.clientY;

    let relX = x - canvas.offsetLeft;
    let relY = y - canvas.offsetTop;

    let tool = getTool();

    tool.updatePosition(new Point(relX, relY));

    tool.draw(toolCtx);
    
}

function uncaptureCursor() {
    canvas.removeEventListener("mousemove", followMouse);
}

function toolDown(event) {
    let x = event.clientX;
    let y = event.clientY;

    let relX = x - canvas.offsetLeft;
    let relY = y - canvas.offsetTop;

    let tool = getTool();
    console.log(tool);

    let point = new Point(relX, relY);
    if (tool == drawTool) {
	if (drawTool.state == drawStates.START_POINT)
	    drawTool.startPoint = point;
	else if (drawTool.state == drawStates.END_POINT)
	    drawTool.endPoint = point;
	drawTool.nextState();

	console.log(drawTool.state);
    }
    	
}

function toolUp(event) {
    let x = event.clientX;
    let y = event.clientY;

    let relX = x - canvas.offsetLeft;
    let relY = y - canvas.offsetTop;

    point = new Point(relX, relY);

    let tool = getTool();
    if (tool == drawTool) {
	if (drawTool.state == drawStates.START_CONTROL_POINT) {
	    drawTool.startControlPoint = point;
	} else if (drawTool.state == drawStates.END_CONTROL_POINT) {
	    drawTool.endControlPoint = point;

	    let stroke = new Stroke(
		new Bezier(drawTool.startPoint,
			   drawTool.endPoint,
			   drawTool.startControlPoint,
			   drawTool.endControlPoint),
		null, null);
	    strokes.push(stroke);

	    
	    
	    drawTool.startPoint = null;
	    drawTool.endPoint = null;
	    drawTool.startControlPoint = null;
	    drawTool.endControlPoint = null;
	}
	drawTool.nextState();
	drawTool.draw(toolCtx);
	drawStrokes();
    }
}

function drawStrokes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < strokes.length; i++) {
	strokes[i].bezier.draw(ctx);
    }
    
}


