import game from './game';
import initPlayerList from 'playerList';

var remote = require('remote');
var Menu = remote.require('menu');

var options = {
  playerNum: 2,
  size: 2
};

document.getElementById('view').appendChild(game.view);
initPlayerList(document.getElementById('playerList'));

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
          window.open('settings/settings.html');
        }
      }
    ]
  }
]);
Menu.setApplicationMenu(mainMenu);

game.init();
