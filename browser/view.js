import PIXI from 'pixi.js';

const dotSize = 15;
const boxMultiple = 3;

//renderer
//generate view
var renderer = PIXI.autoDetectRenderer(600, 400, { backgroundColor:0xffffff });
var domObj = renderer.view;

var initialized;
var stage = new PIXI.Container();
stage.position.x = stage.position.y = dotSize;

//enter frame
var requestHandle = 0;
function play(){
  if(!requestHandle) animate();
}

function pause(){
  if(requestHandle) {
    cancelAnimationFrame(requestHandle);
    requestHandle = 0;
  }
}

function animate() {
  requestHandle = requestAnimationFrame(animate);
  renderer.render(stage);
}


// texture samples and box filter
var getTexture = (function (drawer){
	return function(color){
		drawer.beginFill(color);
		drawer.drawRect(0,0,1,1);
		drawer.endFill();
		return drawer.generateTexture();
	}
})(new PIXI.Graphics());

function getDistinctColors (num) {
  //hue to rgb
  var colors = [];
  var s = 0.7, l = 0.5; //saturation and lightness
  var hueOffset = Math.random()*360;
  for(var i = 0; i < 360; i += 360 / num) {
    var hue = (i + hueOffset)%360/360;
    var q = l + Math.min(l, 1-l) * s;
    var p = 2*l-q;
    var rgb = [ ((hue + 1/3)%1 +1)%1, (hue%1 +1)%1, ((hue - 1/3)%1 +1)%1 ];
    rgb.forEach((color, i, rgb) => {
      if(color < 1/6){
        rgb[i] = p + (q-p)*6*color;
      }else if(color >= 1/6 && color < 0.5){
        rgb[i] = q;
      }else if(color >=0.5 && color < 2/3){
        rgb[i] = p + (q-p)*6*(2/3-color);
      }else{
        rgb[i] = p;
      }
    });
    colors.push((Math.floor(rgb[0]*0xff) << 16) + (Math.floor(rgb[1]*0xff) << 8) + Math.floor(rgb[2]*0xff));
  }
  return colors;
}

var dotTexture = getTexture(0x333333);
var lineTexture = getTexture(0x555555);
var lineHoverTexture = getTexture(0xaaaaaa);
var lineClickTexture = getTexture(0x999999);
var boxTexture = getTexture(0xeeeeee);

var grayFilter = new PIXI.filters.GrayFilter();
grayFilter.gray = 0.5;
var boxFilters = [grayFilter];


//add graphics to view and controller
function initChessBoard(w, playerNum, selectLine) {
  if(initialized) destroyChessBoard();
  var viewSize = ((boxMultiple+1)*w+3)*dotSize;
  renderer.resize(viewSize, viewSize);

	var i, len;

	//players
	//set a readonly texture
	var players = getDistinctColors(playerNum);
  players = players.map((color, i) =>
    Object.defineProperties({}, {
      id: {
        value: i,
        enumerable: true
      },
      color: {
        value: color,
        enumerable: true
      },
      texture: {
        value: getTexture(color)
      }
    })
  );

	// boxes
	var boxes = new Array(w*w);
	len = boxes.length;
	for(i = 0; i<len; ++i){
		let box = new PIXI.Sprite(boxTexture);
		box.width = box.height = boxMultiple*dotSize;
		box.filters = boxFilters;

		box.position.x = i%w * (1+boxMultiple) * dotSize + dotSize;
		box.position.y = Math.floor(i/w) * (1+boxMultiple) * dotSize + dotSize;
		stage.addChild(box);

		boxes[i] = {
			handleView: (player) => {
				box.texture = player.texture;
			},
      reset: () => {
        box.texture = boxTexture;
      }
		};
	}

	// lines
	function onMouseOver(mouseData) {
		this.texture = lineHoverTexture;
	}

	function onMouseOut(mouseData) {
		this.texture = lineTexture;
	}

  function onMouseDown(mouseData) {
    this.texture = lineClickTexture;
  }

	var lines = new Array(2*w*(w+1));
	len = lines.length;
	for(i = 0; i<len; ++i){
		let line = new PIXI.Sprite(lineTexture);
		var idInRow = i % (2*w+1);
		if(idInRow < w){
			line.width = boxMultiple*dotSize;
			line.height = dotSize;
			line.position.x = idInRow * (1+boxMultiple) * dotSize + dotSize;
			line.position.y = Math.floor(i/(2*w+1)) * (1+boxMultiple) * dotSize;
		}else{
			line.width = dotSize;
			line.height = boxMultiple*dotSize;
			line.position.x = (idInRow - w) * (1+boxMultiple) * dotSize;
			line.position.y = Math.floor(i/(2*w+1)) * (1+boxMultiple) * dotSize + dotSize;
		}

		let lineData = {
			id: i,
			handleView: (player) => {
				line.interactive = false;
				line.texture = player.texture;
			},
      reset: () => {
        line.interactive = true;
        line.texture = lineTexture;
      }
		};

		line.interactive = true;
		line.mouseover = onMouseOver;
		line.mouseout = onMouseOut;
    line.mousedown = onMouseDown;
		line.click = (mouseData) => {
			selectLine(lineData);
		};
		stage.addChild(line);

		lines[i] = lineData;
	}

	// dots
	len = (w+1)*(w+1);
	for(i = 0; i<len; ++i){
		var dot = new PIXI.Sprite(dotTexture);
		dot.width = dot.height = dotSize;

		dot.position.x = i%(w+1)*(1+boxMultiple)*dotSize;
		dot.position.y = Math.floor(i/(w+1))*(1+boxMultiple)*dotSize;
		stage.addChild(dot);
	}

  function resetView() {
    lines.forEach((line) => {
      line.reset();
    });
    boxes.forEach((box) => {
      box.reset();
    });
  }

  initialized = true;
  play();

	return {
		boxes: boxes,
		lines: lines,
		players: players,
    resetView: resetView
	};
}

function destroyChessBoard(){
  pause();
  renderer.render(stage);
  stage.removeChildren(); // This is an official bug, never mind.
  initialized = false;
}

export { domObj, initChessBoard, destroyChessBoard };
