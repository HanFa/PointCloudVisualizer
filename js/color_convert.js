const component_to_hex = (c) => {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
};

const rgb_to_hex = (r, g, b) => {
    return "#" + component_to_hex(parseInt(r * 255)) +
        component_to_hex(parseInt(g * 255)) + component_to_hex(parseInt(b * 255));
};

const rgb_to_html_color = (rgb) => {
    return rgb_to_hex(... rgb);
};

const html_color_to_rgb = (html_color) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(html_color);
    return result ? [
        parseInt(result[1], 16) / 255.0,
        parseInt(result[2], 16) / 255.0,
        parseInt(result[3], 16) / 255.0
    ] : null;
};