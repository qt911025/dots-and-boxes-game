import game from './game';

document.getElementById('view').appendChild(game.view);

var playerList = document.getElementById('playerList');

//set player name
var input = document.createElement('input');
input.setAttribute('type', 'text');
input.addEventListener('blur', deactivateInput);
input.addEventListener('keypress', (event) => {
  if(event.type === 'keypress'|| event.keyCode === 13){
    input.blur();
  }
});

function deactivateInput (event){
  var _this = event.target;
  var parent = _this.parentNode;
  event.preventDefault(); //prevent from blur when press enter
  if(parent){
    parent.removeChild(_this);
    var text = document.createTextNode(_this.value.toString() || _this.originValue.toString());
    parent.appendChild(text);
  }
}

function spanOnClick(event) {
  var _this = event.currentTarget;
  if(input.parentNode == _this) return;
  input.value = _this.innerHTML;
  input.originValue = _this.innerHTML;
  while(_this.firstChild){
    _this.removeChild(_this.firstChild);
  }
  _this.appendChild(input);
  input.focus();
}

//add player panel
game.on('init', (colors) => {
  //clear out
  var names = [], span;
  input.blur();
  while(playerList.firstChild){
    span = playerList.firstChild.firstChild;
    names.push(span.innerHTML);
    span.removeEventListener('click', spanOnClick);
    playerList.removeChild(playerList.firstChild);
  }

  var i, //Why can't I claim this in loop?
    len = colors.length;
  for(i=0; i<len; ++i) {
    var playerInfo = document.createElement('div');
    playerInfo.classList.add('player-panel');
    playerInfo.style.backgroundColor = '#'+colors[i].toString(16);
    span = document.createElement('span');
    span.innerHTML = i<names.length ? names[i] : 'Enter your name';
    span.addEventListener('click', spanOnClick);
    playerInfo.appendChild(span);
    playerList.appendChild(playerInfo);
  }
  resetPlayerState();
});

var curPlyr = 0;
var winner = 0;

game.on('turn', (id) => {
  playerList.children[curPlyr].classList.remove('in-turn');
  curPlyr = id;
  playerList.children[curPlyr].classList.add('in-turn');
});

game.on('win', (id) => {
  winner = id;
  playerList.children[id].classList.add('winner');
});

//reset without changing of options
function resetPlayerState() {
  playerList.children[curPlyr].classList.add('in-turn');
  playerList.children[winner].classList.remove('winner');
}
game.on('reset', resetPlayerState);


game.init();
