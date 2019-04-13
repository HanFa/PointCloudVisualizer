const { app, BrowserWindow, Menu } = require('electron');

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

global.shareObj = {filename : null, filepath : null, extension : null, headers : null };
app.on('ready', () => {create_window("index.html");});
app.on('close', () => {
    app.quit();
});

