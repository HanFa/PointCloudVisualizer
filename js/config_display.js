const fs = require("fs");
const config_json = require("./config/label_settings");
const path = require("path");

window.onload = () => {
    document.querySelector("#cameraUpX").value = config_json.camera.up[0];
    document.querySelector("#cameraUpY").value = config_json.camera.up[1];
    document.querySelector("#cameraUpZ").value = config_json.camera.up[2];

    document.querySelector("#pointSizeBox").innerHTML = document.querySelector("#pointSizeBar").value / 1000;
    document.querySelector("#pointSizeBar").oninput = (val) => {
        config_json.points.size = document.querySelector("#pointSizeBar").value / 1000;
        document.querySelector("#pointSizeBox").innerHTML = document.querySelector("#pointSizeBar").value / 1000;
    };

    let label_color_div = document.querySelector("#pointsColors");

    Object.keys(config_json.points.color).forEach((value, index) => {
        var ele = document.createElement('a');
        ele.appendChild(document.createTextNode(index + "\t" + value));
        label_color_div.appendChild(ele);
        let color_input = document.createElement('input');
        color_input.setAttribute('type', 'color');
        var color_arr = config_json.points.color[value];
        color_input.value = rgb_to_html_color(color_arr);

        color_input.oninput = (hex_color) => {
            config_json.points.color[value] = html_color_to_rgb(color_input.value);
        };

        label_color_div.appendChild(color_input);
        label_color_div.appendChild(document.createElement('br'))
    });

    document.querySelector("#cameraUpUpdate").onclick = () => {
        config_json.camera.up = [
            document.querySelector("#cameraUpX").value,
            document.querySelector("#cameraUpY").value,
            document.querySelector("#cameraUpZ").value];
        fs.writeFile(path.join(__dirname, "config/label_settings.json"), JSON.stringify(config_json, null, 1), (err) => {
            if (err)
                alert("Unable to update json config! Error: " + err.toString());
            else
                alert("Preference has been updated!");
            window.close();
        });
    };

};

