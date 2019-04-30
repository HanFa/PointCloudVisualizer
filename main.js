const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const create_window = (template) => {
    // Create the browser window.
    let win = new BrowserWindow({ fullscreen : false, resizable : true });
    // and load the index.html of the app.
    win.loadFile(template);
};


menu_template = [
    {
        label: "Point Cloud Visualizer",
        submenu: [
            {
                label: 'Preference',
                click: () => { create_window("config.html"); },
                accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,'
            },
            {role: 'toggledevtools'},
            {role: 'quit'},
            {role: 'close'}
        ]
    },
];

const menu = Menu.buildFromTemplate(menu_template);
Menu.setApplicationMenu(menu);

const initGlobalShareObj = (event, arg) => {
    global.shareObj = {
        filenames : null,
        filepaths : null,
        extensions : null,
    };
};

const setGlobalShareObj = (event, data) => {
    global.shareObj = data;
};


initGlobalShareObj();
setGlobalShareObj();

ipcMain.on('init-global-share-object', initGlobalShareObj);
ipcMain.on('set-global-share-object', setGlobalShareObj);


app.on('ready', () => {
    create_window("index.html");
});

app.on('close', () => {
    app.quit();
});

