function log(msg) {
	const logger = document.getElementById("logger");
	logger.textContent = `${msg}\n${logger.textContent}`;
}

function logerr(err) {
	log(`ERROR: ${err}`);
}

function getCssStyle(target) {
	const cssRules = document.styleSheets[0].cssRules;
	for (let i = 0; i < cssRules.length; ++i) {
		if (cssRules[i].selectorText == target) {
			return cssRules[i].style;
		}
	}
}

function insertTouches(touches, arr) {
	for (let i = 0; i < touches.length; ++i) {
		arr[touches[i].identifier] = [
			touches[i].pageX,
			touches[i].pageY,
		];
	}
}

function removeTouches(touches, arr) {
	for (let i = 0; i < touches.length; ++i) {
		arr.splice(touches[i].identifier, 1);
	}
}

function canvasCssTransform(x, y, s) {
	return `translate(${x}px, ${y}px) scale(${s})`;
}

function download() {}

document.addEventListener("DOMContentLoaded", () => {
	let windowW = window.innerWidth;
	let windowH = window.innerHeight;

	let canvasW = 32;
	let canvasH = 32;
	let canvasCx = windowW/2;
	let canvasCy = windowH/2;
	let canvasS = 0.8 * Math.min(windowW/canvasW, windowH/canvasH);
	let canvasX = canvasCx - canvasW/2;
	let canvasY = canvasCy - canvasH/2;


	window.addEventListener("resize", (event) => {
		windowW = window.innerWidth;
		windowH = window.innerHeight;
	});

	const canvas = document.getElementById("pixelcanvas");
	canvas.width = canvasW;
	canvas.height = canvasH;

	const cssStyle = getCssStyle("canvas#pixelcanvas");
	if (!cssStyle) {
		logerr("css rule for canvas#canvas not found.");
		throw new Error("css rule for canvas#canvas not found.");
	}

	cssStyle.transform = canvasCssTransform(canvasX, canvasY, canvasS);

	const context = canvas.getContext("2d");

	for (let j = 0; j < canvasH; ++j) {
		for (let i = 0; i < canvasW; ++i) {
			if ((i + j) % 2 == 0) { context.fillStyle = "#4C4C4C"; }
			else { context.fillStyle = "#4C4C4C"; }
			context.fillRect(i, j, 1, 1);
		}
	}

	const activeTouches = [];

	canvas.addEventListener("touchstart", (event) => {
		event.preventDefault();
		insertTouches(event.changedTouches, activeTouches);
	});

	canvas.addEventListener("touchmove", (event) => {
		event.preventDefault();
		if (event.touches.length == 1) {
			const pageDx = event.changedTouches[0].pageX - activeTouches[event.changedTouches[0].identifier][0];
			const pageDy = event.changedTouches[0].pageY - activeTouches[event.changedTouches[0].identifier][1];
			// if (Math.sqrt(pageDx*pageDx+pageDy*pageDy) < 1) { return; }
			// log(`${Math.sqrt(pageDx*pageDx+pageDy*pageDy)}`);
			const dx = event.changedTouches[0].pageX - canvasCx;
			const dy = event.changedTouches[0].pageY - canvasCy;
			const i = Math.floor((dx + (1 + canvasS/2) * canvasW)/canvasS);
			const j = Math.floor((dy + (1 + canvasS/2) * canvasH)/canvasS);
			if ((0 <= i && i <= canvasW-1) && (0 <= j && j <= canvasH-1)) {
				context.fillStyle = "#FFCC55";
				context.fillRect(i, j, 1, 1);
			}
		} else if (event.changedTouches.length == 2) {
			const pPageX0 = activeTouches[event.changedTouches[0].identifier][0];
			const pPageY0 = activeTouches[event.changedTouches[0].identifier][1];
			const pPageX1 = activeTouches[event.changedTouches[1].identifier][0];
			const pPageY1 = activeTouches[event.changedTouches[1].identifier][1];

			const pageX0 = event.changedTouches[0].pageX;
			const pageY0 = event.changedTouches[0].pageY;
			const pageX1 = event.changedTouches[1].pageX;
			const pageY1 = event.changedTouches[1].pageY;

			const pageX = (pageX0 + pageX1)/2;
			const pageY = (pageY0 + pageY1)/2;
			const pPageX = (pPageX0 + pPageX1)/2;
			const pPageY = (pPageY0 + pPageY1)/2;

			const size = (pageX0-pageX1)*(pageX0-pageX1) + (pageY0-pageY1)*(pageY0-pageY1);
			const pSize = (pPageX0-pPageX1)*(pPageX0-pPageX1) + (pPageY0-pPageY1)*(pPageY0-pPageY1);
			const s = Math.sqrt(size)/Math.sqrt(pSize);

			canvasCx += (pageX - pPageX);
			canvasCy += (pageY - pPageY);

			canvasCx -= (s - 1) * (pageX - canvasCx);
			canvasCy -= (s - 1) * (pageY - canvasCy);

			canvasS *= s;
			canvasX = canvasCx - canvasW/2;
			canvasY = canvasCy - canvasH/2;
			cssStyle.transform = canvasCssTransform(canvasX, canvasY, canvasS);
			insertTouches(event.changedTouches, activeTouches);
		}
	});

	canvas.addEventListener("touchend", (event) => {
		event.preventDefault();
		removeTouches(event.changedTouches, activeTouches);
	});

	canvas.addEventListener("touchcancel", (event) => {
		event.preventDefault();
		removeTouches(event.changedTouches, activeTouches);
	});

	// const anchor = document.getElementById("downloadanchor");
	// anchor.download = "something";
	// anchor.type = "image/png";
	// canvas.width = 512;
	// canvas.height = 512;
	// const imageData = canvas.getImageData();
	// const scale = 512/canvasW;
	// canvas.width = scale*canvasW;
	// canvas.height = scale*canvasH;
	// const ctx2 = canvas.getContext("2d");
	// const ctx2 = context;
	// for (let j = 0; j < canvasW; ++j) {
	// 	for (let i = 0; i < 0; ++i) {
	// 		const k = j * canvasW + i;
	// 		ctx2.fillStyle = "#ffffff";
	// 		ctx2.fillRect(i, j, scale, scale);
	// 	}
	// }
	// anchor.href = canvas.toDataURL();
	// canvas.width = canvasW;
	// canvas.height = canvasH;
	// canvas.putImageData(imageData);
})
