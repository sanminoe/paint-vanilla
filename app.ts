let canvasContainer = document.querySelector('.canvas__container');
let isMouseDown = false;

// Brush Controls
let inputBrushSize: HTMLInputElement = document.querySelector('#size');
let inputBrushOpacity: HTMLInputElement = document.querySelector('#opacity');

let toolsButtons = document.querySelectorAll('.tool_btn');

const colorPaletteContainer = document.querySelector('.color_palette__container');

let opacityBrush = 1;
let finishLine = false;

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
		this.context.imageSmoothingEnabled = false;
	}

	drawBrushPreview(points?): void {
		let mousePosX = this.mouseX - this.left - this.brush.brushSize / 2;
		let mousePosY = this.mouseY - this.top - this.brush.brushSize / 2;
		this.context.globalCompositeOperation = 'source-over';
		this.context.clearRect(0, 0, this.width, this.height);
		if (this.mode === 'pen') {
			// Brush Preview Outline
			this.context.strokeStyle = 'rgb(222,222,222)';
			this.context.beginPath();
			this.context.arc(mousePosX, mousePosY, Math.PI * this.brush.brushSize, 0, Math.PI * 2, false);
			this.context.lineWidth = 3;
			this.context.closePath();
			this.context.stroke();

			// Brush Fill
			this.context.fillStyle = this.brush.color;
			this.context.beginPath();
			this.context.arc(mousePosX, mousePosY, Math.PI * this.brush.brushSize, 0, Math.PI * 2, false);
			this.context.lineWidth = 3;
			this.context.closePath();
			this.context.fill();
		} else if (this.mode === 'line' && points.length > 0 && finishLine === true) {
			// line Tool
			this.context.beginPath();

			this.context.strokeStyle = this.brush.color;
			this.context.lineWidth = this.brush.brushSize;

			this.context.moveTo(points[0].x, points[0].y);
			this.context.lineTo(mousePosX, mousePosY);
			this.context.stroke();
		} else if (this.mode === 'polygon' && points.length > 0 && finishLine === true) {
			// Polygon Tool
			this.context.beginPath();

			this.context.strokeStyle = this.brush.color;
			this.context.lineWidth = this.brush.brushSize;

			this.context.moveTo(points[0].x, points[0].y);
			// Iterate

			for (let i = 1; i < points.length; i++) {
				this.context.lineTo(points[i].x, points[i].y);
			}
			let lastPointX = points[0].x;
			let lastPointY = points[0].y;
			let distancefinal = distance(mousePosX, mousePosY, lastPointX, lastPointY);
			// console.log(distancefinal);

			// Poligon Tool

			this.context.lineTo(mousePosX, mousePosY);

			this.context.closePath();

			this.context.stroke();
		}
	}
	drawLinePreview(): void {}
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

