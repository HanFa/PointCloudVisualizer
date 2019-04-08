const config_json = require("./config/label_settings");

const display_panels = () => {
    var div = document.createElement('a');
    var node = document.createTextNode("Point Labels: ");
    div.appendChild(node);
    document.getElementsByClassName("label-panel")[0].appendChild(div);

    label_elements = [];
    let share_obj = require('electron').remote.getGlobal('shareObj');

    const path_panel = document.querySelector("#path-panel");
    path_panel.appendChild(document.createTextNode(share_obj.filepath));

    const field_panel = document.querySelector("#field-panel");
    console.log("Not ok " + share_obj.headers);
    field_panel.appendChild(document.createTextNode(share_obj.headers));


    Object.keys(config_json.points.color).forEach((key) => {
        var div = document.createElement('a');
        var node = document.createTextNode(key);
        div.appendChild(node);
        div.style.backgroundColor = rgb_to_html_color(config_json.points.color[key]);
        document.getElementsByClassName("label-panel")[0].appendChild(div);
        label_elements.push(div);
    });
};



