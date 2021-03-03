let canvasContainer = document.querySelector('.canvas__container');
let isMouseDown = false;

// Brush Controls
let inputBrushSize: HTMLInputElement = document.querySelector('#size');
let inputBrushOpacity: HTMLInputElement = document.querySelector('#opacity');

// draw circles when the mouse is moving

const colorPaletteContainer = document.querySelector('.color_palette__container');

let too;

let getRgbaArray = (rgba): Array<any> => {
	return rgba.replace(/[rgba\(\)]/g, '').split(',');
};
class Canvas {
	canvasElement: HTMLCanvasElement;
	mouseX: number;
	mouseY: number;
	brush: BrushShape;
	width: number;
	height: number;
	top: number;
	left: number;
	context: CanvasRenderingContext2D;
	mode: string;
	count: number;
	constructor(width, heigth, container: Element, brush: BrushShape, mode: string) {
		// Element Sizes
		// create Canvas
		this.canvasElement = document.createElement('canvas');
		this.context = this.canvasElement.getContext('2d');
		this.canvasElement.width = width;
		this.canvasElement.height = heigth;
		this.canvasElement.style.position = 'absolute';
		// this.canvasElement.setAttribute('id', 'canvas');
		container.appendChild(this.canvasElement);

		// Drawing mode
		this.mode = mode;

		this.brush = brush;

		// Internal Sizes
		this.top = this.canvasElement.getBoundingClientRect().top;
		this.left = this.canvasElement.getBoundingClientRect().left;
		this.height = heigth;
		this.width = width;

		// Tools Variables
		this.count = 0;
	}
	draw(): void {
		let mousePosX = this.mouseX - this.left - this.brush.brushSize / 2;
		let mousePosY = this.mouseY - this.top - this.brush.brushSize / 2;
		// ctx.fillRect(mouseX, mouseY, 10, 10);

		this.context.beginPath();
		this.context.arc(mousePosX, mousePosY, Math.PI * this.brush.brushSize, 0, Math.PI * 2, false);
		this.context.closePath();
		if (this.mode === 'pen') {
			this.context.fillStyle = this.brush.color;
		} else if (this.mode === 'eraser') {
			this.context.fillStyle = 'rgba(255,255,255,1)';
		}
		this.context.fill();
	}

	drawBrushPreview(): void {
		let mousePosX = this.mouseX - this.left - this.brush.brushSize / 2;
		let mousePosY = this.mouseY - this.top - this.brush.brushSize / 2;
		this.context.globalCompositeOperation = 'source-over';
		this.context.clearRect(0, 0, this.width, this.height);

		this.context.strokeStyle = 'rgb(222,222,222)';
		this.context.beginPath();
		this.context.arc(mousePosX, mousePosY, Math.PI * this.brush.brushSize, 0, Math.PI * 2, false);
		this.context.lineWidth = 3;
		this.context.closePath();
		this.context.stroke();

		this.context.fillStyle = this.brush.color;
		this.context.beginPath();
		this.context.arc(mousePosX, mousePosY, Math.PI * this.brush.brushSize, 0, Math.PI * 2, false);
		this.context.lineWidth = 3;
		this.context.closePath();
		this.context.fill();
	}
	set drawingMode(mode: string) {
		this.mode = mode;
	}
	setMousePosition(x: number, y: number) {
		this.mouseX = x;
		this.mouseY = y;
	}
	getMousePosition() {
		return {
			x: this.mouseX,
			y: this.mouseY
		};
	}
}

class BrushShape {
	// 0: square
	// 1: circle
	// rgb(123,199,194)
	shape: string;
	brushSize: number;
	color: string;
	opacity: number;
	constructor(shape: string, brushSize: number, color: string) {
		this.shape = shape;
		this.brushSize = brushSize;
		this.color = color;
		this.opacity = 1;
	}

	set brushColor(color: string) {
		let rgbPure = getRgbaArray(color);
		console.log(rgbPure.join(','));
		this.color = `rgba(${rgbPure.join(',')})`;
	}
	set brushOpacity(opacity: number) {
		this.opacity = opacity;
	}

