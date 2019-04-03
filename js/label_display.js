const config_json = require("./config/label_settings");

const component_to_hex = (c) => {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
};

const rgb_to_hex = (r, g, b) => {
    return "#" + componentToHex(parseInt(r * 255)) +
        componentToHex(parseInt(g * 255)) + componentToHex(parseInt(b * 255));
};

const rgb_to_html_color = (rgb) => {
    return rgbToHex(... rgb);
};

Object.keys(config_json.points.color).forEach((key) => {
    var div = document.createElement('a');
    var node = document.createTextNode(key);
    div.appendChild(node);
    div.style.backgroundColor = rgb_to_html_color(config_json.points.color[key]);
    document.getElementsByClassName("label-panel")[0].appendChild(div);
});

