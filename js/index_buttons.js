const {dialog, BrowserWindow} = require('electron').remote;
const remote = require("electron").remote;
const path = require('path');

const open_pcd_file = () => {
    dialog.showOpenDialog(null, {
        properties: ['openFile', 'createDirectory']
    }, (files) => {
        filepath = files[0];
        filename = path.parse(files[0]).base;
        extension = filename.split('.').pop();
        var isValid = extension === 'pcd';
        document.getElementById('filePath').setAttribute('color', isValid ? 'green' : 'red');
        document.getElementById('filePath').innerHTML = filename;

        if (isValid) {
            let win = new BrowserWindow({fullscreen: false, frame: false, title: "3D Cloud", width: 1200, height: 900});
            win.loadFile('cloud.html');
        } else {
            dialog.showErrorBox('Invalid extension ' + extension, "Only .pcd extension is supported!");
        }

        remote.getGlobal('shareObj').filename = filename;
        remote.getGlobal('shareObj').filepath = filepath;
        remote.getGlobal('shareObj').extension = extension;
    });
};

const create_window = (template) => {
    // Create the browser window.
    let win = new remote.BrowserWindow({ fullscreen : false, resizable : true });
    // and load the index.html of the app.
    win.loadFile(template);
};

document.querySelector('#selectBtn').addEventListener('click', open_pcd_file);
document.querySelector('#preferenceBtn').onclick = () => {create_window("config.html");};