	set brushShape(shape: string) {
		this.shape = shape;
	}

	set size(size: number) {
		this.brushSize = size;
	}
	static getBrushShape(): object {
		return BrushShape;
	}
}

// line is made of 1 array of 2 point [Start point | End point]
// When the user click create a point(Start Point).
// then user click again create the End point and then draw the line
class LineTool {
	constructor() {}

	drawLine() {}
}
class Point {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

const brush = new BrushShape('circle', +inputBrushSize.value, 'rgba(0,0,0,1)');
brush.brushColor = 'rgba(0,0,0,1)';

// Drawing Layer
let iCanvas = new Canvas(600, 600, canvasContainer, brush, 'pen');

// Preview Brush Layer
const previewLayer = new Canvas(600, 600, canvasContainer, brush, 'pen');

let toolsButtons = document.querySelectorAll('.tool_btn');
toolsButtons.forEach((btn) => {
	btn.addEventListener('click', (e: Event) => {
		let current = e.currentTarget;
		iCanvas.drawingMode = current.getAttribute('data-tool');
		previewLayer.drawingMode = current.getAttribute('data-tool');
	});
});

function drawOnCanvas(e: MouseEvent) {
	iCanvas.setMousePosition(e.clientX, e.clientY);
	previewLayer.setMousePosition(e.clientX, e.clientY);
	if (isMouseDown) {
		iCanvas.draw();
	}
	previewLayer.drawBrushPreview();
}
let points = [];
let setDrawModeOn = () => {
	// if mouse is down Draw
	points.push(new Point(iCanvas.mouseX - iCanvas.left, iCanvas.mouseY - iCanvas.top));
	isMouseDown = true;
	iCanvas.count += 1;
	if (iCanvas.count === 2) {
		//Draw Line
		console.log(points);
		iCanvas.count = 0;
	}
	iCanvas.draw();
	console.log(iCanvas.context.getImageData(0, 0, iCanvas.width, iCanvas.height));
};

let setDrawModeOff = () => {
	isMouseDown = false;
};
let opacityBrush = 1;
// Events

inputBrushOpacity.addEventListener('change', (e: Event) => {
	let oldBrush = brush.color;
	let newBrushColor = [ ...getRgbaArray(oldBrush) ];
	newBrushColor.pop();
	newBrushColor.push(+e.currentTarget.value);
	brush.brushColor = `rgba${newBrushColor.join(',')}`;
	brush.brushOpacity = +e.currentTarget.value;
});

inputBrushSize.addEventListener('change', (e: Event) => {
	brush.brushSize = +e.currentTarget.value;
});

let generateRandomColor = () => {
	return Math.round(Math.random() * 255);
};

let generateRandomPalete = (nOfColors: number) => {
	for (let i = 0; i < nOfColors; i++) {
		let color = document.createElement('button');

		let rgb = `rgba(${generateRandomColor()},${generateRandomColor()},${generateRandomColor()},1)`;
		color.classList.add('color_box');
		color.style.backgroundColor = rgb;
		color.setAttribute('data-color', rgb);

		color.addEventListener('click', (e) => {
			let rg = getRgbaArray(e.currentTarget.getAttribute('data-color'));
			rg.pop();
			rg.push(brush.opacity);
			brush.brushColor = `rgba${rg.join(',')}`;
			// previewLayer.brush = brush;
		});
		colorPaletteContainer.appendChild(color);
	}
};

generateRandomPalete(30);

previewLayer.canvasElement.addEventListener('mouseup', setDrawModeOff);
previewLayer.canvasElement.addEventListener('mousedown', setDrawModeOn);
previewLayer.canvasElement.addEventListener('mousemove', drawOnCanvas);

iCanvas.canvasElement.addEventListener('mouseup', setDrawModeOff);

iCanvas.canvasElement.addEventListener('mousedown', setDrawModeOn);

iCanvas.canvasElement.addEventListener('mousemove', drawOnCanvas);
