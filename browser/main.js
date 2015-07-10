import game from './game';
import initPlayerList from 'playerList';

var remote = require('remote');
var Menu = remote.require('menu');

var options = {
  playerNum: 2,
  size: 2
};

var viewDiv = document.getElementById('view');
viewDiv.appendChild(game.view);
initPlayerList(document.getElementById('playerList'));

//settings
var settingsElem = document.getElementById('settings');
settingsElem.addEventListener('submit', (event) => {
  event.preventDefault();
  options.playerNum = Number(document.getElementById('playerNum').value);
  options.size = Number(document.getElementById('size').value);
  settingsElem.classList.add('hidden');
  game.init(options);
});

document.getElementById('settings-cancel').addEventListener('click', () => {
  settingsElem.classList.add('hidden');
});

//game menus
var mainMenu = Menu.buildFromTemplate([
  {
    label: 'Game',
    submenu: [
      {
        label: 'New Game',
        click: () => game.reset()
      },
      {
        label: 'Settings',
        click: () => {
          settingsElem.classList.toggle('hidden');
        }
      }
    ]
  }
]);
Menu.setApplicationMenu(mainMenu);

//resize current window
var curWindow = remote.getCurrentWindow();
game.on('init', () => {
  curWindow.setContentSize(viewDiv.offsetWidth+200, Math.max(viewDiv.offsetHeight, options.playerNum*50));
});

game.init(options);
