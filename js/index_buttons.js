const path = require('path');
const {remote, ipcRenderer} = require('electron');
const {dialog, BrowserWindow} = remote;
const $ = require('jquery');

const openPCDFiles = () => {
    ipcRenderer.send('init-global-share-object');

    let info = {
        filenames : [],
        filepaths : [],
        extensions : [],
    };

    dialog.showOpenDialog(null, {
        properties: ['openFile', 'createDirectory', 'multiSelections']
    }, (files) => {
        var allValid = true;
        var filePathElem = $("#filePath");
        filePathElem.empty();
        var invalidExtensions = [];

        files.forEach((filepath) => {
            var filename = path.parse(filepath).base;
            var extension = filename.split('.').pop();
            var isValid = extension === 'pcd';
            if (!isValid) {
                allValid = false;
                invalidExtensions.push(extension);
            }

            var div = $("<div></div>").text(filename + "\n");
            div.css('color', (isValid ? "green" : "red"));
            filePathElem.append(div);
            info.filenames.push(filename);
            info.filepaths.push(filepath);
            info.extensions.push(extension);
        });

        if (allValid) {
            let win = new BrowserWindow({
                fullscreen: false, frame: false,
                title: "3D Cloud", width: 1200, height: 900});
            win.loadFile('cloud.html');
            ipcRenderer.send('set-global-share-object', info);
        } else {
            dialog.showErrorBox('Invalid extension ' + invalidExtensions,
                " Only .pcd extension is supported!");
        }
    });
};

$("#selectBtn").click(openPCDFiles);
$("#preferenceBtn").click(() => {
    ipcRenderer.send('open-config');
});