import PIXI from 'pixi.js'
import game from './game'

const dotSize = 10;

// texture samples and box filter
var getTexture = (function (drawer){
	return function(color){
		drawer.beginFill(color);
		drawer.drawRect(0,0,1,1);
		drawer.endFill();
		return drawer.generateTexture();
	}
})(new PIXI.Graphics());

var dotTexture = getTexture(0x333333);
var lineTexture = getTexture(0x555555);
var lineHoverTexture = getTexture(0xaaaaaa);
var lineClickTexture = getTexture(0x999999);
var boxTexture = getTexture(0xeeeeee);

var grayFilter = new PIXI.filters.GrayFilter();
grayFilter.gray = 0.5;
var boxFilters = [grayFilter];


//add graphics to view and controller
game.initChessBoard = function (w, playerNum) {
	var i, len;

	//players
	//set a readonly texture
	var players = new Array(playerNum);
	for(i=0; i<playerNum; ++i){
		var player = {
			id: i,
			color: Math.floor(Math.random()*0xffffff)
		};
		Object.defineProperty(player, 'texture', {
			value: getTexture(player.color)
		});
		players[i] = player;
	}

	// boxes
	var boxes = new Array(w*w);
	len = boxes.length;
	for(i = 0; i<len; ++i){
		let box = new PIXI.Sprite(boxTexture);
		box.width = box.height = 2*dotSize;
		box.filters = boxFilters;

		box.position.x = i%w * 3 * dotSize + dotSize;
		box.position.y = Math.floor(i/w) * 3 * dotSize + dotSize;
		stage.addChild(box);

		boxes[i] = {
			handleView: (player) => {
				box.texture = player.texture;
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

	var lines = new Array(2*w*(w+1));
	len = lines.length;
	for(i = 0; i<len; ++i){
		let line = new PIXI.Sprite(lineTexture);
		var idInRow = i % (2*w+1);
		if(idInRow < w){
			line.width = 2*dotSize;
			line.height = dotSize;
			line.position.x = idInRow * 3 * dotSize + dotSize;
			line.position.y = Math.floor(i/(2*w+1)) * 3 * dotSize;
		}else{
			line.width = dotSize;
			line.height = 2*dotSize;
			line.position.x = (idInRow - w) * 3 * dotSize;
			line.position.y = Math.floor(i/(2*w+1)) * 3 * dotSize + dotSize;
		}

		let lineData = {
			id: i,
			handleView: (player) => {
				line.interactive = false;
				line.texture = player.texture;
			}
		};

		line.interactive = true;
		line.mouseover = onMouseOver;
		line.mouseout = onMouseOut;
		line.click = (mouseData) => {
			game.selectLine(lineData);
		};
		stage.addChild(line);

		lines[i] = lineData;
	}

	// dots
	len = (w+1)*(w+1);
	for(i = 0; i<len; ++i){
		var dot = new PIXI.Sprite(dotTexture);
		dot.width = dot.height = dotSize;

		dot.position.x = i%(w+1)*3*dotSize;
		dot.position.y = Math.floor(i/(w+1))*3*dotSize;
		stage.addChild(dot);
	}

	return {
		boxes: boxes,
		lines: lines,
		players: players
	};
};

game.destroyChessBoard = function (){

};

//generate view

var renderer = PIXI.autoDetectRenderer(600, 400, { backgroundColor:0xffffff });
var stage = new PIXI.Container();
requestAnimationFrame(animate);
function animate() {
	requestAnimationFrame(animate);
	renderer.render(stage);
}

export default renderer.view;
