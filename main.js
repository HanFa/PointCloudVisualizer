const { app, BrowserWindow } = require('electron');

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({ fullscreen : false, width : 500, height : 300, resizable : true });
  // and load the index.html of the app.
  win.loadFile('index.html');
}


global.shareObj = {filename : null, filepath : null, extension : null};
app.on('ready', createWindow);
app.on('close', ()=> {
  app.quit();
});