class Tool {
	layer: Canvas;
	private tools: Object;
	currentTool: string;
	mode: string;
	brush: BrushShape;
	distance: number;
	isNearStartPoint: boolean;
	constructor(layer, brush) {
		this.tools = {
			pen: 0,
			eraser: 0,
			line: 0
		};
		this.brush = brush;
		this.currentTool = 'pen';
		this.layer = layer;
	}
	set tool(current) {
		this.currentTool = current;
	}
	draw(points?) {
		let mousePosX = this.layer.mouseX - this.layer.left - this.brush.brushSize / 2;
		let mousePosY = this.layer.mouseY - this.layer.top - this.brush.brushSize / 2;
		if (this.currentTool === 'pen') {
			// ctx.fillRect(mouseX, mouseY, 10, 10);
			this.layer.context.beginPath();
			this.layer.context.arc(mousePosX, mousePosY, Math.PI * this.brush.brushSize, 0, Math.PI * 2, false);
			this.layer.context.closePath();
			this.layer.context.fillStyle = this.brush.color;
			this.layer.context.fill();
		} else if (this.currentTool === 'eraser') {
			this.layer.context.beginPath();
			this.layer.context.arc(mousePosX, mousePosY, Math.PI * this.brush.brushSize, 0, Math.PI * 2, false);
			this.layer.context.closePath();
			this.layer.context.fillStyle = 'rgba(255,255,255,1)';
			this.layer.context.fill();
		} else if (this.currentTool === 'line' && points.length > 0 && finishLine === true) {
			// line Tool

			this.layer.context.beginPath();

			this.layer.context.strokeStyle = this.brush.color;
			this.layer.context.fillStyle = this.brush.color;

			this.layer.context.lineWidth = this.brush.brushSize;
			// Starting Point
			this.layer.context.moveTo(points[0].x, points[0].y);

			// Iterate
			this.layer.context.lineTo(points[1].x, points[1].y);

			this.layer.context.stroke();
			// End
		} else if (this.currentTool === 'polygon' && points.length > 0 && finishLine === true) {
			this.layer.context.beginPath();

			this.layer.context.strokeStyle = this.brush.color;
			this.layer.context.fillStyle = this.brush.color;

			this.layer.context.lineWidth = this.brush.brushSize;
			// Starting Point
			this.layer.context.moveTo(points[0].x, points[0].y);
			for (let i = 1; i < points.length; i++) {
				// Iterate
				this.layer.context.lineTo(points[i].x, points[i].y);
			}
			let lastPointX = points[0].x;
			let lastPointY = points[0].y;
			this.distance = distance(mousePosX, mousePosY, lastPointX, lastPointY);

			this.layer.context.closePath();

			this.layer.context.stroke();
		}
	}
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// line is made of 1 array of 2 point [Start point | Following points]
// When the user click create a point(Start Point).
// then user click again  draw the lines until user press enter

class Point {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		return this;
	}
}

const brush = new BrushShape('circle', +inputBrushSize.value, `rgba(0,0,0,${+inputBrushOpacity.value})`);
brush.brushColor = 'rgba(0,0,0,1)';

// Drawing Layer
let iCanvas = new Canvas(600, 600, canvasContainer, brush, 'pen');

// Preview Brush Layer
const previewLayer = new Canvas(600, 600, canvasContainer, brush, 'pen');

let cords = [];
let tool = new Tool(iCanvas, brush);
toolsButtons.forEach((btn) => {
	btn.addEventListener('click', (e: Event) => {
		let current: any = e.currentTarget;
		tool.currentTool = current.getAttribute('data-tool');
		iCanvas.drawingMode = current.getAttribute('data-tool');
		previewLayer.drawingMode = current.getAttribute('data-tool');
		cords = [];
		iCanvas.count = 0;
	});
});

function drawOnCanvas(e: MouseEvent) {
	iCanvas.setMousePosition(e.clientX, e.clientY);
	previewLayer.setMousePosition(e.clientX, e.clientY);
	if (isMouseDown && (tool.currentTool === 'pen' || tool.currentTool === 'eraser')) {
		tool.draw();
	}

	previewLayer.drawBrushPreview(cords);
}
let setDrawModeOn = () => {
	// if mouse is down Draw

	cords.push(new Point(iCanvas.mouseX - iCanvas.left, iCanvas.mouseY - iCanvas.top));

	if (tool.currentTool === 'line' && cords.length == 2) {
		tool.draw(cords);
		cords = [];
		iCanvas.count = 0;
		finishLine = false;
	} else {
		finishLine = true;
	}

	isMouseDown = true;
};

let setDrawModeOff = () => {
	iCanvas.count += 1;
	isMouseDown = false;
};
// Events

window.addEventListener('keyup', (e) => {
	let key = e.key;

	if (key === 'Enter') {
		finishLine = true;
		console.log(brush.size);
		if (tool.currentTool === 'polygon' && cords.length > 1) {
			tool.draw(cords);
			cords = [];
			iCanvas.count = 0;
			finishLine = false;
		}
	}
});

inputBrushOpacity.addEventListener('change', (e: Event) => {
	let oldBrush = brush.color;
	let newBrushColor = [ ...getRgbaArray(oldBrush) ];
	let current: any = e.currentTarget;
	newBrushColor.pop();
	newBrushColor.push(+current.value);
	brush.brushColor = `rgba${newBrushColor.join(',')}`;
	brush.brushOpacity = +current.value;
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
