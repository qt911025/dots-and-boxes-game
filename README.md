# dots-and-boxes-game

> A simple Dots & Boxes game made with [Electron](http://electron.atom.io/), [jspm](http://jspm.io/), [Babel](https://babeljs.io) and [PIXI.js](https://github.com/GoodBoyDigital/pixi.js)

## Before you use it
1. Run `$ npm install`
2. In `browser/config.js`, set configuration `baseUrl` to `__dirname + '/'`
3. In `browser/jspm_packages/system.src.js`, modify line 1202

```javascript
// if on the server, remove the "file:" part from the dirname
if (System._nodeRequire)
  dirname = dirname.substr(5);
```

to

```javascript
// if on the server, remove the "file:" part from the dirname
if (System._nodeRequire && dirname.substr(0, 5) == 'file:')
  dirname = dirname.substr(5);
```

### Run

```
$ npm start
```
or debug using `$ npm run debug`

### Build

```
$ npm run build
```


## License

MIT © [QuenTine](http://quentine.me)
