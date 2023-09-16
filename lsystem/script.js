// Global variables
let lsystem;
let turtle;
let axiom;
let currentStr;

let context;
let initialState;

class LSystem {
    generate(str) {
	let newStr = "";
	for (let i = 0; i < str.length; i++) {
	    if (str[i] in this.rules) {
		newStr += this.rules[str[i]];
	    } else {
		newStr += str[i];
	    }
	}
	return newStr;
    }

    // Parse rules string to dictionary
    parseRules(str) {
	let dict = {};
	rules = str.split("\n")
	
	for (let i = 0; i < rules.length; i++) {
	    let rule = rules[i].split(":");
	    dict[rule[0]] = rule[1];
	}
	this.rules = dict;
    }
}

class TurtleState {
    constructor(x, y, heading, lineWidth, lineLength, angleIncrement) {
	this.x = x;
	this.y = y;
	this.heading = heading;
	this.lineWidth = lineWidth;
	this.lineLength = lineLength;
	this.angleIncrement = angleIncrement;
    }
}

class Turtle {
    constructor(context, initialState, originX, originY) {
	this.context = context;
	this.state = initialState;
	this.stateStack = [];
	this.originX = originX;
	this.originY = originY;
    }

    draw(str) {
	for (let i in str) {
	    let c = str[i];
	    switch(c) {
	    case "F":
		this.stepDraw();
		break;
	    case "f":
		this.step();
		break;
	    case "+":
		this.turnLeft();
		break;
	    case "-":
		this.turnRight();
		break;
	    case "[":
		this.pushState();
		break;
	    case "]":
		this.popState();
		break;
	    default:
		break;
	    }
	}
    }

    step() {
	let rad = Math.PI * this.state.heading / 180;
	this.state.x += this.state.lineLength * Math.cos(rad);
	this.state.y += this.state.lineLength * Math.sin(rad);
    }

    stepDraw() {
	this.context.beginPath();
	this.context.moveTo(this.state.x + this.originX, this.state.y + this.originY);
	this.context.lineWidth = this.state.lineWidth;
	this.step();
	this.context.lineTo(this.state.x + this.originX, this.state.y + this.originY);
	this.context.stroke();
    }

    turnLeft() {this.state.heading -= this.state.angleIncrement}
    turnRight() {this.state.heading += this.state.angleIncrement}
    pushState() {
	let copy = new TurtleState(
	    this.state.x,
	    this.state.y,
	    this.state.heading,
	    this.state.lineWidth,
	    this.state.lineLength,
	    this.state.angleIncrement);
	this.stateStack.push(copy);
    }
    popState() {
	this.state = this.stateStack.pop();
    }
}

function draw() {
    // Get context
    let context = document.getElementById("canvas").getContext("2d");
        
    // Get settings

    // L-System
    axiom = document.getElementById("axiom").value;
    iterations = parseInt(document.getElementById("iterations").value);
    rules = document.getElementById("rules").value;
    

    // Turtle
    heading = parseFloat(document.getElementById("heading").value);
    x = parseFloat(document.getElementById("x").value);
    y = parseFloat(document.getElementById("y").value);
    lineWidth = parseFloat(document.getElementById("lineWidth").value);
    lineLength = parseFloat(document.getElementById("lineLength").value);
    angleIncrement = parseFloat(document.getElementById("angleIncrement").value);
    lineColor = document.getElementById("lineColor").value;
    context.strokeStyle = lineColor;

    // Set up L-System
    lsystem = new LSystem();
    lsystem.parseRules(rules);
    currentStr = axiom;

    // Iterate
    for (let i = 0; i < iterations; i++) {
	currentStr = lsystem.generate(currentStr);
    }

    // Draw
    context.clearRect(0, 0, 600, 600);
    initialState = new TurtleState(x, y, heading, lineWidth, lineLength, angleIncrement);
    turtle = new Turtle(context, initialState, 300, 300);
    turtle.draw(currentStr);
}

// Set default settings
window.onload = function() {

    // L-System
    axiom = "F";
    iterations = 4;
    rules = "F:FF-[-F+F+F]+[+F-F-F]"

    // Turtle
    heading = -90;
    x = 0;
    y = 300;
    lineWidth = 1.5;
    lineLength = 10;
    angleIncrement = 22.5;
    lineColor = "green";

    // Set default settings
    document.getElementById("axiom").value = axiom;
    document.getElementById("iterations").value = iterations;
    document.getElementById("rules").value = rules;
    document.getElementById("heading").value = heading;
    document.getElementById("x").value = x;
    document.getElementById("y").value = y;
    document.getElementById("lineWidth").value = lineWidth;
    document.getElementById("lineLength").value = lineLength;
    document.getElementById("angleIncrement").value = angleIncrement;
    document.getElementById("lineColor").value = lineColor;

    // Draw
    draw();
}
