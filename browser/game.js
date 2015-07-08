import _ from 'lodash';
import { domObj, initChessBoard, destroyChessBoard } from './view';

var EventEmitter = require('events');
var ipc = require('ipc');

const defaultOptions = {
	playerNum: 2,
	size: 4
};

class Game extends EventEmitter{
	constructor(){
    super();
		this.size = 0;
		this.curPlyrId = 0;
		this.linesleft = 0;

		this.boxes = undefined;

		this.lines = undefined;

		this.players = undefined;
	}

	init(options) {
		options || (options = {});
		_.defaults(options, defaultOptions);
		_.assign(this, initChessBoard(options.size, options.playerNum, this.selectLine.bind(this)));

		this.size = options.size;
		this.linesleft = this.lines.length;
		this.players.forEach(function(player, id){
			player.score = 0;
		});
		this.lines.forEach(function(line){
			line.owner = -1;
		});
    var playerColors = _.map(this.players, 'color');
    this.emit('init', playerColors);
	}

  reset() {
    this.linesleft = this.lines.length;
    this.players.forEach(function(player, id){
      player.score = 0;
    });
    this.lines.forEach(function(line){
      line.owner = -1;
    });
    this.resetView();
    this.emit('reset');
  }

	selectLine(line) {
		if(line.owner !== -1)return;
		var checkList = [];

		var _this = this;
		var curPlyr = _this.players[_this.curPlyrId];

		//pocess line
		line.owner = _this.curPlyrId;
		_this.linesleft--;
		line.handleView(curPlyr);

		//check line
		var id = line.id;
		var w = _this.size;
		if(id % (2*w+1) < w){// above and below
			if(id >= w){
				checkList.push({
					lines: [id-(2*w+1), id-(w+1), id-w],
					boxId: w * ( Math.floor(id/(2*w+1)) -1 ) + id % (2*w+1)
				});
			}
			if(id < w*(2*w+1)){
				checkList.push({
					lines: [id+(2*w+1), id+(w+1), id+w],
					boxId: w * Math.floor(id/(2*w+1)) + id % (2*w+1)
				});
			}
		}else{//left and right
			if(id%(2*w+1) != w){
				checkList.push({
					lines: [id-(w+1), id+w, id-1],
					boxId: w * Math.floor(id/(2*w+1)) + id % (2*w+1) - (w + 1)
				});
			}
			if(id%(2*w+1) != 2*w){
				checkList.push({
					lines: [id+(w+1), id-w, id+1],
					boxId: w * Math.floor(id/(2*w+1)) + id % (2*w+1) - w
				});
			}
		}

		var winThisRound = false;
		checkList.forEach((e) => {
			if(e.lines.every( (lineId) => {
				return _this.lines[lineId].owner != -1;
			})){
				winThisRound = true;
				curPlyr.score++;
				_this.boxes[e.boxId].handleView(curPlyr);
			}
		});

		if(!winThisRound){
			_this.curPlyrId = (_this.curPlyrId + 1)%_this.players.length;
      _this.emit('turn', _this.curPlyrId);
		}

		if(_this.linesleft == 0){
			var scoreGrp = _.groupBy(_this.players, 'score');
			var maxScore = _.max(Object.keys(scoreGrp));
			var winner = _.max(scoreGrp[maxScore], 'id');
      _this.emit('win', winner.id);
		}
	}

  get view(){
    return domObj;
  }
}

var game = new Game();

ipc.on('resize', (size) => {
  game.init({
    playerNum: game.playerNum,
    size: size
  });
});

//reset game without any options
ipc.on('reset', () => {
  game.reset();
});

export default game;
